"""
Tasks
=====
Email sending for the matches app (new-match notifications).

Synchronous -- no Celery, fits Render free tier.
"""

import logging

from django.conf import settings
from django.template.loader import render_to_string

from backend.brevo_client import send_brevo_email

logger = logging.getLogger(__name__)


def send_match_notification_email(*, match, role: str) -> bool:
    """
    Send a 'new match found' email to one side of a Match.

    role: "offer"   -> email goes to the Offer's owner, referencing their offer
                        as "own", and the matched Request as "other".
          "request" -> email goes to the Request's owner, referencing their
                        request as "own", and the matched Offer as "other".
    """
    matches_url = f"{settings.FRONTEND_BASE_URL.rstrip('/')}/matches"

    if role == "offer":
        recipient = match.offer.user
        own_post_label = "offer"
        other_post_title = match.request.request_name
    elif role == "request":
        recipient = match.request.user
        own_post_label = "request"
        other_post_title = match.offer.offer_name
    else:
        logger.error("send_match_notification_email: invalid role '%s'.", role)
        return False

    context = {
        "recipient_first_name": recipient.first_name or "there",
        "own_post_label": own_post_label,
        "other_post_title": other_post_title,
        "score": match.score,
        "matches_url": matches_url,
        "support_email": settings.BREVO_SENDER_EMAIL,
    }

    html_body = render_to_string("matches/match_notify_email.html", context)

    return send_brevo_email(
        to_email=recipient.email,
        to_name=recipient.first_name,
        subject="New Match Found on GazaBridgeX",
        html_content=html_body,
    )
