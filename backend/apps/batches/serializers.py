from rest_framework import serializers
from .models import Batch, BatchEnrollment, CoachAvailability, RescheduleRequest, CoachBatchApplication

class BatchSerializer(serializers.ModelSerializer):
    coach_name = serializers.SerializerMethodField()
    current_students = serializers.IntegerField(source='enrollments.count', read_only=True)
    next_class_date = serializers.SerializerMethodField()

    class Meta:
        model = Batch
        fields = [
            'id', 'batch_name', 'batch_type', 'status', 'schedule_day', 'exact_date',
            'start_time', 'end_time', 'coach_user', 'coach_name', 'max_students', 'current_students', 
            'next_class_date', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_coach_name(self, obj):
        return obj.coach_user.get_full_name() if obj.coach_user else "No Coach"

    def get_next_class_date(self, obj):
        from datetime import datetime, date, timedelta
        import pytz
        from django.utils import timezone
        
        if obj.batch_type == 'ONE_TIME':
            return obj.exact_date

        if not obj.schedule_day:
            return None

        # Day mapping
        days_map = {
            'MON': 0, 'TUE': 1, 'WED': 2, 'THU': 3, 'FRI': 4, 'SAT': 5, 'SUN': 6
        }
        target_weekday = days_map.get(obj.schedule_day)
        if target_weekday is None:
            return None

        now = timezone.now()
        # Ensure we are working with correct time zone if needed, 
        # but the request is simple: what is the NEXT date.
        
        current_date = now.date()
        current_weekday = current_date.weekday()
        
        days_ahead = target_weekday - current_weekday
        if days_ahead < 0: # Target day already passed this week
            days_ahead += 7
        elif days_ahead == 0: # Today is the day
            # Check if class time has passed
            if now.time() > obj.start_time:
                days_ahead = 7
        
        return current_date + timedelta(days=days_ahead)

    def validate(self, data):
        """Validate that total capacity of overlapping batches doesn't exceed 100."""
        from django.conf import settings
        from django.db.models import Sum, Q

        schedule_day = data.get('schedule_day')
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        max_students = data.get('max_students', 50)
        coach_user = data.get('coach_user')
        
        # If we are updating, use current values if not provided
        if self.instance:
            schedule_day = schedule_day or self.instance.schedule_day
            start_time = start_time or self.instance.start_time
            end_time = end_time or self.instance.end_time
            if 'max_students' not in data:
                max_students = self.instance.max_students
            if coach_user is None:
                coach_user = self.instance.coach_user_id

        if not schedule_day or not start_time or not end_time:
            return data

        # [R10] If a coach is assigned, ensure their availability covers this batch window.
        coach_user_id = getattr(coach_user, 'id', coach_user)
        if coach_user_id:
            has_availability = CoachAvailability.objects.filter(
                coach_id=coach_user_id,
                day_of_week=schedule_day,
                start_time__lte=start_time,
                end_time__gte=end_time,
            ).exists()
            if not has_availability:
                raise serializers.ValidationError(
                    'Assigned coach is not available for the given day/time window.'
                )

        # Get all batches on the same day
        batches = Batch.objects.filter(schedule_day=schedule_day)
        if self.instance:
            batches = batches.exclude(id=self.instance.id)

        # We need to find the point in time with the maximum overlapping capacity
        # Simplest way: check all start/end times of overlapping batches
        time_points = set([start_time, end_time])
        overlapping_batches = batches.filter(
            Q(start_time__lt=end_time, end_time__gt=start_time)
        )

        for b in overlapping_batches:
            time_points.add(b.start_time)
            time_points.add(b.end_time)

        total_capacity_limit = getattr(settings, 'ACADEMY_TOTAL_CAPACITY', 100)

        for tp in sorted(list(time_points)):
            # Special case: don't check EXACTLY at end_time
            # A class ending at 18:00 doesn't overlap with one starting at 18:00
            # for the purpose of "at the same time" if we check the moment just after 18:00.
            # However, for capacity, if both are in the room, it's a problem.
            # Let's check a small interval (tp)
            
            # This is a bit complex for a one-liner. 
            # Logic: For any given time point 't', the capacity is sum of max_students where start_time <= t < end_time
            
            # Actually, standard overlap is: start1 < end2 and start2 < end1.
            # Let's just sum all overlapping ones.
            # Wait, if multiple batches overlap but NOT with each other, simple sum is wrong.
            # Example: A (10-12), B (11-13), C (12-14).
            # B overlaps with A and C. A and C don't overlap.
            # At 11:30, capacity = A + B.
            # At 12:30, capacity = B + C.
            
            current_capacity = max_students
            for ob in overlapping_batches:
                if ob.start_time <= tp < ob.end_time:
                    current_capacity += ob.max_students
            
            if current_capacity > total_capacity_limit:
                raise serializers.ValidationError(
                    f"Total capacity limit of {total_capacity_limit} students exceeded. "
                    f"At {tp}, existing batches plus this one would allow {current_capacity} students."
                )

        return data

class CoachBatchApplicationSerializer(serializers.ModelSerializer):
    coach_name = serializers.SerializerMethodField()
    batch_name = serializers.CharField(source='batch.batch_name', read_only=True)
    batch_schedule = serializers.SerializerMethodField()
    
    class Meta:
        model = CoachBatchApplication
        fields = [
            'id', 'batch', 'batch_name', 'batch_schedule', 'coach', 'coach_name',
            'application_message', 'status', 'admin_notes', 'application_date', 'decision_date'
        ]
        read_only_fields = ['id', 'status', 'admin_notes', 'decision_date', 'application_date', 'coach']
        
    def get_batch_schedule(self, obj):
        if not obj.batch: return "N/A"
        return f"{obj.batch.get_schedule_day_display()} {obj.batch.start_time} - {obj.batch.end_time}"

    def get_coach_name(self, obj):
        return obj.coach.get_full_name() if obj.coach else "Unknown Coach"


class BatchEnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    batch_name = serializers.CharField(source='batch.batch_name', read_only=True)

    class Meta:
        model = BatchEnrollment
        fields = ['id', 'student', 'student_name', 'batch', 'batch_name', 'enrollment_date']
        read_only_fields = ['id', 'enrollment_date']

    def get_student_name(self, obj):
        return obj.student.get_full_name() if obj.student else "Unknown Student"

class CoachAvailabilitySerializer(serializers.ModelSerializer):
    coach_name = serializers.SerializerMethodField()

    class Meta:
        model = CoachAvailability
        fields = ['id', 'coach', 'coach_name', 'day_of_week', 'start_time', 'end_time']
        read_only_fields = ['id']

    def get_coach_name(self, obj):
        return obj.coach.get_full_name() if obj.coach else "Unknown Coach"

class RescheduleRequestSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    parent_name = serializers.SerializerMethodField()
    original_batch_name = serializers.CharField(source='original_batch.batch_name', read_only=True, allow_null=True)
    target_batch_name = serializers.CharField(source='target_batch.batch_name', read_only=True, allow_null=True)

    class Meta:
        model = RescheduleRequest
        fields = [
            'id', 'student', 'student_name', 'parent_name', 'original_batch', 'original_batch_name',
            'original_date', 'target_batch', 'target_batch_name', 'preferred_date',
            'reason', 'status', 'admin_comment', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'admin_comment', 'created_at', 'updated_at']
        extra_kwargs = {
            'original_batch': {'required': False, 'allow_null': True},
            'target_batch': {'required': False, 'allow_null': True},
            'preferred_date': {'required': False, 'allow_null': True},
        }

    def get_student_name(self, obj):
        return obj.student.get_full_name() if obj.student else "Unknown Student"

    def get_parent_name(self, obj):
        if obj.student and obj.student.parent_user:
            return obj.student.parent_user.get_full_name()
        return "Unknown Parent"
