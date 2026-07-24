from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """Only admin-role users may access this view at all."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and getattr(request.user, 'role', None) == 'admin'

class IsAdminOrReadOnly(permissions.BasePermission):
    """Anyone can view (GET); only admin-role users can create/edit/delete."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and getattr(request.user, 'role', None) == 'admin'


class IsOwnerOrAdminOrReadOnly(permissions.BasePermission):
    """Anyone authenticated can create; only the owner or an admin can update/delete their own entry."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user_id == request.user.id or getattr(request.user, 'role', None) == 'admin'


class CanReportReadCreateAdminDelete(permissions.BasePermission):
    """Anyone authenticated can read/create a traffic report; only admin can delete/review it."""

    def has_permission(self, request, view):
        if request.method == 'DELETE':
            return request.user.is_authenticated and getattr(request.user, 'role', None) == 'admin'
        return request.user.is_authenticated