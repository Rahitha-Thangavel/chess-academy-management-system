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

    class BatchType(models.TextChoices):
        RECURRING = 'RECURRING', _('Recurring')
        ONE_TIME = 'ONE_TIME', _('One-time')

    class BatchStatus(models.TextChoices):
        ACTIVE = 'ACTIVE', _('Active')
        INACTIVE = 'INACTIVE', _('Inactive')
        FINISHED = 'FINISHED', _('Finished')

    id = models.CharField(primary_key=True, max_length=20, editable=False)
    batch_name = models.CharField(max_length=100)
    batch_type = models.CharField(
        max_length=15,
        choices=BatchType.choices,
        default=BatchType.RECURRING
    )
    status = models.CharField(
        max_length=10,
        choices=BatchStatus.choices,
        default=BatchStatus.ACTIVE
    )
    schedule_day = models.CharField(
        max_length=3,
        choices=DayOfWeek.choices,
        blank=True, 
        null=True
    )
    exact_date = models.DateField(null=True, blank=True)
    start_time = models.TimeField()
    end_time = models.TimeField()
    coach_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, # Changed from CASCADE to SET_NULL to preserve batch if coach is deleted
        related_name='batches_coached',
        null=True, # Allow no coach initially
        blank=True
    )
    
    max_students = models.PositiveIntegerField(default=50)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.batch_name

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = self.generate_batch_id()
        super().save(*args, **kwargs)

    def generate_batch_id(self):
        prefix = "BATCH-"
        
        # Get last batch
        last_batch = Batch.objects.filter(id__startswith=prefix).order_by('id').last()
        
        if last_batch:
            try:
                # Extract sequence (after BATCH-)
                last_seq = int(last_batch.id[6:])
                new_seq = last_seq + 1
            except ValueError:
                new_seq = 1
        else:
            new_seq = 1
            
        return f"{prefix}{new_seq:03d}"

class CoachBatchApplication(models.Model):
    class ApplicationStatus(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        APPROVED = 'APPROVED', _('Approved')
        REJECTED = 'REJECTED', _('Rejected')

    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='coach_applications')
    coach = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='batch_applications'
    )
    application_date = models.DateTimeField(auto_now_add=True)
    application_message = models.TextField(blank=True)
    status = models.CharField(
        max_length=10,
        choices=ApplicationStatus.choices,
        default=ApplicationStatus.PENDING
    )
    admin_notes = models.TextField(blank=True)
    decision_date = models.DateField(null=True, blank=True)
    
    class Meta:
        unique_together = ('batch', 'coach')

    def __str__(self):
        return f"{self.coach} -> {self.batch} ({self.status})"

class BatchEnrollment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='enrollments')
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='enrollments')
    enrollment_date = models.DateField(auto_now_add=True)
    
    class Meta:
        unique_together = ('student', 'batch')

    def __str__(self):
        return f"{self.student} -> {self.batch}"

class CoachAvailability(models.Model):
    coach = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='availabilities'
    )
    day_of_week = models.CharField(
        max_length=3,
        choices=Batch.DayOfWeek.choices
    )
    start_time = models.TimeField()
    end_time = models.TimeField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.coach} ({self.day_of_week}: {self.start_time}-{self.end_time})"

class RescheduleRequest(models.Model):
    class RequestStatus(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        APPROVED = 'APPROVED', _('Approved')
        REJECTED = 'REJECTED', _('Rejected')

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='reschedule_requests')
    original_batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='reschedule_source', null=True, blank=True)
    original_date = models.DateField()
    
    # Target: could be a specific batch or just a requested date/time
    target_batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='reschedule_target', null=True, blank=True)
    preferred_date = models.DateField(null=True, blank=True)
    reason = models.TextField(blank=True)
    
    status = models.CharField(
        max_length=10,
        choices=RequestStatus.choices,
        default=RequestStatus.PENDING
    )
    
    admin_comment = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.student} Request: {self.original_date} -> {self.preferred_date or self.target_batch}"
