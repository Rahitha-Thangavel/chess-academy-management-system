from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from apps.students.models import Student

class Payment(models.Model):
    class PaymentMethod(models.TextChoices):
        CASH = 'CASH', _('Cash')
        CARD = 'CARD', _('Card')
        
    class PaymentType(models.TextChoices):
        MONTHLY = 'MONTHLY', _('Monthly Fee')
        TOURNAMENT = 'TOURNAMENT', _('Tournament Fee')

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
