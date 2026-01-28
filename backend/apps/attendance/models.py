from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from apps.students.models import Student
from apps.batches.models import Batch

class Attendance(models.Model):
    class Status(models.TextChoices):
        PRESENT = 'PRESENT', _('Present')
        ABSENT = 'ABSENT', _('Absent')

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendance_records')
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='attendance_records')
    attendance_date = models.DateField()
    status = models.CharField(
        max_length=10,
        choices=Status.choices
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'batch', 'attendance_date')

    def __str__(self):
        return f"{self.student} - {self.batch} - {self.attendance_date} ({self.status})"

class CoachAttendance(models.Model):
    coach = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='coach_attendance_records'
    )
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='coach_attendance')
    date = models.DateField()
    clock_in_time = models.DateTimeField(null=True, blank=True)
    clock_out_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=10,
        choices=Attendance.Status.choices,
        default=Attendance.Status.PRESENT
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('coach', 'batch', 'date')

    def __str__(self):
        return f"{self.coach} - {self.batch} - {self.date}"
