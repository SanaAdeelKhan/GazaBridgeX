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