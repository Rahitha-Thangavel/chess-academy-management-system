from rest_framework import serializers
from .models import Attendance, CoachAttendance

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

    class Meta:
        model = CoachAttendance
        fields = [
            'id', 'coach', 'coach_name', 'batch', 'batch_name', 
            'date', 'clock_in_time', 'clock_out_time', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
