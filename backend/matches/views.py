"""
Matches Views
=============
"""
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from matches.selectors import get_matches_for_user
from matches.serializers import MatchOutputSerializer
from matches.services import recompute_matches_for_user
from backend.pagination import StandardResultsSetPagination


class MatchListView(generics.ListAPIView):
    """GET /matches/ — matches involving the current user's own posts."""
    permission_classes = [IsAuthenticated]
    serializer_class = MatchOutputSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        role = self.request.query_params.get("role")
        return get_matches_for_user(self.request.user, role=role)


class MatchRecheckView(APIView):
    """POST /matches/recheck/ — manually re-run matching for the user's own posts."""
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        count = recompute_matches_for_user(request.user)
        return Response(
            {"detail": f"Re-checked matches, {count} match(es) found/updated."},
            status=status.HTTP_200_OK,
        )
