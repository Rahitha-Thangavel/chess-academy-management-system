from django.db import models
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
