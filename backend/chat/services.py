"""
Services
========
Write layer and business-logic enforcement.
"""

import logging
from typing import Optional

from django.core.cache import cache
from django.db import transaction
from django.db.models import Q

from chat.models import (
    Conversation, Group, GroupMembership,
    Message, MessageReceipt, Block
)
from chat.selectors import (
    get_or_create_conversation, get_group_light,
    get_user_groups,
    set_cached_groups,
    invalidate_user_chat_caches, invalidate_users_chat_caches, is_blocked,
)

logger = logging.getLogger(__name__)

MAX_GROUP_MEMBERS = 100


# ---------------------------------------------------------------------------
# Message
# ---------------------------------------------------------------------------

def save_message(
    *,
    sender_id: int,
    content: str,
    conversation_id: Optional[int] = None,
    group_id: Optional[int] = None,
    participant_ids: Optional[tuple] = None,
) -> Message:
    """Save a message and update conversation/group timestamps.

    ``participant_ids`` (user1_id, user2_id) lets callers that already hold the
    conversation skip re-reading it just to learn who to invalidate.
    """
    with transaction.atomic():
        message = Message.objects.create(
            sender_id=sender_id,
            content=content,
            conversation_id=conversation_id,
            group_id=group_id,
        )
        if conversation_id:
            Conversation.objects.filter(pk=conversation_id).update(updated_at=message.created_at)
        if group_id:
            Group.objects.filter(pk=group_id).update(updated_at=message.created_at)

    # Invalidate both participants' caches so the next GET rebuilds from DB.
    # A write-through re-read here risks re-caching a stale snapshot if the
    # cache was already populated before this message (e.g. brand-new conversation).
    if conversation_id:
        if participant_ids is None:
            conv = Conversation.objects.get(pk=conversation_id)
            participant_ids = (conv.user1_id, conv.user2_id)
        invalidate_users_chat_caches(participant_ids)

    return message


def mark_message_read(message_id: int, user_id: int) -> None:
    """Mark a 1-on-1 message as read (only inside conversations the user is in)."""
    Message.objects.filter(pk=message_id).filter(
        Q(conversation__user1_id=user_id) | Q(conversation__user2_id=user_id)
    ).update(is_read=True)


def mark_group_message_read(message_id: int, user_id: int) -> None:
    """Mark a group message as read for a specific user."""
    # Only members of the message's group can record a receipt for it.
    if not GroupMembership.objects.filter(group__messages__pk=message_id, user_id=user_id).exists():
        return
    # One INSERT ... ON CONFLICT DO NOTHING instead of SELECT + (savepoint) INSERT.
    MessageReceipt.objects.bulk_create(
        [MessageReceipt(message_id=message_id, user_id=user_id)],
        ignore_conflicts=True,
    )


# ---------------------------------------------------------------------------
# Block
# ---------------------------------------------------------------------------

def block_user(blocker_id: int, blocked_id: int) -> Block:
    """Block a user."""
    if blocker_id == blocked_id:
        raise ValueError("You cannot block yourself.")
    
    if is_blocked(blocker_id, blocked_id):
        raise ValueError("User is already blocked.")
    
    block, _ = Block.objects.get_or_create(blocker_id=blocker_id, blocked_id=blocked_id)
    return block


def unblock_user(blocker_id: int, blocked_id: int) -> None:
    """Unblock a user."""
    Block.objects.filter(blocker_id=blocker_id, blocked_id=blocked_id).delete()


# ---------------------------------------------------------------------------
# Group
# ---------------------------------------------------------------------------

def create_group(*, owner_id: int, name: str, description: str = "") -> Group:
    """Create a group and add owner as admin member."""
    with transaction.atomic():
        group = Group.objects.create(
            name=name,
            description=description,
            owner_id=owner_id,
            member_count=1,
        )
        GroupMembership.objects.create(
            group=group,
            user_id=owner_id,
            is_admin=True,
        )
    
    # Write-through
    groups = get_user_groups(owner_id)
    set_cached_groups(owner_id, groups)
    
    return group


def add_member_to_group(*, group_id: int, email: str, added_by_id: int) -> GroupMembership:
    """Add a user to a group by email."""
    from users.models import User
    
    group = get_group_light(group_id)
    if not group:
        raise ValueError("Group not found.")
    
    # Check permission
    membership = GroupMembership.objects.filter(group=group, user_id=added_by_id).first()
    if not membership or (not membership.is_admin and group.owner_id != added_by_id):
        raise PermissionError("Only group admins can add members.")
    
    if group.member_count >= MAX_GROUP_MEMBERS:
        raise ValueError(f"Group is full. Max {MAX_GROUP_MEMBERS} members allowed.")
    
    user = User.objects.filter(email=email).first()
    if not user:
        raise ValueError("User with this email not found.")
    
    if GroupMembership.objects.filter(group=group, user=user).exists():
        raise ValueError("User is already a member.")
    
    with transaction.atomic():
        # Lock the group row so two concurrent adds cannot both pass the
        # size check above and push the group over MAX_GROUP_MEMBERS.
        locked = Group.objects.select_for_update().get(pk=group.pk)
        if locked.member_count >= MAX_GROUP_MEMBERS:
            raise ValueError(f"Group is full. Max {MAX_GROUP_MEMBERS} members allowed.")
        membership = GroupMembership.objects.create(group=group, user=user, is_admin=False)
        group.member_count = GroupMembership.objects.filter(group=group).count()
        group.save(update_fields=["member_count"])
    
    # # Write-through for new member
    # groups = get_user_groups(user.id)
    # set_cached_groups(user.id, groups)
    
    # Invalidate cache for both users — next read will rebuild correctly
    invalidate_users_chat_caches([added_by_id, user.id])
    
    return membership


def _disconnect_removed_member(group_id: int, user_id: int) -> None:
    """Tell the group's open sockets that ``user_id`` was removed so that
    member's socket closes (membership is only checked at connect time)."""
    try:
        from asgiref.sync import async_to_sync
        from channels.layers import get_channel_layer

        layer = get_channel_layer()
        if layer is not None:
            async_to_sync(layer.group_send)(
                f"group_{group_id}",
                {"type": "member_removed", "user_id": user_id},
            )
    except Exception:
        logger.exception("Failed to notify group %s about removed user %s.", group_id, user_id)


def remove_member_from_group(*, group_id: int, user_id: int, removed_by_id: int) -> None:
    """Remove a user from a group."""
    group = get_group_light(group_id)
    if not group:
        raise ValueError("Group not found.")
    
    if group.owner_id == user_id:
        raise ValueError("Cannot remove the group owner.")
    
    remover = GroupMembership.objects.filter(group=group, user_id=removed_by_id).first()
    if not remover or (not remover.is_admin and group.owner_id != removed_by_id):
        raise PermissionError("Only group admins can remove members.")
    
    with transaction.atomic():
        GroupMembership.objects.filter(group=group, user_id=user_id).delete()
        group.member_count = GroupMembership.objects.filter(group=group).count()
        group.save(update_fields=["member_count"])
    
    # Write-through
    invalidate_user_chat_caches(user_id)
    _disconnect_removed_member(group_id, user_id)


def make_group_admin(*, group_id: int, user_id: int, promoter_id: int) -> None:
    """Make a member an admin. Only group owner can do this."""
    group = get_group_light(group_id)
    if not group:
        raise ValueError("Group not found.")
    
    if group.owner_id != promoter_id:
        raise PermissionError("Only the group owner can make admins.")
    
    GroupMembership.objects.filter(group=group, user_id=user_id).update(is_admin=True)


def leave_group(*, group_id: int, user_id: int) -> None:
    """Leave a group. The owner cannot leave — they must delete the group instead."""
    group = get_group_light(group_id)
    if not group:
        raise ValueError("Group not found.")

    if group.owner_id == user_id:
        raise ValueError("You are the owner. Transfer ownership or delete the group instead.")

    membership = GroupMembership.objects.filter(group=group, user_id=user_id).first()
    if not membership:
        raise ValueError("You are not a member of this group.")

    with transaction.atomic():
        membership.delete()
        group.member_count = GroupMembership.objects.filter(group=group).count()
        group.save(update_fields=["member_count"])

    invalidate_user_chat_caches(user_id)
    _disconnect_removed_member(group_id, user_id)


def delete_group(*, group_id: int, requesting_user_id: int) -> None:
    """Delete a group. Owner, group admin, manager, admin, superuser can delete."""
    from users.models import User
    user = User.objects.get(pk=requesting_user_id)
    group = get_group_light(group_id)
    
    if not group:
        raise ValueError("Group not found.")
    
    # Check permission
    is_owner = group.owner_id == requesting_user_id
    is_group_admin = GroupMembership.objects.filter(group=group, user_id=requesting_user_id, is_admin=True).exists()
    is_staff = user.is_staff or user.is_superuser or user.is_manager
    
    if not (is_owner or is_group_admin or is_staff):
        raise PermissionError("You don't have permission to delete this group.")
    
    # Invalidate all members' caches
    member_ids = list(GroupMembership.objects.filter(group=group).values_list("user_id", flat=True))
    
    with transaction.atomic():
        # Same end state as group.delete()'s cascade, but receipts go in one
        # DELETE and messages in bounded batches instead of loading every
        # message/receipt row into memory.
        MessageReceipt.objects.filter(message__group_id=group.pk).delete()
        while True:
            batch = list(Message.objects.filter(group_id=group.pk).values_list("pk", flat=True)[:2000])
            if not batch:
                break
            Message.objects.filter(pk__in=batch).delete()
        group.delete()  # CASCADE deletes memberships
    
    invalidate_users_chat_caches(member_ids)

# ---------------------------------------------------------------------------
# Notify via Email (manual trigger, per-conversation cooldown)
# ---------------------------------------------------------------------------

CHAT_NOTIFY_COOLDOWN_SECONDS = 60 * 60  # 1 hour


def _chat_notify_cache_key(conversation_id: int) -> str:
    return f"chat_notify_cooldown:{conversation_id}"


def notify_conversation_by_email(*, conversation_id: int, requester_id: int) -> None:
    """
    Send a 'you have a new message' email to the other participant.

    Raises:
        ValueError("not_found")     -- conversation does not exist.
        PermissionError             -- requester is not a participant.
        ValueError("cooldown")      -- already notified within the last hour.
    """
    conversation = Conversation.objects.select_related("user1", "user2").filter(pk=conversation_id).first()
    if conversation is None:
        raise ValueError("not_found")

    if requester_id not in (conversation.user1_id, conversation.user2_id):
        raise PermissionError("You are not a participant in this conversation.")

    cache_key = _chat_notify_cache_key(conversation_id)
    if cache.get(cache_key):
        raise ValueError("cooldown")

    sender = conversation.user1 if requester_id == conversation.user1_id else conversation.user2
    recipient = conversation.user2 if requester_id == conversation.user1_id else conversation.user1

    sender_name = sender.first_name or sender.email
    recipient_first_name = recipient.first_name or "there"

    from chat.tasks import send_chat_notify_email
    send_chat_notify_email(
        recipient_email=recipient.email,
        recipient_first_name=recipient_first_name,
        sender_name=sender_name,
    )

    cache.set(cache_key, True, timeout=CHAT_NOTIFY_COOLDOWN_SECONDS)
