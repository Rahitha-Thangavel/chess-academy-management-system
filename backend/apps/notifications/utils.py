from .models import Notification

def create_notification(user, notification_type, title, message):
    try:
        Notification.objects.create(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message
        )
    except Exception as e:
        print(f"Failed to create notification for {user}: {e}")
