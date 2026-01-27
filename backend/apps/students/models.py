from django.db import models
from django.conf import settings
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

class Student(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', _('Active')
        INACTIVE = 'INACTIVE', _('Inactive')

    id = models.CharField(primary_key=True, max_length=20, editable=False)
    # student_code removed as it is now the PK
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    grade_level = models.CharField(max_length=50, blank=True, null=True)
    enrollment_date = models.DateField()
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.ACTIVE
    )
    parent_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='students'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.id})"

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = self.generate_student_id()
        super().save(*args, **kwargs)

    def generate_student_id(self):
        year = timezone.now().year
        prefix = f"STU{year}"
        
        # Get last student with this prefix
        last_student = Student.objects.filter(id__startswith=prefix).order_by('id').last()
        
        if last_student:
            try:
                # Extract sequence (after prefix)
                # Prefix length is 3 + 4 = 7 chars (STU2024)
                last_seq = int(last_student.id[7:])
                new_seq = last_seq + 1
            except ValueError:
                new_seq = 1
        else:
            new_seq = 1
            
        return f"{prefix}{new_seq:03d}"
