"""Payments app models.

Defines Django ORM models used by the payments app."""

from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.utils import timezone
from apps.students.models import Student

class Payment(models.Model):
    class PaymentMethod(models.TextChoices):
        CASH = 'CASH', _('Cash')
        CARD = 'CARD', _('Card')
        
    class PaymentType(models.TextChoices):
        MONTHLY = 'MONTHLY', _('Monthly Fee')
        TOURNAMENT = 'TOURNAMENT', _('Tournament Fee')
    
    id = models.CharField(primary_key=True, max_length=20, editable=False)

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField()
    payment_method = models.CharField(
        max_length=10,
        choices=PaymentMethod.choices
    )
    payment_type = models.CharField(
        max_length=20,
        choices=PaymentType.choices
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.payment_type} - {self.student} - {self.amount}"

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = self.generate_payment_id()
        super().save(*args, **kwargs)

    def generate_payment_id(self):
        year = timezone.now().year
        prefix = f"PAY{year}"
        
        # Get last payment
        last_pay = Payment.objects.filter(id__startswith=prefix).order_by('id').last()
        
        if last_pay:
            try:
                # Extract sequence (after PAY2024 -> index 7)
                # PAY + 4 digits = 7 chars
                last_seq = int(last_pay.id[7:])
                new_seq = last_seq + 1
            except ValueError:
                new_seq = 1
        else:
            new_seq = 1
            
        return f"{prefix}{new_seq:03d}"

class Salary(models.Model):
    class SalaryStatus(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        PROCESSING = 'PROCESSING', _('Processing')
        PAID = 'PAID', _('Paid')

    salary_code = models.CharField(max_length=20, unique=True, editable=False, null=True, blank=True)
    coach_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='salaries'
    )
    payment_period = models.CharField(max_length=50) # e.g. "November 2024"
    batch = models.ForeignKey('batches.Batch', on_delete=models.SET_NULL, null=True, related_name='salaries')
    
    total_hours = models.DecimalField(max_digits=6, decimal_places=2)
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2)
    gross_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    deductions = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    net_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    payment_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=SalaryStatus.choices,
        default=SalaryStatus.PENDING
    )
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='processed_salaries'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.salary_code:
            # Simple unique code generator logic could go here
            import uuid
            self.salary_code = f"SAL-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.coach_user} - {self.payment_period}"


class Expense(models.Model):
    class ExpenseCategory(models.TextChoices):
        RENT = 'RENT', _('Rent')
        ELECTRICITY = 'ELECTRICITY', _('Electricity / Current Bill')
        CLEANING = 'CLEANING', _('Cleaning Salary')
        CLERK_SALARY = 'CLERK_SALARY', _('Clerk Salary')
        MAINTENANCE = 'MAINTENANCE', _('Maintenance')
        INTERNET = 'INTERNET', _('Internet')
        TOURNAMENT_PRIZES = 'TOURNAMENT_PRIZES', _('Tournament Gifts / Prizes')

    title = models.CharField(max_length=120)
    category = models.CharField(max_length=20, choices=ExpenseCategory.choices)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    expense_date = models.DateField()
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recorded_expenses',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-expense_date', '-created_at']

    def __str__(self):
        return f"{self.title} - {self.expense_date} - {self.amount}"
