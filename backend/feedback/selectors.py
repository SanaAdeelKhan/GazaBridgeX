"""
Selectors
=========
Pure read layer — no writes, no side effects.

Caching policy:
- Rating summaries: cached 5 minutes (updated via cache invalidation).
- Feedback lists: cached 5 minutes (updated via cache invalidation).
- Single feedback: no cache (mutable, user-specific).
"""

from typing import Optional, Dict, Any, List

from django.contrib.contenttypes.models import ContentType
from django.db.models import QuerySet, Q

from feedback.models import Feedback, FeedbackReply, RatingSummary, FeedbackTypeChoices
from cache_utils import get_cached_list, set_cached_list, get_cache_version


# ---------------------------------------------------------------------------
# Feedback selectors
# ---------------------------------------------------------------------------

def get_feedback_by_id(feedback_id: int) -> Optional[Feedback]:
    """Get feedback by ID with user, roles, and replies prefetched."""
    return (
        Feedback.objects
        .select_related("user", "content_type")
        .prefetch_related(
            "user__roles",
            "replies",
            "replies__replied_by",
            "replies__replied_by__roles",
        )
        .filter(pk=feedback_id)
        .first()
    )


def get_reply_by_id(reply_id: int) -> Optional[FeedbackReply]:
    """Get reply by ID with user and roles prefetched."""
    return (
        FeedbackReply.objects
        .select_related("replied_by", "feedback")
        .prefetch_related("replied_by__roles")
        .filter(pk=reply_id)
        .first()
    )


def get_feedback_with_filters(
    feedback_type: Optional[str] = None,
    object_id: Optional[int] = None,
    rating: Optional[int] = None,
    sort: str = "newest",
    page: int = 1,
    page_size: int = 20,
    only_public: bool = True,
) -> Dict[str, Any]:
    """
    Get feedback with filters and pagination.
    Results are cached briefly (5 min).
    """
    # Build cache key parameters
    cache_kwargs = {
        "feedback_type": feedback_type or "all",
        "object_id": object_id or "none",
        "rating": rating or "all",
        "sort": sort,
        "page": page,
        "page_size": page_size,
        "only_public": str(only_public),
    }
    
    # Try to get from cache
    cached_result = get_cached_list("feedback_list", **cache_kwargs)
    if cached_result is not None:
        return cached_result
    
    queryset = (
        Feedback.objects
        .select_related("user", "content_type")
        .prefetch_related(
            "user__roles",
            "replies",
            "replies__replied_by",
            "replies__replied_by__roles",
        )
    )
    
    if only_public:
        queryset = queryset.filter(is_public=True)
    
    if feedback_type:
        queryset = queryset.filter(feedback_type=feedback_type)
        
        if feedback_type != FeedbackTypeChoices.PLATFORM and object_id:
            # Get content type for the feedback type
            content_type = _get_content_type_for_feedback_type(feedback_type)
            if content_type:
                queryset = queryset.filter(
                    content_type=content_type,
                    object_id=object_id,
                )
    
    if rating:
        queryset = queryset.filter(rating=rating)
    
    # Apply sorting
    if sort == "rating":
        queryset = queryset.order_by("-rating", "-created_at")
    else:  # newest
        queryset = queryset.order_by("-created_at")
    
    start = (page - 1) * page_size
    end = start + page_size
    
    total_count = queryset.count()
    feedbacks = list(queryset[start:end])
    
    result = {
        "feedbacks": feedbacks,
        "total_count": total_count,
        "page": page,
        "page_size": page_size,
        "total_pages": (total_count + page_size - 1) // page_size if total_count > 0 else 1,
    }
    
    # Cache the result
    set_cached_list("feedback_list", result, **cache_kwargs)
    
    return result


def _get_content_type_for_feedback_type(feedback_type: str) -> Optional[ContentType]:
    """Map feedback type to ContentType."""
    from django.apps import apps
    
    model_map = {
        FeedbackTypeChoices.COURSE: "courses.Course",
        FeedbackTypeChoices.LIVE_SECTION: "live_sections.LiveSection",
    }
    
    model_path = model_map.get(feedback_type)
    if not model_path:
        return None
    
    app_label, model_name = model_path.split(".")
    try:
        return ContentType.objects.get(app_label=app_label, model=model_name)
    except ContentType.DoesNotExist:
        return None


# ---------------------------------------------------------------------------
# Rating summary selectors
# ---------------------------------------------------------------------------

def get_rating_summary(
    feedback_type: Optional[str] = None,
    object_id: Optional[int] = None,
) -> Optional[RatingSummary]:
    """Get rating summary for a target (platform, course, or live_section)."""
    
    queryset = RatingSummary.objects.all()
    
    if feedback_type:
        queryset = queryset.filter(feedback_type=feedback_type)
        
        if feedback_type != FeedbackTypeChoices.PLATFORM and object_id:
            content_type = _get_content_type_for_feedback_type(feedback_type)
            if content_type:
                queryset = queryset.filter(
                    content_type=content_type,
                    object_id=object_id,
                )
    else:
        # Default to platform rating summary
        queryset = queryset.filter(
            feedback_type=FeedbackTypeChoices.PLATFORM,
            content_type__isnull=True,
            object_id__isnull=True,
        )
    
    return queryset.first()


def get_all_rating_summaries(
    feedback_type: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
) -> Dict[str, Any]:
    """
    Get all rating summaries with pagination.
    Used for the ratings endpoint when no specific target is requested.
    """
    cache_kwargs = {
        "feedback_type": feedback_type or "all",
        "page": page,
        "page_size": page_size,
    }
    
    cached_result = get_cached_list("rating_summaries", **cache_kwargs)
    if cached_result is not None:
        return cached_result
    
    queryset = RatingSummary.objects.all()
    
    if feedback_type:
        queryset = queryset.filter(feedback_type=feedback_type)
    
    queryset = queryset.order_by("feedback_type", "object_id")
    
    start = (page - 1) * page_size
    end = start + page_size
    
    total_count = queryset.count()
    summaries = list(queryset[start:end])
    
    result = {
        "summaries": summaries,
        "total_count": total_count,
        "page": page,
        "page_size": page_size,
        "total_pages": (total_count + page_size - 1) // page_size if total_count > 0 else 1,
    }
    
    set_cached_list("rating_summaries", result, **cache_kwargs)
    
    return result