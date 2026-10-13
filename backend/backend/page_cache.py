"""Cache one page of a paginated list instead of the whole table.

The list views used to do ``list(queryset)`` (every row of the table), pickle
that entire list into Redis once per ``page``/``page_size`` key, and let DRF
slice the Python list. Every request - hit or miss - paid O(table size).

``CachedPageListMixin`` keeps the Redis cache (same 5-minute TTL, same
version-bump invalidation, same "first N pages only" rule) but caches only the
finished page - the serialized rows plus the pagination counts. A miss runs
COUNT + LIMIT/OFFSET in the database; a hit runs no list query at all.

The response body is identical to what ``StandardResultsSetPagination``
returned before.
"""

from rest_framework.response import Response
from rest_framework.utils.urls import remove_query_param, replace_query_param

from cache_utils import MAX_CACHED_PAGES, get_cached_list, set_cached_list


class CachedPageListMixin:
    """Use with ``generics.ListAPIView`` + ``StandardResultsSetPagination``.

    Subclasses set ``cache_prefix`` (the existing versioned list prefix, so the
    current invalidation keeps working) and implement ``get_cache_filters()``,
    returning the validated filter values that identify a distinct list.
    ``get_queryset()`` must return a lazy queryset.
    """

    cache_prefix = None

    def get_cache_prefix(self):
        return self.cache_prefix

    def get_cache_filters(self) -> dict:
        raise NotImplementedError

    def list(self, request, *args, **kwargs):
        # Validate filters (and enforce any per-request permission checks)
        # before touching the cache.
        filters = self.get_cache_filters()

        paginator = self.paginator
        page_size = paginator.get_page_size(request)
        try:
            page_number = int(request.query_params.get(paginator.page_query_param, 1))
        except (TypeError, ValueError):
            page_number = None  # e.g. "last" or garbage: let DRF handle it, uncached
        cacheable = page_number is not None and 1 <= page_number <= MAX_CACHED_PAGES

        prefix = self.get_cache_prefix()
        # ``kind`` keeps these keys distinct from the old whole-list entries
        # that may still be sitting in Redis under the same version.
        key = dict(filters, kind="page", page=page_number, page_size=page_size)

        if cacheable:
            cached = get_cached_list(prefix, **key)
            if cached is not None:
                return Response(self._with_links(cached, request, paginator))

        queryset = self.filter_queryset(self.get_queryset())
        page = paginator.paginate_queryset(queryset, request, view=self)
        serializer = self.get_serializer(page, many=True)
        response = paginator.get_paginated_response(serializer.data)

        if cacheable:
            payload = {
                "pagination": dict(response.data["pagination"], next=None, previous=None),
                "results": response.data["results"],
            }
            set_cached_list(prefix, payload, **key)

        return response

    @staticmethod
    def _with_links(payload, request, paginator):
        """Rebuild next/previous links for this request's URL (they are not cached)."""
        data = {
            "pagination": dict(payload["pagination"]),
            "results": payload["results"],
        }
        pagination = data["pagination"]
        param = paginator.page_query_param
        current, total = pagination["page"], pagination["total_pages"]
        url = request.build_absolute_uri()

        pagination["next"] = replace_query_param(url, param, current + 1) if current < total else None
        if current > 1:
            pagination["previous"] = (
                remove_query_param(url, param) if current - 1 == 1
                else replace_query_param(url, param, current - 1)
            )
        else:
            pagination["previous"] = None
        return data
