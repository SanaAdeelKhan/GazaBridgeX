"""
Serializers
===========
"""

from rest_framework import serializers

from notifications.models import Notification, NotificationTypeChoices


class NotificationOutputSerializer(serializers.ModelSerializer):
    """Output serializer for Notification."""
    sender_email = serializers.EmailField(source="sender.email", read_only=True, allow_null=True)
    sender_name = serializers.SerializerMethodField()
    sender_role = serializers.SerializerMethodField()

    def get_sender_name(self, obj):
        if not obj.sender:
            return None
        full_name = f"{obj.sender.first_name} {obj.sender.last_name}".strip()
        return full_name or obj.sender.email

    def get_sender_role(self, obj):
        if not obj.sender:
            return None
        if obj.sender.is_superuser or obj.sender.is_staff:
            return "Admin"
        role_names = set(obj.sender.roles.values_list("name", flat=True))
        if "manager" in role_names:
            return "Manager"
        if "volunteer" in role_names:
            return "Volunteer"
        if "seeker" in role_names:
            return "Seeker"
        return None

    class Meta:
        model = Notification
        fields = [
            "id", "receiver", "sender", "sender_email", "sender_name", "sender_role",
            "type", "content", "is_read", "created_at"
        ]
        read_only_fields = ["id", "receiver", "sender", "created_at"]


class UnreadCountOutputSerializer(serializers.Serializer):
    """Output for unread count."""
    unread_count = serializers.IntegerField()


class AdminNotificationInputSerializer(serializers.Serializer):
    """Validates admin notification creation."""
    content = serializers.CharField()
    type = serializers.ChoiceField(
        choices=NotificationTypeChoices.choices,
        default=NotificationTypeChoices.NORMAL
    )
    target_groups = serializers.MultipleChoiceField(
        choices=[
            ("volunteers", "Volunteers"),
            ("seekers", "Seekers"),
            ("managers", "Managers"),
            ("admins", "Admins"),
            ("all_users", "All Users"),
        ]
    )
    
    def validate_content(self, value: str) -> str:
        if not value.strip():
            raise serializers.ValidationError("Content cannot be empty.")
        return value.strip()