"""Backend module: backend/apps/payments/management/commands/seed_payment_samples.py.

Helpers, utilities, or logic for the chess academy management system."""

from datetime import date, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Sum

from apps.payments.models import Payment
from apps.students.models import Student
from apps.tournaments.models import TournamentRegistration
from apps.payments.views import PaymentViewSet
from apps.payments.models import Salary


class Command(BaseCommand):
    help = "Reset and create payment sample records for all active students using the current fee rules."

    def add_arguments(self, parser):
        parser.add_argument(
            '--keep-existing',
            action='store_true',
            help='Keep existing payment records instead of clearing them first.',
        )

    @staticmethod
    def _shift_month(reference_date, months_back):
        year = reference_date.year
        month = reference_date.month - months_back
        while month <= 0:
            year -= 1
            month += 12
        day = min(reference_date.day, 28)
        return date(year, month, day)

    def handle(self, *args, **options):
        today = date.today()
        payment_service = PaymentViewSet()
        active_students = list(Student.objects.filter(status=Student.Status.ACTIVE).select_related('parent_user').order_by('parent_user_id', 'enrollment_date', 'id'))

        with transaction.atomic():
            if not options['keep_existing']:
                deleted_count, _ = Payment.objects.all().delete()
                TournamentRegistration.objects.update(payment_status='PENDING', fee_paid=Decimal('0.00'))
                self.stdout.write(self.style.WARNING(f"Cleared existing payment records: {deleted_count}"))

            created_monthly = 0
            created_tournament = 0

            for month_offset in range(2):
                payment_month_date = self._shift_month(today, month_offset)
                for index, student in enumerate(active_students):
                    payment_date = payment_month_date - timedelta(days=index % 12)
                    computed_amount = payment_service._calculate_monthly_fee(
                        student=student,
                        month=payment_month_date.month,
                        year=payment_month_date.year,
                    )
                    Payment.objects.create(
                        student=student,
                        amount=computed_amount,
                        payment_date=payment_date,
                        payment_method='CASH' if (index + month_offset) % 3 == 0 else 'CARD',
                        payment_type='MONTHLY',
                    )
                    created_monthly += 1

            approved_registrations = TournamentRegistration.objects.filter(
                status='APPROVED',
            ).select_related('student', 'tournament').order_by('registration_date', 'id')

            for index, registration in enumerate(approved_registrations):
                # Mark a realistic subset as paid to keep tournament finances populated.
                if index % 2 == 1:
                    continue
                Payment.objects.create(
                    student=registration.student,
                    amount=registration.tournament.entry_fee,
                    payment_date=today - timedelta(days=index % 6),
                    payment_method='CARD',
                    payment_type='TOURNAMENT',
                )
                registration.payment_status = 'PAID'
                registration.fee_paid = registration.tournament.entry_fee
                registration.save(update_fields=['payment_status', 'fee_paid'])
                created_tournament += 1

        total_collected = Payment.objects.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        salary_total = Salary.objects.aggregate(total=Sum('net_amount'))['total'] or Decimal('0.00')
        net_profit = total_collected - salary_total

        self.stdout.write(self.style.SUCCESS(
            f"Sample payments ready. Monthly created: {created_monthly}, Tournament created: {created_tournament}, "
            f"Revenue: {total_collected:.2f}, Salary Cost: {salary_total:.2f}, Net Profit: {net_profit:.2f}"
        ))
