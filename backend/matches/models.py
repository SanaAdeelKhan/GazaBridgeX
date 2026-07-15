"""
Matches Models
==============
Represents a computed relationship between an Offer (volunteer) and a
Request (seeker). A match only exists when both posts share the same
category; the score also factors in description keyword overlap.
"""
from django.db import models


class Match(models.Model):
    """
    A scored match between an Offer and a Request.
    Score is 50-100: 50 baseline for same category, up to +50 bonus
    for shared keywords between the two descriptions.
    """
    offer = models.ForeignKey(
        "posts.Offer",
        on_delete=models.CASCADE,
        related_name="matches",
    )
    request = models.ForeignKey(
        "posts.Request",
        on_delete=models.CASCADE,
        related_name="matches",
    )
    score = models.PositiveSmallIntegerField(
        help_text="Match score 50-100 (50=same category, up to +50 for keyword overlap)."
    )
    notified_offer_user = models.BooleanField(default=False)
    notified_request_user = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-score", "-created_at"]
        unique_together = ("offer", "request")
        indexes = [
            models.Index(fields=["offer", "-score"]),
            models.Index(fields=["request", "-score"]),
        ]

    def __str__(self) -> str:
        return f"Match(offer={self.offer_id}, request={self.request_id}, score={self.score})"
