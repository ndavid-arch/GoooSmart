from rest_framework import permissions


class IsAssignedDriver(permissions.BasePermission):
    """Only the driver assigned to this specific bus can push its GPS location."""

    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated and obj.driver_id == request.user.id