"""
Selectors
=========
Pure read layer with Redis caching (DB 1).
Write-through strategy: cache updated on every write, not invalidated.
"""

import hashlib
from typing import Optional, List

from django.core.cache import cache
from django.db.models import Q, Count, OuterRef, Prefetch, Subquery

from chat.models import Conversation, Group, GroupMembership, Message, Block


CACHE_TTL = 300  # 5 minutes
MAX_CACHED_PAGES = 10


def get_cache_key(prefix: str, identifier) -> str:
    return f"chat:{prefix}:{identifier}"


# ---------------------------------------------------------------------------
# Conversation
# ---------------------------------------------------------------------------

def get_conversation_by_id(conv_id: int) -> Optional[Conversation]:
    return Conversation.objects.filter(pk=conv_id).first()


def get_or_create_conversation(user_a_id: int, user_b_id: int) -> Conversation:
    composite = Conversation.build_composite_key(user_a_id, user_b_id)
    smaller, larger = sorted([user_a_id, user_b_id])
    
    conv, _ = Conversation.objects.get_or_create(
        composite_key=composite,
        defaults={"user1_id": smaller, "user2_id": larger}
    )
    return conv


def get_user_conversations(user_id: int):
    cache_key = get_cache_key("conversations", user_id)
    cached = cache.get(cache_key)
    if cached is not None:
        return cached
    
    result = list(
        Conversation.objects
        .filter(Q(user1_id=user_id) | Q(user2_id=user_id))
        .select_related("user1", "user2")
        .order_by("-updated_at")
    )
    cache.set(cache_key, result, timeout=CACHE_TTL)
    return result


def get_conversation_summaries(conversation_ids: List[int], user_id: int):
    """Last message and unread count for many conversations in 2 queries.

    Returns ``(last_by_conv, unread_by_conv)``. These are read live (not
    cached) so unread counts stay exactly as fresh as before.
    """
    if not conversation_ids:
        return {}, {}

    latest_id = (
        Message.objects
        .filter(conversation_id=OuterRef("pk"))
        .order_by("-created_at", "-id")
        .values("pk")[:1]
    )
    last_ids = [
        pk for pk in (
            Conversation.objects
            .filter(pk__in=conversation_ids)
            .annotate(last_id=Subquery(latest_id))
            .values_list("last_id", flat=True)
        ) if pk is not None
    ]
    last_by_conv = {
        m.conversation_id: m
        for m in Message.objects.filter(pk__in=last_ids).only(
            "id", "conversation_id", "content", "created_at", "sender_id",
        )
    }

    unread_by_conv = dict(
        Message.objects
        .filter(conversation_id__in=conversation_ids, is_read=False)
        .exclude(sender_id=user_id)
        .values_list("conversation_id")
        .annotate(c=Count("id"))
        .order_by()
    )
    return last_by_conv, unread_by_conv


def get_conversation_messages(conversation_id: int):
    return (
        Message.objects
        .filter(conversation_id=conversation_id)
        .select_related("sender")
        .order_by("created_at")
    )


# ---------------------------------------------------------------------------
# Group
# ---------------------------------------------------------------------------

def get_group_by_id(group_id: int) -> Optional[Group]:
    return (
        Group.objects
        .filter(pk=group_id)
        .prefetch_related(
            Prefetch("memberships", queryset=GroupMembership.objects.select_related("user"))
        )
        .first()
    )


def get_group_light(group_id: int) -> Optional[Group]:
    """Group row only — for callers that never read memberships."""
    return Group.objects.filter(pk=group_id).first()


def get_admin_group_ids(user_id: int, group_ids: List[int]) -> set:
    """Ids (among ``group_ids``) of groups where the user is an admin member."""
    if not group_ids:
        return set()
    return set(
        GroupMembership.objects
        .filter(user_id=user_id, is_admin=True, group_id__in=group_ids)
        .values_list("group_id", flat=True)
    )


def get_user_groups(user_id: int):
    cache_key = get_cache_key("user_groups", user_id)
    cached = cache.get(cache_key)
    if cached is not None:
        return cached
    
    result = list(
        Group.objects
        .filter(memberships__user_id=user_id)
        .select_related("owner")
        .order_by("-updated_at")
    )
    cache.set(cache_key, result, timeout=CACHE_TTL)
    return result


def get_group_messages(group_id: int):
    return (
        Message.objects
        .filter(group_id=group_id)
        .select_related("sender")
        .order_by("created_at")
    )


# ---------------------------------------------------------------------------
# Block
# ---------------------------------------------------------------------------

def is_blocked(blocker_id: int, blocked_id: int) -> bool:
    return Block.objects.filter(blocker_id=blocker_id, blocked_id=blocked_id).exists()


def get_blocked_users(user_id: int):
    return (
        Block.objects
        .filter(blocker_id=user_id)
        .select_related("blocked")
        .order_by("-created_at")
    )


# ---------------------------------------------------------------------------
# Cache helpers (write-through)
# ---------------------------------------------------------------------------

def set_cached_conversations(user_id: int, conversations: List[Conversation]) -> None:
    cache_key = get_cache_key("conversations", user_id)
    cache.set(cache_key, conversations, timeout=CACHE_TTL)


def set_cached_groups(user_id: int, groups: List[Group]) -> None:
    cache_key = get_cache_key("user_groups", user_id)
    cache.set(cache_key, groups, timeout=CACHE_TTL)


def invalidate_user_chat_caches(user_id: int) -> None:
    """Invalidate all cached chat data for a user."""
    invalidate_users_chat_caches([user_id])


def invalidate_users_chat_caches(user_ids) -> None:
    """Invalidate cached chat data for many users in one Redis round trip."""
    keys = []
    for uid in dict.fromkeys(user_ids):
        keys.append(get_cache_key("conversations", uid))
        keys.append(get_cache_key("user_groups", uid))
    if keys:
        cache.delete_many(keys)