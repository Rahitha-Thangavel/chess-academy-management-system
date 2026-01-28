from rest_framework import permissions

class IsStaffOrCoach(permissions.BasePermission):
    """
    Allows access to Admin, Clerk, and Coach (for their own data).
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        # Admin and Clerk have full access to reports
        if request.user.role in ['ADMIN', 'CLERK']:
            return True
        # Coaches can also access (logic for 'own data' should be in ViewSet if specific filtering needed)
        if request.user.role == 'COACH':
            return True
        return False
