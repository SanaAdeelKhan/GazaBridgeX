from django.urls import path

from matches.views import MatchListView, MatchRecheckView

app_name = "matches"

urlpatterns = [
    path("recheck/", MatchRecheckView.as_view(), name="match-recheck"),
    path("", MatchListView.as_view(), name="match-list"),
]
