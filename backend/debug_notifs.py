import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.notifications.models import Notification

unread_notifs = Notification.objects.filter(is_read=False).order_by('-created_at')[:50]
with open('notifs_output.txt', 'w') as f:
    f.write(f"Showing 50 most recent unread notifications:\n")
    for n in unread_notifs:
        f.write(f"ID: {n.id} | Title: {n.title} | URL: {n.target_url} | UserID: {n.user_id} | Created: {n.created_at}\n")
print("Done writing to notifs_output.txt")
