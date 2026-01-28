from rest_framework import permissions

class IsAdminOrCoach(permissions.BasePermission):
    """
    Allows access only to Admin and Coach (for their own data).
    Explicitly restricts Clerks.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == 'CLERK':
            return False
        return True
