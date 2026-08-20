"""
Services
========
Write layer and business-logic enforcement.
No HTTP awareness — views call services, never the ORM directly.
"""

import logging
from typing import Optional, Dict, Any

from django.contrib.contenttypes.models import ContentType
from django.db import transaction
from django.db.models import Q

from feedback.models import (
    Feedback,
    FeedbackReply,
    RatingSummary,
    FeedbackTypeChoices,
)
from feedback.selectors import (
    get_feedback_by_id,
    get_reply_by_id,
    _get_content_type_for_feedback_type,
    invalidate_all_feedback_caches,
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _get_or_create_rating_summary(
    feedback_type: str,
    content_type: Optional[ContentType] = None,
    object_id: Optional[int] = None,
) -> RatingSummary:
    """Get or create a rating summary for a target."""
    
    # Platform feedback: content_type and object_id are NULL
    if feedback_type == FeedbackTypeChoices.PLATFORM:
        content_type = None
        object_id = None
    
    rating_summary, created = RatingSummary.objects.get_or_create(
        feedback_type=feedback_type,
        content_type=content_type,
        object_id=object_id,
        defaults={
            "average_rating": 0.00,
            "total_feedbacks": 0,
        }
    )
    
    return rating_summary


def _recalculate_rating_summary(
    feedback_type: str,
    content_type: Optional[ContentType] = None,
    object_id: Optional[int] = None,
) -> RatingSummary:
    """
    Recalculate rating summary for a target based on all existing feedback.
    Called after feedback creation, update, or deletion.
    """
    
    # Build the query for feedback of this type
    feedback_queryset = Feedback.objects.filter(feedback_type=feedback_type)
    
    if feedback_type == FeedbackTypeChoices.PLATFORM:
        feedback_queryset = feedback_queryset.filter(
            content_type__isnull=True,
            object_id__isnull=True,
        )
    else:
        feedback_queryset = feedback_queryset.filter(
            content_type=content_type,
            object_id=object_id,
        )
    
    # Only count public feedback
    feedback_queryset = feedback_queryset.filter(is_public=True)
    
    # Get or create the rating summary
    rating_summary = _get_or_create_rating_summary(
        feedback_type=feedback_type,
        content_type=content_type,
        object_id=object_id,
    )
    
    # Get counts for each rating
    total_count = feedback_queryset.count()
    
    if total_count == 0:
        rating_summary.average_rating = 0.00
        rating_summary.total_feedbacks = 0
        rating_summary.rating_1_count = 0
        rating_summary.rating_2_count = 0
        rating_summary.rating_3_count = 0
        rating_summary.rating_4_count = 0
        rating_summary.rating_5_count = 0
    else:
        # Get distribution counts
        from django.db.models import Count, Avg
        
        distribution = (
            feedback_queryset
            .values("rating")
            .annotate(count=Count("id"))
        )
        
        # Initialize counts
        rating_counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        
        for item in distribution:
            rating_counts[item["rating"]] = item["count"]
        
        # Calculate average
        average = feedback_queryset.aggregate(Avg("rating"))["rating__avg"]
        
        rating_summary.average_rating = round(average, 2)
        rating_summary.total_feedbacks = total_count
        rating_summary.rating_1_count = rating_counts[1]
        rating_summary.rating_2_count = rating_counts[2]
        rating_summary.rating_3_count = rating_counts[3]
        rating_summary.rating_4_count = rating_counts[4]
        rating_summary.rating_5_count = rating_counts[5]
    
    rating_summary.save()
    
    return rating_summary


def _validate_feedback_target(
    feedback_type: str,
    object_id: Optional[int],
) -> tuple[Optional[ContentType], Optional[int]]:
    """
    Validate feedback target exists and return content_type and object_id.
    Raises ValueError if target doesn't exist.
    """
    
    if feedback_type == FeedbackTypeChoices.PLATFORM:
        return None, None
    
    content_type = _get_content_type_for_feedback_type(feedback_type)
    
    if not content_type:
        raise ValueError(f"Invalid feedback type: {feedback_type}")
    
    if not object_id:
        raise ValueError(f"object_id is required for {feedback_type} feedback.")
    
    # Check if the object exists
    model_class = content_type.model_class()
    if not model_class:
        raise ValueError(f"Model not found for feedback type: {feedback_type}")
    
    target_object = model_class.objects.filter(pk=object_id).first()
    if not target_object:
        raise ValueError(f"{feedback_type.title()} with ID {object_id} not found.")
    
    return content_type, object_id


def _send_feedback_email_to_owner(feedback: Feedback) -> None:
    """
    Send email notification to the owner of the course/live_section
    when new feedback is received. Uses Brevo client.
    """
    from backend.brevo_client import send_brevo_email
    
    target_object = feedback.content_object
    if not target_object:
        return
    
    owner = getattr(target_object, 'user', None)
    if not owner or not owner.email:
        return
    
    target_name = getattr(target_object, 'title', None) or getattr(target_object, 'offer_name', 'Unknown')
    
    subject = f"New Feedback on Your {feedback.feedback_type.title()}: {target_name}"
    
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Feedback Received</h2>
        <p>Hello {owner.first_name},</p>
        <p>Someone has left feedback on your {feedback.feedback_type}:</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Target:</strong> {target_name}</p>
            <p><strong>Rating:</strong> {"★" * feedback.rating}{"☆" * (5 - feedback.rating)}</p>
            <p><strong>Feedback:</strong></p>
            <p style="font-style: italic;">"{feedback.feedback_text}"</p>
            <p><strong>From:</strong> {feedback.user.first_name} {feedback.user.last_name}</p>
        </div>
        
        <p>You can view and respond to this feedback by logging into your GazaBridge account.</p>
        
        <p>Best regards,<br>GazaBridge Team</p>
    </div>
    """
    
    transaction.on_commit(
        lambda: send_brevo_email(
            to_email=owner.email,
            to_name=f"{owner.first_name} {owner.last_name}",
            subject=subject,
            html_content=html_content,
        )
    )


def _send_reply_email_to_feedback_author(feedback: Feedback, reply: FeedbackReply) -> None:
    """
    Send email notification to the original feedback author
    when someone replies to their feedback. Uses Brevo client.
    """
    from backend.brevo_client import send_brevo_email
    
    if not feedback.user or not feedback.user.email:
        return
    
    subject = f"New Reply to Your Feedback"
    
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Reply Received</h2>
        <p>Hello {feedback.user.first_name},</p>
        <p>Someone has replied to your feedback:</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Your Feedback:</strong> "{feedback.feedback_text}"</p>
            <p><strong>Reply:</strong></p>
            <p style="font-style: italic;">"{reply.reply_text}"</p>
            <p><strong>From:</strong> {reply.replied_by.first_name} {reply.replied_by.last_name}</p>
        </div>
        
        <p>You can view this conversation by logging into your GazaBridge account.</p>
        
        <p>Best regards,<br>GazaBridge Team</p>
    </div>
    """
    
    transaction.on_commit(
        lambda: send_brevo_email(
            to_email=feedback.user.email,
            to_name=f"{feedback.user.first_name} {feedback.user.last_name}",
            subject=subject,
            html_content=html_content,
        )
    )


# ---------------------------------------------------------------------------
# Feedback CRUD operations
# ---------------------------------------------------------------------------

def create_feedback(
    *,
    user,
    feedback_type: str,
    rating: int,
    feedback_text: str,
    object_id: Optional[int] = None,
    is_public: bool = True,
) -> Feedback:
    """Create a new feedback entry."""
    
    # Validate target
    content_type, validated_object_id = _validate_feedback_target(
        feedback_type,
        object_id,
    )
    
    # Check for duplicate feedback
    duplicate_query = Feedback.objects.filter(
        user=user,
        feedback_type=feedback_type,
    )
    
    if feedback_type == FeedbackTypeChoices.PLATFORM:
        duplicate_query = duplicate_query.filter(
            content_type__isnull=True,
            object_id__isnull=True,
        )
    else:
        duplicate_query = duplicate_query.filter(
            content_type=content_type,
            object_id=validated_object_id,
        )
    
    if duplicate_query.exists():
        existing_feedback = duplicate_query.first()
        raise ValueError(
            f"You have already submitted feedback for this. "
            f"Use PUT /feedback/{existing_feedback.id}/ to update it."
        )
    
    with transaction.atomic():
        feedback = Feedback.objects.create(
            user=user,
            feedback_type=feedback_type,
            content_type=content_type,
            object_id=validated_object_id,
            rating=rating,
            feedback_text=feedback_text,
            is_public=is_public,
        )
        
        # Update rating summary
        _recalculate_rating_summary(
            feedback_type=feedback_type,
            content_type=content_type,
            object_id=validated_object_id,
        )
    
    # INVALIDATE CACHE AFTER SUCCESSFUL CREATION
    transaction.on_commit(invalidate_all_feedback_caches)
    
    # Send email to owner for course/live_section feedback
    if feedback_type != FeedbackTypeChoices.PLATFORM:
        _send_feedback_email_to_owner(feedback)
    
    return feedback


def update_feedback(
    *,
    feedback_id: int,
    user,
    update_data: Dict[str, Any],
) -> Feedback:
    """Update an existing feedback entry (owner only)."""
    
    feedback = get_feedback_by_id(feedback_id)
    
    if not feedback:
        raise ValueError("Feedback not found.")
    
    if feedback.user != user:
        raise PermissionError("You don't have permission to update this feedback.")
    
    with transaction.atomic():
        for field, value in update_data.items():
            if hasattr(feedback, field):
                setattr(feedback, field, value)
        
        feedback.save()
        
        # Update rating summary
        _recalculate_rating_summary(
            feedback_type=feedback.feedback_type,
            content_type=feedback.content_type,
            object_id=feedback.object_id,
        )
    
    # INVALIDATE CACHE AFTER SUCCESSFUL UPDATE
    transaction.on_commit(invalidate_all_feedback_caches)
    
    return feedback


def delete_feedback(
    *,
    feedback_id: int,
    user,
) -> None:
    """Delete a feedback entry (owner only)."""
    
    feedback = get_feedback_by_id(feedback_id)
    
    if not feedback:
        raise ValueError("Feedback not found.")
    
    if feedback.user != user:
        raise PermissionError("You don't have permission to delete this feedback.")
    
    with transaction.atomic():
        feedback_type = feedback.feedback_type
        content_type = feedback.content_type
        object_id = feedback.object_id
        
        feedback.delete()
        
        # Update rating summary
        _recalculate_rating_summary(
            feedback_type=feedback_type,
            content_type=content_type,
            object_id=object_id,
        )
    
    # INVALIDATE CACHE AFTER SUCCESSFUL DELETION
    transaction.on_commit(invalidate_all_feedback_caches)


# ---------------------------------------------------------------------------
# Reply CRUD operations
# ---------------------------------------------------------------------------

def create_reply(
    *,
    feedback_id: int,
    replied_by,
    reply_text: str,
    is_public: bool = True,
) -> FeedbackReply:
    """Create a reply to feedback. Any authenticated user can reply."""
    
    feedback = get_feedback_by_id(feedback_id)
    
    if not feedback:
        raise ValueError("Feedback not found.")
    
    with transaction.atomic():
        reply = FeedbackReply.objects.create(
            feedback=feedback,
            replied_by=replied_by,
            reply_text=reply_text,
            is_public=is_public,
        )
    
    # INVALIDATE CACHE AFTER REPLY CREATION (replies appear in feedback detail)
    transaction.on_commit(invalidate_all_feedback_caches)
    
    # Send email to feedback author
    _send_reply_email_to_feedback_author(feedback, reply)
    
    return reply


def update_reply(
    *,
    reply_id: int,
    user,
    update_data: Dict[str, Any],
) -> FeedbackReply:
    """Update an existing reply (creator or superuser only)."""
    
    reply = get_reply_by_id(reply_id)
    
    if not reply:
        raise ValueError("Reply not found.")
    
    if reply.replied_by != user and not user.is_superuser:
        raise PermissionError("You don't have permission to update this reply.")
    
    with transaction.atomic():
        for field, value in update_data.items():
            if hasattr(reply, field):
                setattr(reply, field, value)
        
        reply.save()
    
    # INVALIDATE CACHE AFTER REPLY UPDATE
    transaction.on_commit(invalidate_all_feedback_caches)
    
    return reply


def delete_reply(
    *,
    reply_id: int,
    user,
) -> None:
    """Delete a reply (creator or superuser only)."""
    
    reply = get_reply_by_id(reply_id)
    
    if not reply:
        raise ValueError("Reply not found.")
    
    if reply.replied_by != user and not user.is_superuser:
        raise PermissionError("You don't have permission to delete this reply.")
    
    with transaction.atomic():
        reply.delete()
    
    # INVALIDATE CACHE AFTER REPLY DELETION
    transaction.on_commit(invalidate_all_feedback_caches)