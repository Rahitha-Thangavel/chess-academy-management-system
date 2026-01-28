from rest_framework import serializers
from .models import Batch, BatchEnrollment, CoachAvailability, RescheduleRequest

class BatchSerializer(serializers.ModelSerializer):
    coach_name = serializers.CharField(source='coach_user.get_full_name', read_only=True)

    class Meta:
        model = Batch
        fields = [
            'id', 'batch_name', 'schedule_day', 'start_time', 
            'end_time', 'coach_user', 'coach_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class BatchEnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    batch_name = serializers.CharField(source='batch.batch_name', read_only=True)

    class Meta:
        model = BatchEnrollment
        fields = ['id', 'student', 'student_name', 'batch', 'batch_name', 'enrollment_date']
        read_only_fields = ['id']

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
