"""Students app serializers.

Django REST Framework serializers for the students app."""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Student

User = get_user_model()

class StudentSerializer(serializers.ModelSerializer):
    nic = serializers.CharField(required=True, allow_blank=False)
    parent_username = serializers.CharField(write_only=True, required=False)
    parent_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    batch_names = serializers.SerializerMethodField()
    enrollments = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            'id', 
            'nic',
            'first_name', 
            'last_name', 
            'date_of_birth', 
            'grade_level', 
            'school', 
            'enrollment_date', 
            'status', 
            'parent_user',
            'parent_username',
            'parent_name',
            'created_by',
            'created_by_name',
            'enrollments',
            'batch_names'
        ]
        read_only_fields = ['id', 'enrollment_date', 'status', 'parent_user', 'created_by']

    def validate_nic(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("NIC is required.")
        if not value.isdigit() or len(value) != 12:
            raise serializers.ValidationError("NIC must contain exactly 12 digits.")
        existing = Student.objects.filter(nic=value)
        if self.instance:
            existing = existing.exclude(pk=self.instance.pk)
        if existing.exists():
            raise serializers.ValidationError("A student with this NIC already exists.")
        return value

    def get_batch_names(self, obj):
        return [enrollment.batch.batch_name for enrollment in obj.enrollments.all()]

    def get_enrollments(self, obj):
        from apps.batches.serializers import BatchEnrollmentSerializer
        return BatchEnrollmentSerializer(obj.enrollments.all(), many=True).data

    def get_parent_name(self, obj):
        return f"{obj.parent_user.first_name} {obj.parent_user.last_name}"

    def get_created_by_name(self, obj):
        if obj.created_by:
            return f"{obj.created_by.first_name} {obj.created_by.last_name} ({obj.created_by.role})"
        return "System"

    def create(self, validated_data):
        request = self.context.get('request')
        parent_username = validated_data.pop('parent_username', None)
        
        # Set creator
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
            
            # If creator is Parent, they are the parent_user
            if request.user.role == 'PARENT':
                validated_data['parent_user'] = request.user
            
            # If creator is Admin/Clerk, they MUST provide parent_username
            elif request.user.role in ['ADMIN', 'CLERK']:
                if not parent_username:
                     raise serializers.ValidationError({"parent_username": "Parent username is required for registration."})
                try:
                    parent = User.objects.get(username=parent_username, role='PARENT')
                    validated_data['parent_user'] = parent
                except User.DoesNotExist:
                    raise serializers.ValidationError({"parent_username": "Parent with this username does not exist."})

                nic = validated_data.get('nic')
                if not nic:
                    raise serializers.ValidationError({"nic": "NIC is required for student registration."})
                
                # Admin creations are auto-approved
                if request.user.role == 'ADMIN':
                    validated_data['status'] = Student.Status.ACTIVE
            
        return super().create(validated_data)
