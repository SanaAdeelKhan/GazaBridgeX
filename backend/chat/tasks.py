"""
Tasks
=====
Email sending for the chat app (manual "notify via email" trigger).

Synchronous -- no Celery, fits Render free tier.
"""

import logging

from django.conf import settings
from django.template.loader import render_to_string

from backend.brevo_client import send_brevo_email

logger = logging.getLogger(__name__)


def send_chat_notify_email(*, recipient_email: str, recipient_first_name: str, sender_name: str) -> bool:
    """Send a 'you have a new message' email via Brevo (synchronous)."""
    chat_url = f"{settings.FRONTEND_BASE_URL.rstrip('/')}/chat"

    context = {
        "recipient_first_name": recipient_first_name,
        "sender_name": sender_name,
        "chat_url": chat_url,
        "support_email": settings.BREVO_SENDER_EMAIL,
    }

    html_body = render_to_string("chat/message_notify_email.html", context)

    return send_brevo_email(
        to_email=recipient_email,
        to_name=recipient_first_name,
        subject=f"{sender_name} sent you a message on GazaBridge",
        html_content=html_body,
    )
