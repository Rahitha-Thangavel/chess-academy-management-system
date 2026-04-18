from django.db import models
from django.conf import settings
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from apps.students.models import Student
from datetime import time

class Tournament(models.Model):
    id = models.CharField(primary_key=True, max_length=20, editable=False)
    tournament_name = models.CharField(max_length=100)
    tournament_date = models.DateField()
    start_time = models.TimeField(default=time(9, 0))
    end_time = models.TimeField(default=time(17, 0))
    venue = models.CharField(max_length=255, blank=True, null=True)
    entry_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    created_by_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_tournaments'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.tournament_name

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = self.generate_tournament_id()
        super().save(*args, **kwargs)

    def generate_tournament_id(self):
        year = timezone.now().year
        prefix = f"TOUR{year}"
        
        # Get last tournament
        last_tour = Tournament.objects.filter(id__startswith=prefix).order_by('id').last()
        
        if last_tour:
            try:
                # Extract sequence (after TOUR2024 -> index 8)
                # TOUR + 4 digits = 8 chars
                last_seq = int(last_tour.id[8:])
                new_seq = last_seq + 1
            except ValueError:
                new_seq = 1
        else:
            new_seq = 1
            
        return f"{prefix}{new_seq:03d}"

class TournamentRegistration(models.Model):
    class PaymentStatus(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        PAID = 'PAID', _('Paid')

    class AttendanceStatus(models.TextChoices):
        PRESENT = 'PRESENT', _('Present')
        ABSENT = 'ABSENT', _('Absent')

    class RegistrationStatus(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        APPROVED = 'APPROVED', _('Approved')
        REJECTED = 'REJECTED', _('Rejected')

    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='registrations')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='tournament_registrations')
    status = models.CharField(
        max_length=10,
        choices=RegistrationStatus.choices,
        default=RegistrationStatus.PENDING
    )
    registration_date = models.DateField(auto_now_add=True)
    
    # New fields for requirements
    payment_status = models.CharField(
        max_length=10, 
        choices=PaymentStatus.choices, 
        default=PaymentStatus.PENDING
    )
    fee_paid = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    attendance_status = models.CharField(
        max_length=10,
        choices=AttendanceStatus.choices,
        null=True, blank=True
    )
    registered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='registered_tournaments'
    )
    
    # Results
    score = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    rank = models.PositiveIntegerField(null=True, blank=True)
    
    class Meta:
        unique_together = ('tournament', 'student')

    def __str__(self):
        return f"{self.student} -> {self.tournament}"

class TournamentMatch(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='matches')
    player1 = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='matches_as_p1')
    player2 = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='matches_as_p2')
    round_number = models.PositiveIntegerField()
    match_date = models.DateTimeField(null=True, blank=True)
    
    # Outcome
    winner = models.ForeignKey(Student, on_delete=models.SET_NULL, null=True, blank=True, related_name='matches_won')
    result_details = models.TextField(blank=True, help_text="Score or details of the match")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.tournament} - R{self.round_number}: {self.player1} vs {self.player2}"
