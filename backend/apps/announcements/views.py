"""Announcements app views."""

from rest_framework import viewsets, permissions
from .models import Announcement
from .serializers import AnnouncementSerializer


class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Announcement.objects.all()
        return Announcement.objects.filter(is_active=True)

    def perform_create(self, serializer):
        if self.request.user.role != 'ADMIN':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only Admin can create announcements.')
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        if self.request.user.role != 'ADMIN':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only Admin can update announcements.')
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.role != 'ADMIN':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only Admin can delete announcements.')
        instance.delete()
