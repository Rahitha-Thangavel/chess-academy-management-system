from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from apps.students.models import Student

class Batch(models.Model):
    class DayOfWeek(models.TextChoices):
        MON = 'MON', _('Monday')
        TUE = 'TUE', _('Tuesday')
        WED = 'WED', _('Wednesday')
        THU = 'THU', _('Thursday')
        FRI = 'FRI', _('Friday')
        SAT = 'SAT', _('Saturday')
        SUN = 'SUN', _('Sunday')

    batch_name = models.CharField(max_length=100)
    schedule_day = models.CharField(
        max_length=3,
        choices=DayOfWeek.choices,
        blank=True, 
        null=True
    )
    start_time = models.TimeField()
    end_time = models.TimeField()
    coach_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='batches_coached'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.batch_name

class BatchEnrollment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='enrollments')
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='enrollments')
    enrollment_date = models.DateField()
    
    class Meta:
        unique_together = ('student', 'batch')

    def __str__(self):
        return f"{self.student} -> {self.batch}"
