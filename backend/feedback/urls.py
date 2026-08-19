"""
URL Configuration
================
"""

from django.urls import path

from .views import (
    FeedbackListCreateView,
    FeedbackDetailView,
    RatingSummaryView,
)

app_name = "feedback"

urlpatterns = [
    # Feedback CRUD
    path("", FeedbackListCreateView.as_view(), name="feedback-list-create"),
    path("<int:pk>/", FeedbackDetailView.as_view(), name="feedback-detail"),
    
    # Rating summaries
    path("ratings/", RatingSummaryView.as_view(), name="rating-summary"),
]