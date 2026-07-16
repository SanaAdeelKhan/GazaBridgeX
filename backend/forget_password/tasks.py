"""
Tasks
=====
Email sending for the forget_password app.

NOTE: This was originally a Celery task (see commented-out block below).
Switched to a plain synchronous function calling Brevo's HTTP API directly,
since Render's free tier cannot run a persistent Celery worker.
The Celery version is kept commented out in case we bring back a worker
in the future.
"""

import logging

from django.conf import settings
from django.core.cache import cache
from django.template.loader import render_to_string
from django.utils.html import strip_tags

from backend.brevo_client import send_brevo_email

logger = logging.getLogger(__name__)

_CACHE_KEY = "pwd_reset:{user_id}"
_CACHE_TTL  = 60 * 20  # 20 minutes


def build_cache_key(user_id: int) -> str:
    return _CACHE_KEY.format(user_id=user_id)


def send_password_reset_email(user_id: int) -> None:
    """
    Read the reset payload from Redis (DB-1) and send the HTML email via Brevo.

    Flow:
      1. Pull payload from Redis -- written by request_password_reset() service.
      2. Build the reset URL.
      3. Render the HTML email template.
      4. Send via Brevo (synchronous HTTP call).
      5. Delete the cache key.

    Falls back to DB on cache miss so no email is ever silently dropped.
    """
    cache_key = build_cache_key(user_id)
    payload   = cache.get(cache_key)

    if payload is None:
        logger.warning(
            "Cache miss for user_id=%s in send_password_reset_email. "
            "Fetching from DB.",
            user_id,
        )
        from forget_password.models import PasswordResetToken
        from users.selectors.user_selectors import get_user_by_id

        user = get_user_by_id(user_id)
        if user is None:
            logger.error("User %s not found. Aborting reset email.", user_id)
            return

        token = (
            PasswordResetToken.objects
            .filter(user=user, is_used=False)
            .order_by("-created_at")
            .first()
        )
        if token is None:
            logger.error("No active reset token for user %s. Aborting.", user_id)
            return

        payload = {
            "email":      user.email,
            "first_name": user.first_name,
            "token":      str(token.token),
        }

    reset_url = (
        f"{settings.FRONTEND_BASE_URL.rstrip('/')}"
        f"/forget-password/confirm/{payload['token']}/"
    )

    context = {
        "first_name":     payload["first_name"],
        "reset_url":      reset_url,
        "expiry_minutes": 15,
        "support_email":  settings.BREVO_SENDER_EMAIL,
    }

    html_body = render_to_string("forget_password/reset_email.html", context)

    try:
        send_brevo_email(
            to_email=payload["email"],
            to_name=payload["first_name"],
            subject="Reset your password",
            html_content=html_body,
        )
    finally:
        cache.delete(cache_key)


# ---------------------------------------------------------------------------
# ORIGINAL CELERY VERSION -- kept for reference / possible future revival.
# Do not delete. Requires a running Celery worker + Gmail SMTP to function.
# ---------------------------------------------------------------------------
#
# from celery import shared_task
# from django.core.mail import EmailMultiAlternatives
#
# @shared_task(
#     bind=True,
#     max_retries=3,
#     default_retry_delay=30,
#     name="forget_password.tasks.send_password_reset_email",
# )
# def send_password_reset_email_celery(self, user_id: int) -> None:
#     cache_key = build_cache_key(user_id)
#     payload   = cache.get(cache_key)
#
#     if payload is None:
#         logger.warning(
#             "Cache miss for user_id=%s in send_password_reset_email. "
#             "Fetching from DB.",
#             user_id,
#         )
#         from forget_password.models import PasswordResetToken
#         from forget_password.selectors.fp_selectors import get_user_by_email
#         from users.selectors.user_selectors import get_user_by_id
#
#         user = get_user_by_id(user_id)
#         if user is None:
#             logger.error("User %s not found. Aborting reset email task.", user_id)
#             return
#
#         token = (
#             PasswordResetToken.objects
#             .filter(user=user, is_used=False)
#             .order_by("-created_at")
#             .first()
#         )
#         if token is None:
#             logger.error("No active reset token for user %s. Aborting.", user_id)
#             return
#
#         payload = {
#             "email":      user.email,
#             "first_name": user.first_name,
#             "token":      str(token.token),
#         }
#
#     reset_url = (
#         f"{settings.BACKEND_BASE_URL.rstrip('/')}"
#         f"/forget-password/confirm/{payload['token']}/"
#     )
#
#     context = {
#         "first_name":     payload["first_name"],
#         "reset_url":      reset_url,
#         "expiry_minutes": 15,
#         "support_email":  settings.EMAIL_HOST_USER,
#     }
#
#     html_body  = render_to_string("forget_password/reset_email.html", context)
#     plain_body = strip_tags(html_body)
#
#     msg = EmailMultiAlternatives(
#         subject    = "Reset your password",
#         body       = plain_body,
#         from_email = settings.EMAIL_HOST_USER,
#         to         = [payload["email"]],
#     )
#     msg.attach_alternative(html_body, "text/html")
#
#     try:
#         msg.send(fail_silently=False)
#         logger.info("Password reset email sent to %s", payload["email"])
#     except Exception as exc:
#         logger.exception(
#             "Failed to send reset email to %s. Retrying.",
#             payload["email"],
#         )
#         raise self.retry(exc=exc)
#     finally:
#         cache.delete(cache_key)
