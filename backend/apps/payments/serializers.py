"""Payments app serializers.

Django REST Framework serializers for the payments app."""

from rest_framework import serializers
from .models import Payment, Salary, Expense
from apps.students.models import Student

class PaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    registration_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Payment
        fields = [
            'id', 'student', 'student_name', 'amount', 
            'payment_date', 'payment_method', 'payment_type', 'registration_id',
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


class ExpenseSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = Expense
        fields = [
            'id',
            'title',
            'category',
            'amount',
            'expense_date',
            'notes',
            'created_by',
            'created_by_name',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'created_by', 'created_by_name']
