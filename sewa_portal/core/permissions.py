from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        return bool(user and getattr(user, 'role', None) == 'admin')

class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user = getattr(request, 'user', None)
        if not user:
            return False
        if getattr(user, 'role', None) == 'admin':
            return True
        # Fall back to comparing ownership safely
        try:
            return obj.user == user
        except Exception:
            return False
