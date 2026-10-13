"""
Selectors
=========
Pure read layer — no Redis, simple DB queries.
"""

from typing import Dict, List
from django.db.models import Count, Exists, OuterRef, Q
from users.models import User


def _has_role(name: str) -> Exists:
    """Correlated EXISTS on the user<->role link table.

    Replaces roles__name joins + .distinct() + .exclude(...) subqueries, so a
    user is never duplicated by the join and no DISTINCT sort is needed.
    """
    return Exists(
        User.roles.through.objects.filter(user_id=OuterRef("pk"), role__name=name)
    )


def _role_flagged_users():
    """Non-superusers annotated with volunteer / seeker / manager role flags."""
    return User.objects.filter(is_superuser=False).annotate(
        has_volunteer=_has_role("volunteer"),
        has_seeker=_has_role("seeker"),
        has_manager=_has_role("manager"),
    )


def get_user_stats() -> Dict[str, int]:
    """
    Get user statistics excluding superusers.

    Rules:
    - inactive users: ONLY in inactive count
    - admins (is_staff=True): ONLY in admin count
    - managers (has manager role): ONLY in manager count
    - volunteer only (no seeker, no manager): volunteers count
    - seeker only (no volunteer, no manager): seekers count
    - both volunteer and seeker (no manager): both count

    Superusers excluded from all counts.
    """
    active_non_staff = Q(is_active=True, is_staff=False)
    # One scan of the users table instead of six separate COUNT queries.
    counts = _role_flagged_users().aggregate(
        inactive=Count("pk", filter=Q(is_active=False)),
        admins=Count("pk", filter=Q(is_active=True, is_staff=True)),
        managers=Count("pk", filter=active_non_staff & Q(has_manager=True)),
        volunteers=Count(
            "pk",
            filter=active_non_staff & Q(has_volunteer=True, has_seeker=False, has_manager=False),
        ),
        seekers=Count(
            "pk",
            filter=active_non_staff & Q(has_seeker=True, has_volunteer=False, has_manager=False),
        ),
        both=Count(
            "pk",
            filter=active_non_staff & Q(has_volunteer=True, has_seeker=True, has_manager=False),
        ),
    )

    inactive = counts["inactive"]
    admins = counts["admins"]
    managers = counts["managers"]
    volunteers = counts["volunteers"]
    seekers = counts["seekers"]
    both = counts["both"]

    total = volunteers + seekers + both + managers + admins + inactive

    return {
        "total_users": total,
        "volunteers": volunteers,
        "seekers": seekers,
        "both": both,
        "managers": managers,
        "admins": admins,
        "inactive": inactive,
    }


def get_volunteers():
    """Get users who are ONLY volunteers (active, not staff, not manager, not superuser)."""
    return _role_flagged_users().filter(
        is_active=True,
        is_staff=False,
        has_volunteer=True,
        has_seeker=False,
        has_manager=False,
    ).prefetch_related("roles").order_by("email")


def get_seekers():
    """Get users who are ONLY seekers (active, not staff, not manager, not superuser)."""
    return _role_flagged_users().filter(
        is_active=True,
        is_staff=False,
        has_seeker=True,
        has_volunteer=False,
        has_manager=False,
    ).prefetch_related("roles").order_by("email")


def get_both():
    """Get users who are BOTH volunteer and seeker (active, not staff, not manager, not superuser)."""
    return _role_flagged_users().filter(
        is_active=True,
        is_staff=False,
        has_volunteer=True,
        has_seeker=True,
        has_manager=False,
    ).prefetch_related("roles").order_by("email")


def get_managers():
    """Get users with manager role (active, not staff, not superuser)."""
    return _role_flagged_users().filter(
        is_active=True,
        is_staff=False,
        has_manager=True,
    ).prefetch_related("roles").order_by("email")


def get_admins():
    """Get users with is_staff=True (active, not superuser)."""
    return User.objects.filter(
        is_superuser=False,
        is_active=True,
        is_staff=True
    ).prefetch_related("roles").order_by("email")


def get_inactive_users():
    """Get users with is_active=False (not superuser)."""
    return User.objects.filter(
        is_superuser=False,
        is_active=False
    ).prefetch_related("roles").order_by("email")