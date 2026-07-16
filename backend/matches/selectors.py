"""
Matches Selectors
=================
Read-only queries for the matches app.
"""
from django.db.models import Q, F

from matches.models import Match


def get_matches_for_user(user, role=None):
    """
    All matches where the user owns either the Offer or the Request side,
    ordered by score descending (best matches first). Self-matches (where
    the same user owns both sides) are hidden — not deleted, just excluded
    from what's shown.

    role: optional filter — "offerer" (only matches on the user's Offers)
          or "seeker" (only matches on the user's Requests). None = both.
    """
    qs = Match.objects.filter(
        Q(offer__user=user) | Q(request__user=user)
    ).exclude(offer__user=F("request__user"))

    if role == "offerer":
        qs = qs.filter(offer__user=user)
    elif role == "seeker":
        qs = qs.filter(request__user=user)

    return (
        qs.select_related("offer", "request", "offer__user", "request__user")
        .order_by("-score", "-created_at")
    )
