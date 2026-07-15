"""
Matches Selectors
=================
Read-only queries for the matches app.
"""
from django.db.models import Q

from matches.models import Match


def get_matches_for_user(user):
    """
    All matches where the user owns either the Offer or the Request side,
    ordered by score descending (best matches first).
    """
    return (
        Match.objects.filter(
            Q(offer__user=user) | Q(request__user=user)
        )
        .select_related("offer", "request", "offer__user", "request__user")
        .order_by("-score", "-created_at")
    )
