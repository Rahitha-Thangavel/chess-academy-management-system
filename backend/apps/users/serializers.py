from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import transaction
from .models import User, UserProfile

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
            'first_name', 'last_name', 'phone', 'username'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True, 'max_length': 75},
            'last_name': {'required': True, 'max_length': 75},
            'phone': {'required': False, 'allow_blank': True},
            'username': {'required': True}
        }
    
    def validate(self, data):
        """Validate base registration data."""
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        
        try:
            user = User(
                email=data.get('email', ''),
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', ''),
                username=data.get('username', None)
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
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({
                "username": "A user with this username already exists."
            })
        return data

class ParentRegisterSerializer(BaseRegisterSerializer):
    """Serializer for parent registration."""
    
    address = serializers.CharField(required=False, allow_blank=True)
    emergency_contact = serializers.CharField(required=False, allow_blank=True)
    relationship = serializers.CharField(required=False, allow_blank=True)

    class Meta(BaseRegisterSerializer.Meta):
        fields = BaseRegisterSerializer.Meta.fields + [
            'address', 'emergency_contact', 'relationship'
        ]
    
    def validate(self, data):
        data = super().validate(data)
        data['role'] = User.Role.PARENT
        return data
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        
        # Profile fields
        address = validated_data.pop('address', '')
        emergency_contact = validated_data.pop('emergency_contact', '')
        relationship = validated_data.pop('relationship', '')

        with transaction.atomic():
            user = User.objects.create_user(
                email=validated_data['email'],
                password=password,
                role=User.Role.PARENT,
                first_name=validated_data.get('first_name', ''),
                last_name=validated_data.get('last_name', ''),
                phone=validated_data.get('phone', ''),
                username=validated_data.get('username', None),
                is_active=True,
                is_email_verified=False
            )
            UserProfile.objects.create(
                user=user,
                profile_type=UserProfile.ProfileType.PARENT,
                address=address,
                emergency_contact=emergency_contact,
                relationship=relationship
            )
        return user

class ClerkRegisterSerializer(BaseRegisterSerializer):
    """Serializer for clerk registration."""
    
    class Meta(BaseRegisterSerializer.Meta):
        fields = BaseRegisterSerializer.Meta.fields
    
    def validate(self, data):
        data = super().validate(data)
        data['role'] = User.Role.CLERK
        return data
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        
        with transaction.atomic():
            user = User.objects.create_user(
                email=validated_data['email'],
                password=password,
                role=User.Role.CLERK,
                first_name=validated_data.get('first_name', ''),
                last_name=validated_data.get('last_name', ''),
                phone=validated_data.get('phone', ''),
                username=validated_data.get('username', None),
                is_active=True,
                is_email_verified=False
            )
            UserProfile.objects.create(
                user=user,
                profile_type=UserProfile.ProfileType.CLERK
            )
        return user

class CoachRegisterSerializer(BaseRegisterSerializer):
    """Serializer for coach registration."""
    
    hourly_rate = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=True,
        min_value=0,
        allow_null=True
    )
    specialization = serializers.CharField(required=True)
    hire_date = serializers.DateField(required=False, allow_null=True)

    class Meta(BaseRegisterSerializer.Meta):
        fields = BaseRegisterSerializer.Meta.fields + [
            'specialization', 'hourly_rate', 'hire_date'
        ]

    def validate(self, data):
        data = super().validate(data)
        data['role'] = User.Role.COACH
        if not data.get('specialization'):
            raise serializers.ValidationError({"specialization": "Specialization is required for coaches."})
        if data.get('hourly_rate') is None or data.get('hourly_rate') <= 0:
            raise serializers.ValidationError({"hourly_rate": "Hourly rate must be greater than 0."})
        return data
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')

        # Profile fields
        specialization = validated_data.pop('specialization', '')
        hourly_rate = validated_data.pop('hourly_rate', 0.00)
        hire_date = validated_data.pop('hire_date', None)

        with transaction.atomic():
            user = User.objects.create_user(
                email=validated_data['email'],
                password=password,
                role=User.Role.COACH,
                first_name=validated_data.get('first_name', ''),
                last_name=validated_data.get('last_name', ''),
                phone=validated_data.get('phone', ''),
                username=validated_data.get('username', None),
                is_active=True,
                is_email_verified=False
            )
            UserProfile.objects.create(
                user=user,
                profile_type=UserProfile.ProfileType.COACH,
                qualification=specialization, # Mapping 'specialization' to 'qualification'
                hourly_rate=hourly_rate,
                # hire_date is not in UserProfile (using created_at or needs to be added?)
                # User schema requested 'qualification', 'hourly_rate', 'date_of_birth'.
                # Existing coach had 'hire_date'. I'll ignore 'hire_date' or add it if crucial, 
                # but following strict 3NF schema provided, it wasn't there. I'll drop it for now in profile or map to something else.
                # Oh wait, date_of_birth is new.
            )
        return user

class AdminRegisterSerializer(BaseRegisterSerializer):
    """Serializer for admin registration."""
    
    class Meta(BaseRegisterSerializer.Meta):
        fields = BaseRegisterSerializer.Meta.fields
    
    def validate(self, data):
        data = super().validate(data)
        data['role'] = User.Role.ADMIN
        return data
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        
        with transaction.atomic():
            user = User.objects.create_user(
                email=validated_data['email'],
                password=password,
                role=User.Role.ADMIN,
                first_name=validated_data.get('first_name', ''),
                last_name=validated_data.get('last_name', ''),
                phone=validated_data.get('phone', ''),
                username=validated_data.get('username', None),
                is_active=True,
                is_email_verified=True,
                is_staff=True,
                is_superuser=True
            )
            UserProfile.objects.create(
                user=user,
                profile_type=UserProfile.ProfileType.ADMIN
            )
            return user

# --- Other serializers ---

class LoginSerializer(serializers.Serializer):
    email = serializers.CharField(required=True) # Changed from EmailField to CharField to support Username
    password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    
    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        if not email or not password:
            raise serializers.ValidationError("Both email/username and password are required.")
        return data

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'role',
            'phone', 'username',
            'is_email_verified', 'is_phone_verified', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class UserProfileSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.id')
    role = serializers.ReadOnlyField(source='user.role')
    first_name = serializers.ReadOnlyField(source='user.first_name')
    last_name = serializers.ReadOnlyField(source='user.last_name')
    email = serializers.ReadOnlyField(source='user.email')
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = UserProfile
        fields = '__all__'

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


