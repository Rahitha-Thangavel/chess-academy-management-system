"""Backend module: backend/apps/notifications/apps.py.

Helpers, utilities, or logic for the chess academy management system."""

from django.apps import AppConfig

class NotificationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.notifications'
