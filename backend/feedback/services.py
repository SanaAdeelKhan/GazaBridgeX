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
    RatingSummary,
    FeedbackTypeChoices,
)
from feedback.selectors import (
    get_feedback_by_id,
    _get_content_type_for_feedback_type,
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