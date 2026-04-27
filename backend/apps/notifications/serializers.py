"""Notifications app serializers.

Django REST Framework serializers for the notifications app."""

from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'notification_type', 'title', 'message', 'target_url', 'is_read', 'created_at']
        read_only_fields = ['id', 'created_at', 'user']
