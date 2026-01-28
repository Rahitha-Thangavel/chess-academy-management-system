from rest_framework import serializers
from .models import Batch, BatchEnrollment, CoachAvailability, RescheduleRequest, CoachBatchApplication

class BatchSerializer(serializers.ModelSerializer):
    coach_name = serializers.CharField(source='coach_user.get_full_name', read_only=True)
    current_students = serializers.IntegerField(source='enrollments.count', read_only=True)

    class Meta:
        model = Batch
        fields = [
            'id', 'batch_name', 'schedule_day', 'start_time', 
            'end_time', 'coach_user', 'coach_name', 'max_students', 'current_students', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class CoachBatchApplicationSerializer(serializers.ModelSerializer):
    coach_name = serializers.CharField(source='coach.get_full_name', read_only=True)
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
        return f"{obj.batch.get_schedule_day_display()} {obj.batch.start_time} - {obj.batch.end_time}"


class BatchEnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    batch_name = serializers.CharField(source='batch.batch_name', read_only=True)

    class Meta:
        model = BatchEnrollment
        fields = ['id', 'student', 'student_name', 'batch', 'batch_name', 'enrollment_date']
        read_only_fields = ['id', 'enrollment_date']

class CoachAvailabilitySerializer(serializers.ModelSerializer):
    coach_name = serializers.CharField(source='coach.get_full_name', read_only=True)

    class Meta:
        model = CoachAvailability
        fields = ['id', 'coach', 'coach_name', 'day_of_week', 'start_time', 'end_time']
        read_only_fields = ['id']

class RescheduleRequestSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    parent_name = serializers.CharField(source='student.parent_user.get_full_name', read_only=True)
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
