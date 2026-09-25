"""Project-wide search predicate builder."""

from django.db.models import Q


def search_q(term, *fields) -> Q:
    """Build a case-insensitive substring match across the given fields.

    Blank terms return an empty Q object so callers can apply the predicate
    unconditionally. Fields may be relation paths such as ``supplier__name``.
    """
    if term is None:
        return Q()

    term = str(term).strip()
    if not term:
        return Q()

    query = Q()
    for field in fields:
        query |= Q(**{f"{field}__icontains": term})
    return query
