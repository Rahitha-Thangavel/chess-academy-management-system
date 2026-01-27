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
    coach_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='salaries'
    )
    payment_period = models.CharField(max_length=50) # e.g. "November 2024"
    total_hours = models.DecimalField(max_digits=6, decimal_places=2)
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2)
    
    # Derived field logic could go here or in a property, but usually good to store the finalized amount too if needed.
    # User schema didn't ask for amount, just these fields. I'll stick to schema.
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.coach_user} - {self.payment_period}"
