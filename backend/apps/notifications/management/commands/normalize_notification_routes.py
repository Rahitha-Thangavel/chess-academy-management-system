from django.core.management.base import BaseCommand

from apps.notifications.models import Notification
from apps.notifications.utils import normalize_target_url


class Command(BaseCommand):
    help = 'Normalize legacy notification target URLs to current frontend routes.'

    def handle(self, *args, **options):
        updated = 0

        for notification in Notification.objects.exclude(target_url__isnull=True).exclude(target_url=''):
            normalized = normalize_target_url(notification.target_url)
            if normalized != notification.target_url:
                notification.target_url = normalized
                notification.save(update_fields=['target_url'])
                updated += 1

        self.stdout.write(self.style.SUCCESS(f'Normalized {updated} notifications.'))

