"""
Views
=====
Thin HTTP layer with proper permissions.
Pattern per view: validate input → call service → return output.
"""

import logging

from rest_framework import generics, status, views
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from feedback.serializers import (
    FeedbackCreateInputSerializer,
    FeedbackUpdateInputSerializer,
    FeedbackOutputSerializer,
    FeedbackListQuerySerializer,
    RatingSummaryQuerySerializer,
    RatingSummaryOutputSerializer,
    ReplyCreateInputSerializer,
    ReplyUpdateInputSerializer,
    ReplyOutputSerializer,
)
from feedback.services import (
    create_feedback,
    update_feedback,
    delete_feedback,
    create_reply,
    update_reply,
    delete_reply,
)
from feedback.selectors import (
    get_feedback_by_id,
    get_feedback_with_filters,
    get_rating_summary,
    get_all_rating_summaries,
    get_reply_by_id,
)
from feedback.permissions import (
    IsOwnerOrReadOnly,
    CanCreateReply,
    CanModifyReply,
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Feedback CRUD
# ---------------------------------------------------------------------------

class FeedbackListCreateView(generics.ListCreateAPIView):
    """
    GET /feedback/ - List public feedback (any user)
    POST /feedback/ - Create feedback (authenticated only)
    """
    
    permission_classes = [IsOwnerOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return FeedbackCreateInputSerializer
        return FeedbackOutputSerializer
    
    def list(self, request, *args, **kwargs):
        query_serializer = FeedbackListQuerySerializer(data=request.query_params)
        query_serializer.is_valid(raise_exception=True)
        
        params = query_serializer.validated_data
        
        result = get_feedback_with_filters(
            feedback_type=params.get('feedback_type'),
            object_id=params.get('object_id'),
            rating=params.get('rating'),
            sort=params.get('sort', 'newest'),
            page=params.get('page', 1),
            page_size=params.get('page_size', 20),
            only_public=True,
        )
        
        serializer = FeedbackOutputSerializer(result['feedbacks'], many=True)
        
        return Response({
            "feedbacks": serializer.data,
            "pagination": {
                "total_count": result['total_count'],
                "page": result['page'],
                "page_size": result['page_size'],
                "total_pages": result['total_pages'],
            }
        })
    
    def create(self, request, *args, **kwargs):
        input_serializer = self.get_serializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        data = input_serializer.validated_data
        
        try:
            feedback = create_feedback(
                user=request.user,
                feedback_type=data["feedback_type"],
                rating=data["rating"],
                feedback_text=data["feedback_text"],
                object_id=data.get("object_id"),
                is_public=data.get("is_public", True),
            )
        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception:
            logger.exception("Unexpected error during feedback creation.")
            return Response(
                {"detail": "Feedback creation failed due to a server error."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        
        output = FeedbackOutputSerializer(feedback).data
        return Response(
            {
                **output,
                "message": "Feedback submitted successfully.",
            },
            status=status.HTTP_201_CREATED,
        )


class FeedbackDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /feedback/{id}/ - Get feedback detail (public)
    PUT/PATCH /feedback/{id}/ - Update own feedback
    DELETE /feedback/{id}/ - Delete own feedback
    """
    
    permission_classes = [IsOwnerOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return FeedbackUpdateInputSerializer
        return FeedbackOutputSerializer
    
    def get_object(self):
        feedback_id = self.kwargs.get('pk')
        feedback = get_feedback_by_id(feedback_id)
        
        if not feedback:
            return None
        
        # Check object permissions
        self.check_object_permissions(self.request, feedback)
        
        return feedback
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response(
                {"detail": "Feedback not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = FeedbackOutputSerializer(instance)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response(
                {"detail": "Feedback not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if instance.user != request.user:
            raise PermissionDenied("You don't have permission to update this feedback.")
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            updated_feedback = update_feedback(
                feedback_id=instance.pk,
                user=request.user,
                update_data=serializer.validated_data,
            )
        except (ValueError, PermissionError) as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        output_serializer = FeedbackOutputSerializer(updated_feedback)
        return Response(output_serializer.data)
    
    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response(
                {"detail": "Feedback not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if instance.user != request.user:
            raise PermissionDenied("You don't have permission to delete this feedback.")
        
        try:
            delete_feedback(
                feedback_id=instance.pk,
                user=request.user,
            )
        except (ValueError, PermissionError) as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        return Response(
            {"detail": "Feedback deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )


# ---------------------------------------------------------------------------
# Reply Views
# ---------------------------------------------------------------------------

class ReplyListCreateView(generics.ListCreateAPIView):
    """
    GET /feedback/{feedback_id}/replies/ - List public replies
    POST /feedback/{feedback_id}/replies/ - Create reply (owner/superuser only)
    """
    
    permission_classes = [CanCreateReply]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ReplyCreateInputSerializer
        return ReplyOutputSerializer
    
    def get_feedback(self, feedback_id):
        feedback = get_feedback_by_id(feedback_id)
        if not feedback:
            return None
        
        # Check object permissions
        self.check_object_permissions(self.request, feedback)
        
        return feedback
    
    def list(self, request, feedback_id=None):
        feedback = self.get_feedback(feedback_id)
        if not feedback:
            return Response(
                {"detail": "Feedback not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        replies = feedback.replies.filter(is_public=True)
        serializer = ReplyOutputSerializer(replies, many=True)
        
        return Response({"replies": serializer.data})
    
    def create(self, request, feedback_id=None):
        feedback = self.get_feedback(feedback_id)
        if not feedback:
            return Response(
                {"detail": "Feedback not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        input_serializer = self.get_serializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        data = input_serializer.validated_data
        
        try:
            reply = create_reply(
                feedback_id=feedback.pk,
                replied_by=request.user,
                reply_text=data["reply_text"],
                is_public=data.get("is_public", True),
            )
        except (ValueError, PermissionError) as exc:
            status_code = (
                status.HTTP_403_FORBIDDEN
                if isinstance(exc, PermissionError)
                else status.HTTP_400_BAD_REQUEST
            )
            return Response(
                {"detail": str(exc)},
                status=status_code,
            )
        except Exception:
            logger.exception("Unexpected error during reply creation.")
            return Response(
                {"detail": "Reply creation failed due to a server error."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        
        output = ReplyOutputSerializer(reply).data
        return Response(
            {
                **output,
                "message": "Reply added successfully.",
            },
            status=status.HTTP_201_CREATED,
        )


class ReplyDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /feedback/{feedback_id}/replies/{reply_id}/ - Get reply detail (public)
    PUT/PATCH /feedback/{feedback_id}/replies/{reply_id}/ - Update reply
    DELETE /feedback/{feedback_id}/replies/{reply_id}/ - Delete reply
    """
    
    permission_classes = [CanModifyReply]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ReplyUpdateInputSerializer
        return ReplyOutputSerializer
    
    def get_object(self):
        reply_id = self.kwargs.get('reply_id')
        reply = get_reply_by_id(reply_id)
        
        if not reply:
            return None
        
        # Check object permissions
        self.check_object_permissions(self.request, reply)
        
        return reply
    
    def retrieve(self, request, feedback_id=None, reply_id=None):
        instance = self.get_object()
        if not instance:
            return Response(
                {"detail": "Reply not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = ReplyOutputSerializer(instance)
        return Response(serializer.data)
    
    def update(self, request, feedback_id=None, reply_id=None):
        instance = self.get_object()
        if not instance:
            return Response(
                {"detail": "Reply not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if instance.replied_by != request.user and not request.user.is_superuser:
            raise PermissionDenied("You don't have permission to update this reply.")
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            updated_reply = update_reply(
                reply_id=instance.pk,
                user=request.user,
                update_data=serializer.validated_data,
            )
        except (ValueError, PermissionError) as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        output_serializer = ReplyOutputSerializer(updated_reply)
        return Response(output_serializer.data)
    
    def delete(self, request, feedback_id=None, reply_id=None):
        instance = self.get_object()
        if not instance:
            return Response(
                {"detail": "Reply not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if instance.replied_by != request.user and not request.user.is_superuser:
            raise PermissionDenied("You don't have permission to delete this reply.")
        
        try:
            delete_reply(
                reply_id=instance.pk,
                user=request.user,
            )
        except (ValueError, PermissionError) as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        return Response(
            {"detail": "Reply deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )


# ---------------------------------------------------------------------------
# Rating Summary
# ---------------------------------------------------------------------------

class RatingSummaryView(generics.ListAPIView):
    """
    GET /feedback/ratings/ - Get rating summaries
    Query params:
    - feedback_type (optional): platform, course, live_section
    - object_id (optional): Required if feedback_type is course/live_section
    - page, page_size: Pagination
    """
    
    permission_classes = [AllowAny]
    serializer_class = RatingSummaryOutputSerializer
    
    def list(self, request, *args, **kwargs):
        query_serializer = RatingSummaryQuerySerializer(data=request.query_params)
        query_serializer.is_valid(raise_exception=True)
        
        params = query_serializer.validated_data
        feedback_type = params.get('feedback_type')
        object_id = params.get('object_id')
        
        # If specific target requested, return single summary
        if feedback_type and (feedback_type == 'platform' or object_id):
            summary = get_rating_summary(
                feedback_type=feedback_type,
                object_id=object_id,
            )
            
            if not summary:
                # Return empty summary
                return Response({
                    "rating_summary": None,
                    "message": "No ratings yet for this target.",
                })
            
            serializer = RatingSummaryOutputSerializer(summary)
            return Response({"rating_summary": serializer.data})
        
        # Otherwise, return paginated list of all summaries
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        
        result = get_all_rating_summaries(
            feedback_type=feedback_type,
            page=page,
            page_size=page_size,
        )
        
        serializer = RatingSummaryOutputSerializer(result['summaries'], many=True)
        
        return Response({
            "rating_summaries": serializer.data,
            "pagination": {
                "total_count": result['total_count'],
                "page": result['page'],
                "page_size": result['page_size'],
                "total_pages": result['total_pages'],
            }
        })