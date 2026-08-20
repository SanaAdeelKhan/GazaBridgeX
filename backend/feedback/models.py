"""
Feedback Models
===============
Unified feedback model for platform, courses, and live sections.
Uses GenericForeignKey for flexible target relationships.
"""

from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models


# ---------------------------------------------------------------------------
# Choices
# ---------------------------------------------------------------------------

class FeedbackTypeChoices(models.TextChoices):
    PLATFORM = "platform", "Platform"
    COURSE = "course", "Course"
    LIVE_SECTION = "live_section", "Live Section"


# ---------------------------------------------------------------------------
# Feedback Model
# ---------------------------------------------------------------------------

class Feedback(models.Model):
    """
    Unified feedback model for platform, courses, and live sections.
    
    - Platform feedback: content_type and object_id are both NULL.
    - Course/LiveSection feedback: content_type and object_id reference the target.
    - One feedback per user per target (enforced by unique constraint).
    """
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,  # Keep feedback even if user is deleted
        null=True,
        blank=True,
        related_name="feedbacks",
        help_text="User who submitted this feedback."
    )
    
    feedback_type = models.CharField(
        max_length=20,
        choices=FeedbackTypeChoices.choices,
        help_text="Type of feedback (platform, course, live_section)."
    )
    
    # GenericForeignKey fields (NULL for platform feedback)
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,  # If content type is deleted, delete feedback
        null=True,
        blank=True,
        related_name="feedback_content_type",
        help_text="Content type of the feedback target (NULL for platform feedback)."
    )
    object_id = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Object ID of the feedback target (NULL for platform feedback)."
    )
    content_object = GenericForeignKey("content_type", "object_id")
    
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating from 1 to 5 stars."
    )
    
    feedback_text = models.TextField(
        help_text="The feedback content."
    )
    
    is_public = models.BooleanField(
        default=True,
        help_text="Whether this feedback should be publicly visible."
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Feedback"
        verbose_name_plural = "Feedback"
        indexes = [
            models.Index(fields=["feedback_type", "content_type", "object_id"]),
            models.Index(fields=["created_at"]),
            models.Index(fields=["rating"]),
            models.Index(fields=["is_public", "feedback_type"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "feedback_type", "content_type", "object_id"],
                name="unique_feedback_per_user_per_target",
                condition=models.Q(user__isnull=False),
            ),
        ]
    
    def __str__(self) -> str:
        if self.feedback_type == FeedbackTypeChoices.PLATFORM:
            return f"Platform Feedback: {self.rating}★ by {self.user}"
        return f"{self.feedback_type.title()} Feedback: {self.rating}★ for {self.content_object}"
    
    @property
    def is_platform_feedback(self) -> bool:
        return self.feedback_type == FeedbackTypeChoices.PLATFORM
    
    def get_owner(self):
        """Get the owner of the target object (for course/live_section feedback)."""
        if self.content_object:
            return getattr(self.content_object, 'user', None)
        return None


# ---------------------------------------------------------------------------
# Feedback Reply Model
# ---------------------------------------------------------------------------

class FeedbackReply(models.Model):
    """
    Reply to feedback.
    
    - Course/LiveSection feedback: Owner of the course/live_section can reply.
    - Platform feedback: Superuser can reply.
    - Multiple replies allowed per feedback.
    """
    
    feedback = models.ForeignKey(
        Feedback,
        on_delete=models.CASCADE,
        related_name="replies",
        help_text="The feedback this reply belongs to."
    )
    
    replied_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="feedback_replies",
        help_text="User who wrote this reply."
    )
    
    reply_text = models.TextField(
        help_text="The reply content."
    )
    
    is_public = models.BooleanField(
        default=True,
        help_text="Whether this reply should be publicly visible."
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["created_at"]
        verbose_name = "Feedback Reply"
        verbose_name_plural = "Feedback Replies"
        indexes = [
            models.Index(fields=["feedback", "created_at"]),
            models.Index(fields=["replied_by"]),
        ]
    
    def __str__(self) -> str:
        return f"Reply to {self.feedback.id} by {self.replied_by}"


# ---------------------------------------------------------------------------
# Rating Summary Model
# ---------------------------------------------------------------------------

class RatingSummary(models.Model):
    """
    Pre-computed rating statistics for O(1) reads.
    
    - Platform feedback: feedback_type='platform', object_id=NULL (singleton).
    - Course/LiveSection: feedback_type and object_id reference the target.
    """
    
    feedback_type = models.CharField(
        max_length=20,
        choices=FeedbackTypeChoices.choices,
        help_text="Type of feedback this summary belongs to."
    )
    
    # NULL for platform feedback
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="feedback_rating_summaries",
        help_text="Content type of the feedback target (NULL for platform)."
    )
    object_id = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Object ID of the feedback target (NULL for platform)."
    )
    
    average_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.00,
        help_text="Average rating (1.00 to 5.00)."
    )
    
    total_feedbacks = models.PositiveIntegerField(
        default=0,
        help_text="Total number of feedbacks."
    )
    
    rating_1_count = models.PositiveIntegerField(default=0)
    rating_2_count = models.PositiveIntegerField(default=0)
    rating_3_count = models.PositiveIntegerField(default=0)
    rating_4_count = models.PositiveIntegerField(default=0)
    rating_5_count = models.PositiveIntegerField(default=0)
    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["feedback_type", "object_id"]
        verbose_name = "Rating Summary"
        verbose_name_plural = "Rating Summaries"
        indexes = [
            models.Index(fields=["feedback_type", "content_type", "object_id"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["feedback_type", "content_type", "object_id"],
                name="unique_rating_summary_per_target",
            ),
        ]
    
    def __str__(self) -> str:
        if self.feedback_type == FeedbackTypeChoices.PLATFORM:
            return f"Platform Rating: {self.average_rating}★ ({self.total_feedbacks} reviews)"
        return f"{self.feedback_type.title()} Rating: {self.average_rating}★ ({self.total_feedbacks} reviews)"
    
    def get_distribution(self) -> dict:
        """Return rating distribution as a dict."""
        return {
            "1": self.rating_1_count,
            "2": self.rating_2_count,
            "3": self.rating_3_count,
            "4": self.rating_4_count,
            "5": self.rating_5_count,
        }