"""Attendance app serializers.

Django REST Framework serializers for the attendance app."""

from rest_framework import serializers
from .models import Attendance, CoachAttendance
from decimal import Decimal

class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    batch_name = serializers.CharField(source='batch.batch_name', read_only=True)

    class Meta:
        model = Attendance
        fields = [
            'id', 'student', 'student_name', 'batch', 'batch_name', 
            'attendance_date', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class CoachAttendanceSerializer(serializers.ModelSerializer):
    coach_name = serializers.CharField(source='coach.get_full_name', read_only=True)
    batch_name = serializers.CharField(source='batch.batch_name', read_only=True)
    worked_hours = serializers.SerializerMethodField()

    def get_worked_hours(self, obj):
        if not obj.clock_in_time or not obj.clock_out_time:
            return None
        duration = obj.clock_out_time - obj.clock_in_time
        hours = Decimal(str(duration.total_seconds() / 3600)).quantize(Decimal('0.01'))
        return str(hours)

    class Meta:
        model = CoachAttendance
        fields = [
            'id', 'coach', 'coach_name', 'batch', 'batch_name', 
            'date', 'clock_in_time', 'clock_out_time', 'worked_hours', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
