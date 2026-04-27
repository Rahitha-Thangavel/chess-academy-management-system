"""Backend module: backend/apps/payments/management/commands/seed_salary_samples.py.

Helpers, utilities, or logic for the chess academy management system."""

from datetime import date, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.payments.models import Salary
from apps.users.models import User, UserProfile
from apps.attendance.models import CoachAttendance


class Command(BaseCommand):
    help = "Reset and create sample salary records for all coaches based on recorded worked hours."

    def handle(self, *args, **options):
        coaches = list(
            User.objects.filter(role=User.Role.COACH)
            .select_related('profile')
            .order_by('id')
        )

        hourly_rate_samples = [
            Decimal('1500.00'),
            Decimal('1600.00'),
            Decimal('1750.00'),
            Decimal('1900.00'),
            Decimal('2000.00'),
        ]
        statuses = ['PAID', 'PENDING', 'PROCESSING']

        with transaction.atomic():
            Salary.objects.all().delete()

            for index, coach in enumerate(coaches):
                profile, _ = UserProfile.objects.get_or_create(
                    user=coach,
                    defaults={'profile_type': UserProfile.ProfileType.COACH},
                )
                profile.profile_type = UserProfile.ProfileType.COACH
                profile.hourly_rate = hourly_rate_samples[index % len(hourly_rate_samples)]
                profile.save(update_fields=['profile_type', 'hourly_rate'])

                attendance_records = CoachAttendance.objects.filter(
                    coach=coach,
                    clock_in_time__isnull=False,
                    clock_out_time__isnull=False,
                    date__year=date.today().year,
                    date__month=date.today().month,
                )

                total_hours = Decimal('0.00')
                for record in attendance_records:
                    duration = record.clock_out_time - record.clock_in_time
                    total_hours += Decimal(str(duration.total_seconds() / 3600))

                if total_hours <= Decimal('0.00'):
                    total_hours = Decimal('1.00')

                total_hours = total_hours.quantize(Decimal('0.01'))
                gross_amount = (total_hours * profile.hourly_rate).quantize(Decimal('0.01'))
                payment_period = date.today().strftime('%B %Y')
                status = statuses[index % len(statuses)]

                Salary.objects.create(
                    coach_user=coach,
                    payment_period=payment_period,
                    total_hours=total_hours,
                    hourly_rate=profile.hourly_rate,
                    gross_amount=gross_amount,
                    deductions=Decimal('0.00'),
                    net_amount=gross_amount,
                    status=status,
                    payment_date=date.today() - timedelta(days=index) if status == 'PAID' else None,
                )

        self.stdout.write(self.style.SUCCESS(
            f"Sample salaries ready for {len(coaches)} coaches. Rates are in 100s and salary amounts stay below 2500."
        ))
