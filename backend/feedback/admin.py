"""
Admin Configuration
===================
Register Feedback, FeedbackReply, and RatingSummary models for Django admin.
"""

from django.contrib import admin

from feedback.models import Feedback, FeedbackReply, RatingSummary, FeedbackTypeChoices


# ---------------------------------------------------------------------------
# Feedback Reply Admin
# ---------------------------------------------------------------------------

@admin.register(FeedbackReply)
class FeedbackReplyAdmin(admin.ModelAdmin):
    """Admin interface for FeedbackReply model."""
    
    list_display = [
        "id",
        "feedback",
        "replied_by",
        "reply_text_preview",
        "is_public",
        "created_at",
    ]
    
    list_filter = [
        "is_public",
        "created_at",
    ]
    
    search_fields = [
        "reply_text",
        "replied_by__email",
        "feedback__feedback_text",
    ]
    
    readonly_fields = [
        "created_at",
        "updated_at",
    ]
    
    fieldsets = (
        ("Reply Information", {
            "fields": (
                "feedback",
                "replied_by",
                "reply_text",
                "is_public",
            )
        }),
        ("Timestamps", {
            "fields": (
                "created_at",
                "updated_at",
            ),
            "classes": ("collapse",),
        }),
    )
    
    def reply_text_preview(self, obj):
        """Show truncated reply text in list display."""
        if len(obj.reply_text) > 50:
            return f"{obj.reply_text[:50]}..."
        return obj.reply_text
    
    reply_text_preview.short_description = "Reply"
    
    def get_queryset(self, request):
        """Optimize queryset for admin list display."""
        return (
            super()
            .get_queryset(request)
            .select_related("replied_by", "feedback")
        )
    
    def has_add_permission(self, request):
        """Allow admins/superusers to add replies from admin."""
        return request.user.is_staff or request.user.is_superuser
    
    def has_change_permission(self, request, obj=None):
        """Allow admins/superusers to edit replies."""
        return request.user.is_staff or request.user.is_superuser
    
    def has_delete_permission(self, request, obj=None):
        """Allow admins/superusers to delete replies."""
        return request.user.is_staff or request.user.is_superuser


# ---------------------------------------------------------------------------
# Feedback Admin
# ---------------------------------------------------------------------------

@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    """Admin interface for Feedback model."""
    
    list_display = [
        "id",
        "user",
        "feedback_type",
        "target",
        "rating",
        "is_public",
        "created_at",
    ]
    
    list_filter = [
        "feedback_type",
        "rating",
        "is_public",
        "created_at",
    ]
    
    search_fields = [
        "feedback_text",
        "user__email",
        "user__first_name",
        "user__last_name",
    ]
    
    readonly_fields = [
        "created_at",
        "updated_at",
    ]
    
    fieldsets = (
        ("Feedback Information", {
            "fields": (
                "user",
                "feedback_type",
                "content_type",
                "object_id",
                "rating",
                "feedback_text",
                "is_public",
            )
        }),
        ("Timestamps", {
            "fields": (
                "created_at",
                "updated_at",
            ),
            "classes": ("collapse",),
        }),
    )
    
    def target(self, obj):
        """Display the target object name."""
        if obj.feedback_type == FeedbackTypeChoices.PLATFORM:
            return "Platform"
        if obj.content_object:
            return str(obj.content_object)
        return "N/A"
    
    target.short_description = "Target"
    
    def get_queryset(self, request):
        """Optimize queryset for admin list display."""
        return (
            super()
            .get_queryset(request)
            .select_related("user", "content_type")
            .prefetch_related("user__roles", "replies")
        )
    
    def has_add_permission(self, request):
        """Disable adding feedback from admin (should be done via API)."""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Allow admins/superusers to edit feedback."""
        return request.user.is_staff or request.user.is_superuser
    
    def has_delete_permission(self, request, obj=None):
        """Allow admins/superusers to delete feedback."""
        return request.user.is_staff or request.user.is_superuser


# ---------------------------------------------------------------------------
# Rating Summary Admin
# ---------------------------------------------------------------------------

@admin.register(RatingSummary)
class RatingSummaryAdmin(admin.ModelAdmin):
    """Admin interface for RatingSummary model."""
    
    list_display = [
        "id",
        "feedback_type",
        "target",
        "average_rating",
        "total_feedbacks",
        "updated_at",
    ]
    
    list_filter = [
        "feedback_type",
        "updated_at",
    ]
    
    readonly_fields = [
        "average_rating",
        "total_feedbacks",
        "rating_1_count",
        "rating_2_count",
        "rating_3_count",
        "rating_4_count",
        "rating_5_count",
        "updated_at",
    ]
    
    fieldsets = (
        ("Rating Summary Information", {
            "fields": (
                "feedback_type",
                "content_type",
                "object_id",
                "average_rating",
                "total_feedbacks",
            )
        }),
        ("Rating Distribution", {
            "fields": (
                "rating_1_count",
                "rating_2_count",
                "rating_3_count",
                "rating_4_count",
                "rating_5_count",
            ),
        }),
        ("Timestamps", {
            "fields": (
                "updated_at",
            ),
            "classes": ("collapse",),
        }),
    )
    
    def target(self, obj):
        """Display the target object name."""
        if obj.feedback_type == FeedbackTypeChoices.PLATFORM:
            return "Platform"
        if obj.content_type and obj.object_id:
            model_class = obj.content_type.model_class()
            if model_class:
                target_obj = model_class.objects.filter(pk=obj.object_id).first()
                if target_obj:
                    return str(target_obj)
        return "N/A"
    
    target.short_description = "Target"
    
    def get_queryset(self, request):
        """Optimize queryset for admin list display."""
        return (
            super()
            .get_queryset(request)
            .select_related("content_type")
        )
    
    def has_add_permission(self, request):
        """Disable adding rating summaries from admin (auto-generated)."""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Allow admins/superusers to view but not edit (read-only)."""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Disable deleting rating summaries from admin (auto-managed)."""
        return False