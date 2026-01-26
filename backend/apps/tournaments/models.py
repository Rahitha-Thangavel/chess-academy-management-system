from django.db import models
from django.conf import settings
from apps.students.models import Student

class Tournament(models.Model):
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

class TournamentRegistration(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='registrations')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='tournament_registrations')
    registration_date = models.DateField()
    
    class Meta:
        unique_together = ('tournament', 'student')

    def __str__(self):
        return f"{self.student} -> {self.tournament}"
