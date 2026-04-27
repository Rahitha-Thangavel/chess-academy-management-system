"""Notifications app models.

Defines Django ORM models used by the notifications app."""

from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class Notification(models.Model):
    class NotificationType(models.TextChoices):
        SYSTEM = 'SYSTEM', _('System')
        ATTENDANCE = 'ATTENDANCE', _('Attendance')
        PAYMENT = 'PAYMENT', _('Payment')
        TOURNAMENT = 'TOURNAMENT', _('Tournament')
        BATCH = 'BATCH', _('Batch')
        ABSENCE_ALERT = 'ABSENCE_ALERT', _('Absence Alert')
        FEE_ALERT = 'FEE_ALERT', _('Fee Alert')
        COACH_ALERT = 'COACH_ALERT', _('Coach Alert')
        ADMIN_ALERT = 'ADMIN_ALERT', _('Admin Alert')

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    notification_type = models.CharField(
        max_length=20,
        choices=NotificationType.choices
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    target_url = models.CharField(max_length=255, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['notification_type']),
        ]

    def __str__(self):
        return f"{self.user} - {self.title}"
