from rest_framework import serializers
from .models import Payment, Salary
from apps.students.models import Student

class PaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'student', 'student_name', 'amount', 
            'payment_date', 'payment_method', 'payment_type', 
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class SalarySerializer(serializers.ModelSerializer):
    coach_name = serializers.CharField(source='coach_user.get_full_name', read_only=True)

    class Meta:
        model = Salary
        fields = [
            'id',
            'salary_code',
            'coach_user',
            'coach_name',
            'payment_period',
            'batch',
            'total_hours',
            'hourly_rate',
            'gross_amount',
            'deductions',
            'net_amount',
            'payment_date',
            'status',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'salary_code', 'coach_name', 'coach_user', 'gross_amount', 'deductions']
