from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.students.models import Student

class Tournament(models.Model):
    id = models.CharField(primary_key=True, max_length=20, editable=False)
    tournament_name = models.CharField(max_length=100)
    tournament_date = models.DateField()
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
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='registrations')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='tournament_registrations')
    registration_date = models.DateField()
    
    class Meta:
        unique_together = ('tournament', 'student')

    def __str__(self):
        return f"{self.student} -> {self.tournament}"
