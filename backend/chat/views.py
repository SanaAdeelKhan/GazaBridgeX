"""
Views
=====
"""

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from chat.serializers import (
    ConversationOutputSerializer, MessageOutputSerializer,
    GroupInputSerializer, GroupOutputSerializer, GroupDetailOutputSerializer,
    AddMemberInputSerializer, BlockedUserOutputSerializer,
)
from chat.services import (
    block_user, unblock_user,
    create_group, add_member_to_group, remove_member_from_group,
    make_group_admin, delete_group, leave_group,
    mark_message_read, mark_group_message_read,
    notify_conversation_by_email,
)
from chat.selectors import (
    get_user_conversations, get_conversation_messages,
    get_user_groups, get_group_by_id, get_group_light, get_group_messages,
    get_blocked_users, get_conversation_summaries, get_admin_group_ids,
    get_conversation_by_id,
)
from chat.permissions import IsConversationParticipant, IsGroupMember, CanManageGroup
from backend.pagination import StandardResultsSetPagination, ChatListPagination


# ---------------------------------------------------------------------------
# Conversation Views
# ---------------------------------------------------------------------------

class ConversationListView(generics.ListAPIView):
    """GET /chat/conversations/"""
    permission_classes = [IsAuthenticated]
    serializer_class = ConversationOutputSerializer
    pagination_class = ChatListPagination

    def get_queryset(self):
        return get_user_conversations(self.request.user.pk)

    def get_serializer_context(self):
        return {"request": self.request, **getattr(self, "_summary_context", {})}

    def list(self, request, *args, **kwargs):
        # Paginate the (cached) conversation list, then compute last message +
        # unread counts for just that page in 2 queries (live, not cached)
        # instead of 2 queries per conversation.
        page = self.paginate_queryset(self.get_queryset())
        last_by_conv, unread_by_conv = get_conversation_summaries(
            [c.pk for c in page], request.user.pk,
        )
        self._summary_context = {
            "last_by_conv": last_by_conv,
            "unread_by_conv": unread_by_conv,
        }
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)


class ConversationMessagesView(generics.ListAPIView):
    """GET /chat/conversations/<conv_id>/messages/"""
    permission_classes = [IsAuthenticated, IsConversationParticipant]
    serializer_class = MessageOutputSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        conv_id = self.kwargs["conv_id"]
        # Only participants may read a conversation's history.
        conversation = get_conversation_by_id(conv_id)
        if conversation is not None:
            self.check_object_permissions(self.request, conversation)
        return get_conversation_messages(conv_id)


class NotifyConversationEmailView(generics.GenericAPIView):
    """POST /chat/conversations/<conv_id>/notify/ -- manual email notify, 1hr cooldown."""
    permission_classes = [IsAuthenticated]

    def post(self, request, conv_id, *args, **kwargs):
        try:
            notify_conversation_by_email(conversation_id=conv_id, requester_id=request.user.pk)
        except ValueError as exc:
            if str(exc) == "cooldown":
                return Response(
                    {"detail": "You already notified this person recently. Please wait before trying again."},
                    status=status.HTTP_429_TOO_MANY_REQUESTS,
                )
            return Response({"detail": "Conversation not found."}, status=status.HTTP_404_NOT_FOUND)
        except PermissionError as exc:
            raise PermissionDenied(str(exc))

        return Response({"detail": "Email notification sent."})


# ---------------------------------------------------------------------------
# Read Receipt Views
# ---------------------------------------------------------------------------

class MarkMessageReadView(generics.GenericAPIView):
    """PATCH /chat/messages/<message_id>/read/"""
    permission_classes = [IsAuthenticated]

    def patch(self, request, message_id, *args, **kwargs):
        mark_message_read(message_id, request.user.pk)
        return Response({"detail": "Marked as read."})


class MarkGroupMessageReadView(generics.GenericAPIView):
    """PATCH /chat/messages/<message_id>/read-group/"""
    permission_classes = [IsAuthenticated]

    def patch(self, request, message_id, *args, **kwargs):
        mark_group_message_read(message_id, request.user.pk)
        return Response({"detail": "Marked as read."})


# ---------------------------------------------------------------------------
# Block Views
# ---------------------------------------------------------------------------

class BlockUserView(generics.GenericAPIView):
    """POST /chat/block/<user_id>/"""
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id, *args, **kwargs):
        try:
            block_user(request.user.pk, user_id)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "User blocked."}, status=status.HTTP_201_CREATED)


class UnblockUserView(generics.GenericAPIView):
    """DELETE /chat/unblock/<user_id>/"""
    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id, *args, **kwargs):
        unblock_user(request.user.pk, user_id)
        return Response({"detail": "User unblocked."})


class BlockedListView(generics.ListAPIView):
    """GET /chat/blocked/"""
    permission_classes = [IsAuthenticated]
    serializer_class = BlockedUserOutputSerializer

    def get_queryset(self):
        return get_blocked_users(self.request.user.pk)


# ---------------------------------------------------------------------------
# Group Views
# ---------------------------------------------------------------------------

class GroupCreateView(generics.CreateAPIView):
    """POST /chat/groups/create/"""
    permission_classes = [IsAuthenticated]
    serializer_class = GroupInputSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        group = create_group(
            owner_id=request.user.pk,
            name=data["name"],
            description=data.get("description", ""),
        )
        return Response(GroupDetailOutputSerializer(group).data, status=status.HTTP_201_CREATED)


class GroupListView(generics.ListAPIView):
    """GET /chat/groups/"""
    permission_classes = [IsAuthenticated]
    serializer_class = GroupOutputSerializer
    pagination_class = ChatListPagination

    def get_queryset(self):
        return get_user_groups(self.request.user.pk)

    def get_serializer_context(self):
        return {"request": self.request, **getattr(self, "_admin_context", {})}

    def list(self, request, *args, **kwargs):
        page = self.paginate_queryset(self.get_queryset())
        # One query for the admin flags of every listed group (was 1 per group).
        self._admin_context = {
            "admin_group_ids": get_admin_group_ids(request.user.pk, [g.pk for g in page]),
        }
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)


class GroupDetailView(generics.RetrieveDestroyAPIView):
    """GET/DELETE /chat/groups/<id>/"""
    permission_classes = [IsAuthenticated, IsGroupMember]

    def get_serializer_class(self):
        return GroupDetailOutputSerializer

    def get_object(self):
        return get_group_by_id(self.kwargs["pk"])

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response({"detail": "Group not found."}, status=status.HTTP_404_NOT_FOUND)
        # Only members may see a group's detail / member list. The memberships
        # are already prefetched, so this costs no extra query.
        if not any(m.user_id == request.user.pk for m in instance.memberships.all()):
            raise PermissionDenied("You are not a member of this group.")
        return Response(GroupDetailOutputSerializer(instance).data)

    def delete(self, request, *args, **kwargs):
        instance = get_group_light(self.kwargs["pk"])  # memberships not needed
        if not instance:
            return Response({"detail": "Group not found."}, status=status.HTTP_404_NOT_FOUND)

        perm = CanManageGroup()
        if not perm.has_object_permission(request, self, instance):
            raise PermissionDenied("You don't have permission to delete this group.")

        delete_group(group_id=instance.pk, requesting_user_id=request.user.pk)
        return Response(status=status.HTTP_204_NO_CONTENT)


# class GroupMessagesView(generics.ListAPIView):
#     """GET /chat/groups/<group_id>/messages/"""
#     permission_classes = [IsAuthenticated, IsGroupMember]
#     serializer_class = MessageOutputSerializer
#     pagination_class = StandardResultsSetPagination

#     def get_queryset(self):
#         group_id = self.kwargs["pk"]
#         return get_group_messages(group_id)

class GroupMessagesView(generics.ListAPIView):
    """GET /chat/groups/<group_id>/messages/"""
    permission_classes = [IsAuthenticated, IsGroupMember]
    serializer_class = MessageOutputSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        group_id = self.kwargs["pk"]
        # Manually check group membership (memberships are not needed here)
        group = get_group_light(group_id)
        if not group:
            from rest_framework.exceptions import NotFound
            raise NotFound("Group not found.")
        
        # Check object permission manually
        perm = IsGroupMember()
        if not perm.has_object_permission(self.request, self, group):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You are not a member of this group.")
        
        return get_group_messages(group_id)


class AddMemberView(generics.GenericAPIView):
    """POST /chat/groups/<group_id>/add-member/"""
    permission_classes = [IsAuthenticated]
    serializer_class = AddMemberInputSerializer

    def post(self, request, group_id, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            add_member_to_group(
                group_id=group_id,
                email=serializer.validated_data["email"],
                added_by_id=request.user.pk,
            )
        except (ValueError, PermissionError) as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": "Member added."})


class RemoveMemberView(generics.GenericAPIView):
    """DELETE /chat/groups/<group_id>/remove-member/<user_id>/"""
    permission_classes = [IsAuthenticated]

    def delete(self, request, group_id, user_id, *args, **kwargs):
        try:
            remove_member_from_group(
                group_id=group_id,
                user_id=user_id,
                removed_by_id=request.user.pk,
            )
        except (ValueError, PermissionError) as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": "Member removed."})


class MakeAdminView(generics.GenericAPIView):
    """POST /chat/groups/<group_id>/make-admin/<user_id>/"""
    permission_classes = [IsAuthenticated]

    def post(self, request, group_id, user_id, *args, **kwargs):
        try:
            make_group_admin(
                group_id=group_id,
                user_id=user_id,
                promoter_id=request.user.pk,
            )
        except (ValueError, PermissionError) as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": "User is now an admin."})


class LeaveGroupView(generics.GenericAPIView):
    """POST /chat/groups/<group_id>/leave/"""
    permission_classes = [IsAuthenticated]

    def post(self, request, group_id, *args, **kwargs):
        try:
            leave_group(
                group_id=group_id,
                user_id=request.user.pk,
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": "You have left the group."})