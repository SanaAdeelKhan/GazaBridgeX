"""
Brevo Client
============
Synchronous HTTP wrapper around Brevo's transactional email API.

Used in place of Celery + Gmail SMTP, since Render's free tier
cannot run a persistent Celery worker. All calls here are
fire-inline (blocking) inside the request/response cycle, and
are wrapped so that a failed email never raises -- callers get
back a plain boolean.
"""

import logging

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"
REQUEST_TIMEOUT_SECONDS = 10


def send_brevo_email(
    *,
    to_email: str,
    to_name: str,
    subject: str,
    html_content: str,
) -> bool:
    """
    Send a transactional email via Brevo's HTTP API.

    Returns True on success, False on any failure (never raises).
    Callers should treat a False return as "email not sent" and
    proceed without blocking the rest of the request.
    """
    if not settings.BREVO_API_KEY:
        logger.error("BREVO_API_KEY is not set. Skipping email to %s.", to_email)
        return False

    payload = {
        "sender": {
            "email": settings.BREVO_SENDER_EMAIL,
            "name": settings.BREVO_SENDER_NAME,
        },
        "to": [{"email": to_email, "name": to_name or to_email}],
        "subject": subject,
        "htmlContent": html_content,
    }

    headers = {
        "accept": "application/json",
        "api-key": settings.BREVO_API_KEY,
        "content-type": "application/json",
    }

    try:
        response = requests.post(
            BREVO_API_URL,
            json=payload,
            headers=headers,
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        logger.info("Brevo email sent to %s (subject: %s)", to_email, subject)
        return True
    except requests.exceptions.RequestException:
        logger.exception("Brevo email failed for %s (subject: %s)", to_email, subject)
        return False
