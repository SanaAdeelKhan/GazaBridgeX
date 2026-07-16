"""
Matches Services
================
Core matching logic: given an Offer or Request, find candidates on the
opposite side with the same category, score them by keyword overlap,
and persist as Match rows.
"""
import logging
import re

from matches.models import Match

logger = logging.getLogger(__name__)

STOPWORDS = {
    "the", "and", "for", "with", "from", "that", "this", "have", "will",
    "your", "you", "are", "was", "were", "been", "being", "would", "could",
    "should", "about", "into", "over", "such", "than", "then", "them",
    "they", "their", "there", "here", "what", "when", "where", "which",
    "who", "whom", "why", "how", "can", "just", "also", "very", "some",
    "any", "all", "each", "more", "most", "other", "own", "same", "not",
    "only", "but", "and", "or", "if", "while", "because", "our", "out",
    "off", "again", "further", "once", "does", "did", "doing", "get",
    "got", "like", "want", "need", "able", "help", "offer", "offering",
    "offered", "request", "requesting", "looking", "seeking", "please",
}


def extract_keywords(text: str) -> set:
    """Lowercase, strip punctuation, drop stopwords/short words."""
    if not text:
        return set()
    words = re.findall(r"[a-zA-Z]+", text.lower())
    return {w for w in words if len(w) > 3 and w not in STOPWORDS}


def compute_score(offer, request):
    """
    Returns an integer 50-100 if categories match, else None (no match).
    50 = same category baseline. +up to 50 for keyword overlap between
    the two descriptions (Jaccard similarity of meaningful words).
    Never matches a user with their own post.
    """
    if offer.user_id == request.user_id:
        return None
    if offer.category != request.category:
        return None

    base = 50
    offer_kw = extract_keywords(offer.description)
    req_kw = extract_keywords(request.description)
    union = offer_kw | req_kw

    if not union:
        bonus = 0
    else:
        overlap_ratio = len(offer_kw & req_kw) / len(union)
        bonus = round(overlap_ratio * 50)

    return base + bonus


def _upsert_match(offer, request, score):
    match, created = Match.objects.update_or_create(
        offer=offer,
        request=request,
        defaults={"score": score},
    )

    if created:
        from matches.tasks import send_match_notification_email

        try:
            if send_match_notification_email(match=match, role="offer"):
                match.notified_offer_user = True
        except Exception:
            logger.exception("Failed to send match notification (offer side) for match %s.", match.pk)

        try:
            if send_match_notification_email(match=match, role="request"):
                match.notified_request_user = True
        except Exception:
            logger.exception("Failed to send match notification (request side) for match %s.", match.pk)

        match.save(update_fields=["notified_offer_user", "notified_request_user"])


def compute_matches_for_offer(offer):
    """Find/refresh matches between this Offer and all active Requests."""
    from posts.models import Request, PostStatusChoices

    candidates = Request.objects.filter(
        category=offer.category,
        status=PostStatusChoices.ACTIVE,
    )
    results = []
    for req in candidates:
        score = compute_score(offer, req)
        if score is not None:
            _upsert_match(offer, req, score)
            results.append((req, score))
    return results


def compute_matches_for_request(request):
    """Find/refresh matches between this Request and all active Offers."""
    from posts.models import Offer, PostStatusChoices

    candidates = Offer.objects.filter(
        category=request.category,
        status=PostStatusChoices.ACTIVE,
    )
    results = []
    for offer in candidates:
        score = compute_score(offer, request)
        if score is not None:
            _upsert_match(offer, request, score)
            results.append((offer, score))
    return results


def recompute_all_matches():
    """Full recompute across all active offers/requests. Manual trigger."""
    from posts.models import Offer, PostStatusChoices

    total = 0
    for offer in Offer.objects.filter(status=PostStatusChoices.ACTIVE):
        total += len(compute_matches_for_offer(offer))
    return total


def recompute_matches_for_user(user):
    """
    Manual re-check scoped to one user's own active posts (both as an
    offerer and as a seeker). Used by the "Find Matches" button.
    """
    from posts.models import Offer, Request, PostStatusChoices

    total = 0
    for offer in Offer.objects.filter(user=user, status=PostStatusChoices.ACTIVE):
        total += len(compute_matches_for_offer(offer))
    for req in Request.objects.filter(user=user, status=PostStatusChoices.ACTIVE):
        total += len(compute_matches_for_request(req))
    return total
