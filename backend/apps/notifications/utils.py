"""Backend module: backend/apps/notifications/utils.py.

Helpers, utilities, or logic for the chess academy management system."""

from .models import Notification


LEGACY_ROUTE_MAP = {
    '/parent/students': '/parent/children',
    '/admin/batches': '/admin/schedule',
    '/coach/batches': '/coach/batch-applications',
    '/admin/reschedule': '/admin/reschedule-requests',
}


def normalize_target_url(target_url):
    if not target_url:
        return target_url

    clean_url = target_url.rstrip('/')
    if not clean_url.startswith('/'):
        clean_url = f'/{clean_url}'

    return LEGACY_ROUTE_MAP.get(clean_url, clean_url)


def create_notification(user, notification_type, title, message, target_url=None):
    try:
        Notification.objects.create(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message,
            target_url=normalize_target_url(target_url)
        )
    except Exception as e:
        print(f"Failed to create notification for {user}: {e}")

def mark_stale_notifications(target_url):
    """Marks all notifications with the given target_url as read."""
    if not target_url:
        return
    clean_url = normalize_target_url(target_url).rstrip('/')
    try:
        from django.db.models import Q
        updated_count = Notification.objects.filter(
            Q(target_url=clean_url) | Q(target_url=clean_url + '/'),
            is_read=False
        ).update(is_read=True)
        # Log to a file for debugging
        with open('notification_debug.log', 'a') as f:
            f.write(f"Cleared {updated_count} notifications for URL: {target_url}\n")
    except Exception as e:
        with open('notification_debug.log', 'a') as f:
            f.write(f"Error clearing notifications for {target_url}: {e}\n")
