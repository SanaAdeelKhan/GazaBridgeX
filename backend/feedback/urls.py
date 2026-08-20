"""
URL Configuration
================
"""

from django.urls import path

from .views import (
    FeedbackListCreateView,
    FeedbackDetailView,
    RatingSummaryView,
    ReplyListCreateView,
    ReplyDetailView,
)

app_name = "feedback"

urlpatterns = [
    # Feedback CRUD
    path("", FeedbackListCreateView.as_view(), name="feedback-list-create"),
    path("<int:pk>/", FeedbackDetailView.as_view(), name="feedback-detail"),
    
    # Reply CRUD
    path("<int:feedback_id>/replies/", ReplyListCreateView.as_view(), name="reply-list-create"),
    path("<int:feedback_id>/replies/<int:reply_id>/", ReplyDetailView.as_view(), name="reply-detail"),
    
    # Rating summaries
    path("ratings/", RatingSummaryView.as_view(), name="rating-summary"),
]