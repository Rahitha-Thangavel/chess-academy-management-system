"""Backend module: backend/apps/notifications/management/commands/check_notifications.py.

Helpers, utilities, or logic for the chess academy management system."""

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db.models import Count, Q
from apps.students.models import Student
from apps.payments.models import Payment
from apps.attendance.models import Attendance
from apps.notifications.utils import create_notification
from datetime import datetime
from dateutil.relativedelta import relativedelta

class Command(BaseCommand):
    help = 'Check for automated notifications (Fee alerts and Absence alerts)'

    def handle(self, *args, **options):
        self.stdout.write("Running automated alert checks...")
        self.check_fee_alerts()
        self.check_absence_alerts()
        self.stdout.write(self.style.SUCCESS("Automated checks complete."))

    def check_fee_alerts(self):
        """[R7] Alert parents if fees unpaid for 3 consecutive months."""
        now = timezone.now()
        # Months to check
        m1 = now.replace(day=1)
        m2 = m1 - relativedelta(months=1)
        m3 = m1 - relativedelta(months=2)
        
        check_months = [m1, m2, m3]
        
        active_students = Student.objects.filter(status='ACTIVE')
        
        for student in active_students:
            unpaid_count = 0
            for m in check_months:
                has_paid = Payment.objects.filter(
                    student=student,
                    payment_type='MONTHLY',
                    payment_date__month=m.month,
                    payment_date__year=m.year
                ).exists()
                if not has_paid:
                    unpaid_count += 1
            
            if unpaid_count >= 3:
                # Check if we already notified in the last 7 days to avoid spam
                from apps.notifications.models import Notification
                recent_alert = Notification.objects.filter(
                    user=student.parent_user,
                    notification_type='FEE_ALERT',
                    created_at__gte=now - relativedelta(days=7),
                    message__icontains=student.first_name
                ).exists()
                
                if not recent_alert:
                    create_notification(
                        user=student.parent_user,
                        notification_type='FEE_ALERT',
                        title='Overdue Fee Alert',
                        message=f'The monthly fees for {student.first_name} {student.last_name} remain unpaid for 3 consecutive months. Please pay as soon as possible.',
                        target_url='/parent/payments'
                    )
                    self.stdout.write(f"Created Fee Alert for {student.first_name} ({student.id})")

    def check_absence_alerts(self):
        """[R8] Alert parents if child absent for 3 consecutive times."""
        active_students = Student.objects.filter(status='ACTIVE')
        now = timezone.now()

        for student in active_students:
            # Get last 3 attendance records
            last_3 = Attendance.objects.filter(student=student).order_by('-attendance_date')[:3]
            
            if len(last_3) == 3 and all(a.status == 'ABSENT' for a in last_3):
                # Check for recent alert
                from apps.notifications.models import Notification
                recent_alert = Notification.objects.filter(
                    user=student.parent_user,
                    notification_type='ABSENCE_ALERT',
                    created_at__gte=now - relativedelta(days=7),
                    message__icontains=student.first_name
                ).exists()
                
                if not recent_alert:
                    create_notification(
                        user=student.parent_user,
                        notification_type='ABSENCE_ALERT',
                        title='Consecutive Absence Alert',
                        message=f'Student {student.first_name} {student.last_name} has been absent for 3 consecutive classes. Please inform the academy of the reason.',
                        target_url='/parent/attendance'
                    )
                    self.stdout.write(f"Created Absence Alert for {student.first_name} ({student.id})")
