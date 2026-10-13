"""
Consumers
=========
WebSocket consumers for real-time chat.
"""

import json
import logging

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

from chat.services import save_message
from chat.selectors import is_blocked, get_or_create_conversation
from chat.models import GroupMembership

logger = logging.getLogger(__name__)


def _user_exists(user_id: int) -> bool:
    from users.models import User
    return User.objects.filter(pk=user_id).exists()


def _save_group_message_if_member(sender_id: int, group_id: int, content: str):
    """Membership re-check + save in ONE thread hop (None if no longer a member)."""
    if not GroupMembership.objects.filter(group_id=group_id, user_id=sender_id).exists():
        return None
    return save_message(sender_id=sender_id, content=content, group_id=group_id)


def _send_direct_message(sender_id: int, other_user_id: int, content: str):
    """Block check + conversation lookup + message save in ONE thread hop.

    With CONN_MAX_AGE=0 every database_sync_to_async call opens (and closes)
    its own DB connection, so three separate hops meant three reconnects.
    Returns None when the recipient has blocked the sender.
    """
    if is_blocked(other_user_id, sender_id):
        return None
    conv = get_or_create_conversation(sender_id, other_user_id)
    return save_message(
        sender_id=sender_id,
        content=content,
        conversation_id=conv.id,
        participant_ids=(conv.user1_id, conv.user2_id),
    )


class ChatConsumer(AsyncWebsocketConsumer):
    """Handles 1-on-1 WebSocket chat."""

    async def connect(self):
        self.user = self.scope["user"]
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        self.other_user_id = int(self.scope["url_route"]["kwargs"]["user_id"])
        if not await database_sync_to_async(_user_exists)(self.other_user_id):
            await self.close()
            return
        self.room_name = f"chat_{min(self.user.id, self.other_user_id)}_{max(self.user.id, self.other_user_id)}"
        self.room_group_name = f"chat_{self.room_name}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        content = data.get("content", "").strip()
        if not content:
            return

        message = await database_sync_to_async(_send_direct_message)(
            self.user.id, self.other_user_id, content,
        )
        if message is None:
            await self.send(text_data=json.dumps({
                "type": "error",
                "message": "You are blocked by this user."
            }))
            return

        # Broadcast to room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": {
                    "id": message.id,
                    "sender_id": self.user.id,
                    "sender_email": self.user.email,
                    "content": content,
                    "created_at": message.created_at.isoformat(),
                }
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event["message"]))


class GroupChatConsumer(AsyncWebsocketConsumer):
    """Handles group WebSocket chat."""

    async def connect(self):
        self.user = self.scope["user"]
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        self.group_id = int(self.scope["url_route"]["kwargs"]["group_id"])
        self.room_group_name = f"group_{self.group_id}"

        # Check membership
        is_member = await database_sync_to_async(self._is_member)(self.user.id, self.group_id)
        if not is_member:
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    def _is_member(self, user_id: int, group_id: int) -> bool:
        return GroupMembership.objects.filter(group_id=group_id, user_id=user_id).exists()

    async def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        content = data.get("content", "").strip()
        if not content:
            return

        message = await database_sync_to_async(_save_group_message_if_member)(
            self.user.id, self.group_id, content,
        )
        if message is None:
            await self.close()
            return

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "group_message",
                # Serialised once here instead of once per group member.
                "text": json.dumps({
                    "id": message.id,
                    "sender_id": self.user.id,
                    "sender_email": self.user.email,
                    "content": content,
                    "created_at": message.created_at.isoformat(),
                }),
            }
        )

    async def member_removed(self, event):
        if event["user_id"] == self.user.id:
            await self.close()

    async def group_message(self, event):
        await self.send(text_data=event["text"])