from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils.crypto import get_random_string
from django.utils import timezone
from datetime import timedelta

class UserManager(BaseUserManager):
    """Define a model manager for User model with no username field."""
    
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        """Create and save a User with the given email and password."""
        if not email:
            raise ValueError('The given email must be set')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        
        # Default to inactive until email verification
        # But if 'is_active' is explicitly passed (e.g. su), use it.
        if 'is_active' not in extra_fields:
            user.is_active = False
            
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular User with the given email and password."""
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        # Default active to True for now if not specified, logic in view handles verification check
        extra_fields.setdefault('is_active', True) 
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        """Create and save a SuperUser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'ADMIN')
        extra_fields.setdefault('is_email_verified', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)

class User(AbstractUser):
    """Custom User model with email as unique identifier and email verification."""
    
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', _('Admin')
        CLERK = 'CLERK', _('Clerk')
        COACH = 'COACH', _('Coach')
        PARENT = 'PARENT', _('Parent')
    
    username = None
    email = models.EmailField(_('email address'), unique=True)
    
    role = models.CharField(
        _('role'),
        max_length=10,
        choices=Role.choices,
        default=Role.PARENT
    )
    
    # Common fields
    phone = models.CharField(_('phone number'), max_length=15, blank=True)
    
    # Email Verification fields
    is_email_verified = models.BooleanField(_('email verified'), default=False)
    email_verification_token = models.CharField(
        _('email verification token'),
        max_length=100,
        blank=True
    )
    email_verification_sent_at = models.DateTimeField(
        _('verification sent at'),
        null=True,
        blank=True
    )
    
    # Password reset fields
    reset_password_token = models.CharField(
        _('password reset token'),
        max_length=100,
        blank=True
    )
    reset_password_sent_at = models.DateTimeField(
        _('password reset sent at'),
        null=True,
        blank=True
    )
    
    # Status fields
    is_phone_verified = models.BooleanField(_('phone verified'), default=False)
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    objects = UserManager()
    
    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"
    
    def is_admin(self):
        return self.role == self.Role.ADMIN
    
    def is_clerk(self):
        return self.role == self.Role.CLERK
    
    def is_coach(self):
        return self.role == self.Role.COACH
    
    def is_parent(self):
        return self.role == self.Role.PARENT
    
    def get_full_name(self):
        """Return the full name of the user."""
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name if full_name else self.email
    
    def generate_verification_token(self):
        """Generate a new email verification token."""
        self.email_verification_token = get_random_string(50)
        self.email_verification_sent_at = timezone.now()
        self.save()
        return self.email_verification_token
    
    def is_verification_token_expired(self):
        """Check if verification token has expired (24 hours)."""
        if not self.email_verification_sent_at:
            return True
        expiry_time = self.email_verification_sent_at + timedelta(hours=24)
        return timezone.now() > expiry_time
    
    def verify_email(self, token):
        """Verify email with provided token."""
        if (self.email_verification_token == token and 
            not self.is_verification_token_expired()):
            self.is_email_verified = True
            self.is_active = True
            self.email_verification_token = ""
            self.save()
            return True
        return False
    
    def generate_password_reset_token(self):
        """Generate password reset token."""
        self.reset_password_token = get_random_string(50)
        self.reset_password_sent_at = timezone.now()
        self.save()
        return self.reset_password_token
    
    def is_password_reset_token_expired(self):
        """Check if password reset token has expired (1 hour)."""
        if not self.reset_password_sent_at:
            return True
        expiry_time = self.reset_password_sent_at + timedelta(hours=1)
        return timezone.now() > expiry_time


class ClerkProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='clerk_profile')
    clerk_id = models.CharField(max_length=20, unique=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.clerk_id:
            last = ClerkProfile.objects.all().order_by('id').last()
            if not last:
                self.clerk_id = 'CLK001'
            else:
                try:
                    # Extract number from CLK001 -> 001
                    last_id = last.clerk_id
                    number = int(last_id.replace('CLK', ''))
                    new_number = number + 1
                    self.clerk_id = f'CLK{new_number:03d}'
                except ValueError:
                    self.clerk_id = f'CLK{get_random_string(3)}'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Clerk: {self.clerk_id} - {self.user.email}"


class CoachProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='coach_profile')
    coach_id = models.CharField(max_length=20, unique=True, blank=True)
    specialization = models.CharField(max_length=100, blank=True)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    hire_date = models.DateField(null=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.coach_id:
            last = CoachProfile.objects.all().order_by('id').last()
            if not last:
                self.coach_id = 'COA001'
            else:
                try:
                    last_id = last.coach_id
                    number = int(last_id.replace('COA', ''))
                    new_number = number + 1
                    self.coach_id = f'COA{new_number:03d}'
                except ValueError:
                    self.coach_id = f'COA{get_random_string(3)}'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Coach: {self.coach_id} - {self.user.email}"


class ParentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='parent_profile')
    parent_id = models.CharField(max_length=20, unique=True, blank=True)
    address = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=15, blank=True)
    relationship = models.CharField(max_length=50, blank=True, help_text="Relationship with student")
    created_date = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.parent_id:
            last = ParentProfile.objects.all().order_by('id').last()
            if not last:
                self.parent_id = 'PAR001'
            else:
                try:
                    last_id = last.parent_id
                    number = int(last_id.replace('PAR', ''))
                    new_number = number + 1
                    self.parent_id = f'PAR{new_number:03d}'
                except ValueError:
                    self.parent_id = f'PAR{get_random_string(3)}'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Parent: {self.parent_id} - {self.user.email}"