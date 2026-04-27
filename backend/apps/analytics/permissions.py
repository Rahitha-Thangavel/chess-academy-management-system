"""Backend module: backend/apps/analytics/permissions.py.

Helpers, utilities, or logic for the chess academy management system."""

from rest_framework import permissions

class IsAnalyticsUser(permissions.BasePermission):
    """
    Allows analytics access to Admin, Coach, and Parent.
    Clerks are intentionally blocked from reports/analytics.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ['ADMIN', 'COACH', 'PARENT']
