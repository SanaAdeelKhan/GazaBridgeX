"""
Serializers
===========
Input validation and output shaping only.
No business logic or DB writes live here.
"""

from rest_framework import serializers

from feedback.models import Feedback, RatingSummary


# ---------------------------------------------------------------------------
# Feedback Serializers
# ---------------------------------------------------------------------------

class FeedbackCreateInputSerializer(serializers.Serializer):
    """Validates POST /feedback/ payload."""
    
    feedback_type = serializers.ChoiceField(
        choices=["platform", "course", "live_section"]
    )
    object_id = serializers.IntegerField(
        required=False,
        allow_null=True,
        min_value=1,
        help_text="Required for course/live_section feedback. Omit for platform."
    )
    rating = serializers.IntegerField(min_value=1, max_value=5)
    feedback_text = serializers.CharField(min_length=10, max_length=1000)
    is_public = serializers.BooleanField(default=True)
    
    def validate(self, data):
        """Validate that object_id is provided for non-platform feedback."""
        feedback_type = data.get("feedback_type")
        object_id = data.get("object_id")
        
        if feedback_type == "platform":
            if object_id is not None:
                raise serializers.ValidationError(
                    "object_id should not be provided for platform feedback."
                )
        else:
            if object_id is None:
                raise serializers.ValidationError(
                    f"object_id is required for {feedback_type} feedback."
                )
        
        return data


class FeedbackUpdateInputSerializer(serializers.Serializer):
    """Validates PUT/PATCH /feedback/{id}/ payload."""
    
    rating = serializers.IntegerField(min_value=1, max_value=5, required=False)
    feedback_text = serializers.CharField(
        min_length=10,
        max_length=1000,
        required=False
    )
    is_public = serializers.BooleanField(required=False)
    
    def validate(self, data):
        """Ensure at least one field is provided for update."""
        if not data:
            raise serializers.ValidationError(
                "At least one field must be provided for update."
            )
        return data


class FeedbackOutputSerializer(serializers.ModelSerializer):
    """Output shape for feedback responses."""
    
    user_name = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()
    
    class Meta:
        model = Feedback
        fields = [
            "id",
            "user",
            "user_name",
            "user_role",
            "feedback_type",
            "object_id",
            "rating",
            "feedback_text",
            "is_public",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields
    
    def get_user_name(self, obj) -> str:
        """Return full name if user exists, else 'Anonymous'."""
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}".strip()
        return "Anonymous"
    
    def get_user_role(self, obj) -> str:
        """Return user's role names for public display."""
        if not obj.user:
            return ""
        
        roles = obj.user.roles.all()
        if not roles:
            return ""
        
        return ", ".join(role.name.title() for role in roles)


class FeedbackListQuerySerializer(serializers.Serializer):
    """Serializer for query parameters in feedback list."""
    
    feedback_type = serializers.ChoiceField(
        choices=["platform", "course", "live_section"],
        required=False
    )
    object_id = serializers.IntegerField(min_value=1, required=False)
    rating = serializers.IntegerField(min_value=1, max_value=5, required=False)
    sort = serializers.ChoiceField(
        choices=["newest", "rating"],
        default="newest",
        required=False
    )
    page = serializers.IntegerField(min_value=1, default=1)
    page_size = serializers.IntegerField(min_value=1, max_value=50, default=20)
    
    def validate(self, data):
        """Validate object_id is provided when feedback_type is not platform."""
        feedback_type = data.get("feedback_type")
        object_id = data.get("object_id")
        
        if feedback_type and feedback_type != "platform":
            if object_id is None:
                raise serializers.ValidationError(
                    f"object_id is required when filtering by {feedback_type}."
                )
        
        if feedback_type == "platform" and object_id is not None:
            raise serializers.ValidationError(
                "object_id should not be provided for platform feedback."
            )
        
        return data


class RatingSummaryQuerySerializer(serializers.Serializer):
    """Serializer for rating summary query parameters."""
    
    feedback_type = serializers.ChoiceField(
        choices=["platform", "course", "live_section"],
        required=False
    )
    object_id = serializers.IntegerField(min_value=1, required=False)
    
    def validate(self, data):
        """Validate object_id is provided when feedback_type is not platform."""
        feedback_type = data.get("feedback_type")
        object_id = data.get("object_id")
        
        if feedback_type and feedback_type != "platform":
            if object_id is None:
                raise serializers.ValidationError(
                    f"object_id is required for {feedback_type} rating summary."
                )
        
        if feedback_type == "platform" and object_id is not None:
            raise serializers.ValidationError(
                "object_id should not be provided for platform rating summary."
            )
        
        return data


class RatingSummaryOutputSerializer(serializers.ModelSerializer):
    """Output shape for rating summary responses."""
    
    distribution = serializers.SerializerMethodField()
    
    class Meta:
        model = RatingSummary
        fields = [
            "feedback_type",
            "object_id",
            "average_rating",
            "total_feedbacks",
            "distribution",
            "updated_at",
        ]
        read_only_fields = fields
    
    def get_distribution(self, obj) -> dict:
        """Return rating distribution."""
        return obj.get_distribution()
    
    def to_representation(self, instance):
        """Convert Decimal to float for JSON serialization."""
        data = super().to_representation(instance)
        data["average_rating"] = float(data["average_rating"])
        return data