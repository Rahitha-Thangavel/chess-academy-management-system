from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User

class BaseRegisterSerializer(serializers.ModelSerializer):
    """Base serializer for user registration."""
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        min_length=8
    )
    confirm_password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = [
            'email', 'password', 'confirm_password', 'role',
            'first_name', 'last_name', 'phone'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True, 'max_length': 75},
            'last_name': {'required': True, 'max_length': 75},
            'phone': {'required': False, 'allow_blank': True}
        }
    
    def validate(self, data):
        """Validate base registration data."""
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        
        # Use Django's password validation
        try:
            # Create a temporary user object for validation
            user = User(
                email=data.get('email', ''),
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', '')
            )
            validate_password(data['password'], user=user)
        except ValidationError as e:
            raise serializers.ValidationError({
                "password": list(e.messages)
            })
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({
                "email": "A user with this email already exists."
            })
        return data
    
    def create(self, validated_data):
        """Base create method - to be overridden by child classes."""
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')

        # Ensure user is created using the manager so password is hashed
        return User.objects.create_user(
            email=validated_data['email'],
            password=password,
            role=validated_data.get('role', User.Role.PARENT),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=validated_data.get('phone', ''),
            is_active=True,
            is_email_verified=True
        )

class ParentRegisterSerializer(BaseRegisterSerializer):
    """Serializer for parent registration."""
    
    class Meta(BaseRegisterSerializer.Meta):
        fields = BaseRegisterSerializer.Meta.fields + [
            'address', 'emergency_contact'
        ]
    
    def validate(self, data):
        data = super().validate(data)
        if not data.get('role'):
            data['role'] = User.Role.PARENT
        # Remove coach-specific fields
        data.pop('hourly_rate', None)
        data.pop('qualification', None)
        # date_of_birth removed
        return data
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        return User.objects.create_user(
            email=validated_data['email'],
            password=password,
            role=User.Role.PARENT,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=validated_data.get('phone', ''),
            address=validated_data.get('address', ''),
            emergency_contact=validated_data.get('emergency_contact', ''),
            is_active=True,
            is_email_verified=True
        )

class ClerkRegisterSerializer(BaseRegisterSerializer):
    """Serializer for clerk registration."""
    
    class Meta(BaseRegisterSerializer.Meta):
        fields = BaseRegisterSerializer.Meta.fields
    
    def validate(self, data):
        data = super().validate(data)
        data['role'] = User.Role.CLERK
        # Remove coach-specific fields
        data.pop('hourly_rate', None)
        data.pop('qualification', None)
        # date_of_birth removed
        data.pop('address', None)
        data.pop('emergency_contact', None)
        return data
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        return User.objects.create_user(
            email=validated_data['email'],
            password=password,
            role=User.Role.CLERK,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=validated_data.get('phone', ''),
            is_active=True,
            is_email_verified=True
        )

class CoachRegisterSerializer(BaseRegisterSerializer):
    """Serializer for coach registration."""
    
    hourly_rate = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=True,
        min_value=0,
        allow_null=True
    )
    qualification = serializers.CharField(required=True)
    # date_of_birth removed

    class Meta(BaseRegisterSerializer.Meta):
        fields = BaseRegisterSerializer.Meta.fields + [
            'qualification', 'hourly_rate'
        ]

    def validate(self, data):
        data = super().validate(data)
        data['role'] = User.Role.COACH
        if not data.get('qualification'):
            raise serializers.ValidationError({"qualification": "Qualification is required for coaches."})
        if data.get('hourly_rate') is None or data.get('hourly_rate') <= 0:
            raise serializers.ValidationError({"hourly_rate": "Hourly rate must be greater than 0."})
        return data
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        return User.objects.create_user(
            email=validated_data['email'],
            password=password,
            role=User.Role.COACH,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=validated_data.get('phone', ''),
            qualification=validated_data.get('qualification', ''),
            hourly_rate=validated_data.get('hourly_rate'),
            # date_of_birth removed
            is_active=True,
            is_email_verified=True
        )

class AdminRegisterSerializer(BaseRegisterSerializer):
    """Serializer for admin registration."""
    
    class Meta(BaseRegisterSerializer.Meta):
        fields = BaseRegisterSerializer.Meta.fields
    
    def validate(self, data):
        data = super().validate(data)
        data['role'] = User.Role.ADMIN
        data.pop('hourly_rate', None)
        data.pop('qualification', None)
        # date_of_birth removed
        data.pop('address', None)
        data.pop('emergency_contact', None)
        return data
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        return User.objects.create_user(
            email=validated_data['email'],
            password=password,
            role=User.Role.ADMIN,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=validated_data.get('phone', ''),
            is_active=True,
            is_email_verified=True,
            is_staff=True,
            is_superuser=True
        )

# --- Other serializers remain unchanged ---

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    
    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        if not email or not password:
            raise serializers.ValidationError("Both email and password are required.")
        return data

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'role',
            'phone', 'address', 'profile_picture',
            'qualification', 'hourly_rate', 'emergency_contact',
            'is_email_verified', 'is_phone_verified',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone', 'address',
                  'profile_picture', 'emergency_contact']

class EmailVerificationSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    
    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        try:
            validate_password(data['new_password'])
        except ValidationError as e:
            raise serializers.ValidationError({'new_password': list(e.messages)})
        return data
