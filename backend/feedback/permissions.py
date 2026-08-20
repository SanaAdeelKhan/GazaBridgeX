"""
Permissions
===========
Custom DRF permission classes for the feedback app.
"""

from rest_framework.permissions import BasePermission


class IsOwnerOrReadOnly(BasePermission):
    """
    Permission for feedback CRUD:
    - GET: Allow any (public read access)
    - POST: Require authentication
    - PUT/PATCH/DELETE: Only the owner
    """
    
    def has_permission(self, request, view):
        # Allow GET requests for everyone
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        # Require authentication for POST, PUT, PATCH, DELETE
        return bool(request.user and request.user.is_authenticated)
    
    def has_object_permission(self, request, view, obj):
        # Allow GET requests for everyone
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        # Only the owner can update/delete
        return obj.user == request.user


class CanCreateReply(BasePermission):
    """
    Permission for creating replies:
    - Platform feedback: Only superuser
    - Course/LiveSection feedback: Only owner of the course/live_section
    """
    
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)
    
    def has_object_permission(self, request, view, obj):
        # obj is the Feedback instance
        if obj.feedback_type == "platform":
            return request.user.is_superuser
        
        # For course/live_section, check if user is the owner
        owner = obj.get_owner()
        return owner and owner.pk == request.user.pk


class CanModifyReply(BasePermission):
    """
    Permission for updating/deleting replies:
    - Creator of the reply
    - Superuser (moderator)
    """
    
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)
    
    def has_object_permission(self, request, view, obj):
        # obj is the FeedbackReply instance
        return obj.replied_by == request.user or request.user.is_superuser