"""
Matches Services
================
Core matching logic: given an Offer or Request, find candidates on the
opposite side with the same category, score them by keyword overlap,
and persist as Match rows.
"""
import logging
import re

from django.db import IntegrityError, transaction
from django.utils import timezone

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


def _score_from_keywords(offer_kw: set, req_kw: set) -> int:
    """Baseline 50 + up to 50 for Jaccard overlap of the two keyword sets."""
    base = 50
    union = offer_kw | req_kw

    if not union:
        bonus = 0
    else:
        overlap_ratio = len(offer_kw & req_kw) / len(union)
        bonus = round(overlap_ratio * 50)

    return base + bonus


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

    return _score_from_keywords(
        extract_keywords(offer.description),
        extract_keywords(request.description),
    )


def _notify_new_match(match):
    """Send the two 'new match' emails (synchronous Brevo) and set the flags."""
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


def _sync_matches(anchor, candidates, anchor_side: str):
    """Score ``anchor`` against ``candidates`` and persist the Match rows.

    anchor_side is "offer" (candidates are Requests) or "request" (candidates
    are Offers). Same results as the old per-candidate update_or_create loop,
    but with a constant number of queries: the anchor's keywords are extracted
    once, existing matches are loaded in one query, and rows are written with
    bulk_create / bulk_update.

    Returns ``[(candidate, score), ...]`` for every matching candidate.
    """
    other_side = "request" if anchor_side == "offer" else "offer"
    anchor_kw = extract_keywords(anchor.description)

    scored = []
    for cand in candidates:
        offer, request = (anchor, cand) if anchor_side == "offer" else (cand, anchor)
        if offer.user_id == request.user_id:
            continue
        if offer.category != request.category:
            continue
        cand_kw = extract_keywords(cand.description)
        offer_kw, req_kw = (anchor_kw, cand_kw) if anchor_side == "offer" else (cand_kw, anchor_kw)
        scored.append((cand, _score_from_keywords(offer_kw, req_kw)))

    if not scored:
        return []

    existing = {
        getattr(m, f"{other_side}_id"): m
        for m in Match.objects.filter(**{anchor_side: anchor})
    }

    now = timezone.now()
    to_create, to_update = [], []
    for cand, score in scored:
        match = existing.get(cand.pk)
        if match is None:
            offer, request = (anchor, cand) if anchor_side == "offer" else (cand, anchor)
            to_create.append(Match(offer=offer, request=request, score=score))
        else:
            # update_or_create used to save() every existing row, bumping
            # updated_at; bulk_update skips auto_now, so set it explicitly.
            match.score = score
            match.updated_at = now
            to_update.append(match)

    if to_update:
        Match.objects.bulk_update(to_update, ["score", "updated_at"], batch_size=500)

    created = []
    if to_create:
        try:
            with transaction.atomic():
                Match.objects.bulk_create(to_create, batch_size=500)
            created = to_create
        except IntegrityError:
            # A concurrent request inserted one of these pairs first: fall
            # back to the previous row-by-row upsert for this batch.
            for m in to_create:
                obj, was_created = Match.objects.update_or_create(
                    offer=m.offer, request=m.request, defaults={"score": m.score},
                )
                if was_created:
                    created.append(obj)

    if created:
        if any(m.pk is None for m in created):
            # Backend did not return primary keys from bulk_create: reload them.
            ids = [getattr(m, f"{other_side}_id") for m in created]
            by_other = {
                getattr(m, f"{other_side}_id"): m
                for m in Match.objects.filter(**{anchor_side: anchor, f"{other_side}_id__in": ids})
            }
            for m in created:
                m.pk = by_other[getattr(m, f"{other_side}_id")].pk
        for m in created:
            _notify_new_match(m)
        Match.objects.bulk_update(created, ["notified_offer_user", "notified_request_user"])

    return scored


def compute_matches_for_offer(offer):
    """Find/refresh matches between this Offer and all active Requests."""
    from posts.models import Request, PostStatusChoices

    candidates = Request.objects.filter(
        category=offer.category,
        status=PostStatusChoices.ACTIVE,
    ).select_related("user")
    return _sync_matches(offer, candidates, "offer")


def compute_matches_for_request(request):
    """Find/refresh matches between this Request and all active Offers."""
    from posts.models import Offer, PostStatusChoices

    candidates = Offer.objects.filter(
        category=request.category,
        status=PostStatusChoices.ACTIVE,
    ).select_related("user")
    return _sync_matches(request, candidates, "request")


def recompute_all_matches():
    """Full recompute across all active offers/requests. Manual trigger."""
    from posts.models import Offer, PostStatusChoices

    total = 0
    for offer in Offer.objects.filter(status=PostStatusChoices.ACTIVE).select_related("user"):
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
