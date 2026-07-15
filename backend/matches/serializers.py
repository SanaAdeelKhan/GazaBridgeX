"""
Matches Serializers
====================
"""
from rest_framework import serializers

from matches.models import Match
from posts.serializers import OfferOutputSerializer, RequestOutputSerializer


class MatchOutputSerializer(serializers.ModelSerializer):
    offer = OfferOutputSerializer(read_only=True)
    request = RequestOutputSerializer(read_only=True)

    class Meta:
        model = Match
        fields = ["id", "offer", "request", "score", "created_at"]
