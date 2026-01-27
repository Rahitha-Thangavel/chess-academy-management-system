from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth import authenticate
from django.utils import timezone
from django.conf import settings

from .models import User
from .serializers import (
    ParentRegisterSerializer,
    ClerkRegisterSerializer,
    CoachRegisterSerializer,
    AdminRegisterSerializer,
    UserSerializer,
    LoginSerializer,
    UserProfileSerializer,
    EmailVerificationSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer
)
from .services import EmailService

class RegisterView(APIView):
    """View for user registration with role-based serializers."""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """Handle user registration based on role."""
        role = request.data.get('role', 'parent').upper()  # Convert to uppercase
        
        print(f"DEBUG RegisterView: Role received = {role}")
        print(f"DEBUG RegisterView: Data = {request.data}")
        
        # Select serializer based on role
        if role == 'PARENT':
            serializer_class = ParentRegisterSerializer
        elif role == 'CLERK':
            serializer_class = ClerkRegisterSerializer
        elif role == 'COACH':
            serializer_class = CoachRegisterSerializer
        elif role == 'ADMIN':
            # Only allow existing Admin users to create new Admin accounts
            if not (request.user and request.user.is_authenticated and request.user.role == 'ADMIN'):
                 return Response({'error': 'Unauthorized to create Admin account.'}, status=status.HTTP_403_FORBIDDEN)
            serializer_class = AdminRegisterSerializer
        else:
            return Response({
                'success': False,
                'error': f'Invalid role: {role}. Valid roles are: PARENT, CLERK, COACH, ADMIN'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        from django.db import transaction
        
        user = None
        token = None
        
        try:
            # Database operations in transaction
            with transaction.atomic():
                serializer = serializer_class(data=request.data)
                
                if serializer.is_valid():
                    user = serializer.save()
                    # Generate verification token
                    token = user.generate_verification_token()
                else:
                    return Response({
                        'success': False,
                        'errors': serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)

            # Email operations OUTSIDE transaction (to prevent DB locks during SMTP)
            if user and token:
                verification_url = f"{settings.FRONTEND_URL}/verify-email/{token}"
                try:
                    EmailService.send_verification_email(user, verification_url)
                except Exception as email_error:
                    print(f"Error sending email: {email_error}")
                    # We accept that the user is created but email failed.
                    # The frontend will show "Check Email", user can click "Resend" if needed.
                
                return Response({
                    'success': True,
                    'message': 'Registration successful! Please check your email to verify your account.',
                    'email': user.email
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"Registration Error: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        print(f"DEBUG: Serializer errors: {serializer.errors}")
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class VerifyEmailView(APIView):
    """View for email verification."""
    
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, token):
        """Verify email with token (GET request from email link)."""
        try:
            user = User.objects.get(email_verification_token=token)
            
            if user.verify_email(token):
                # Send welcome email
                EmailService.send_welcome_email(user)
                
                return Response({
                    'success': True,
                    'message': 'Email verified successfully! You can now login to your account.'
                }, status=status.HTTP_200_OK)
            else:
                if user.is_verification_token_expired():
                    # Generate new token and resend email
                    new_token = user.generate_verification_token()
                    new_verification_url = f"{settings.BACKEND_URL}/api/auth/verify-email/{new_token}/"
                    EmailService.send_verification_email(user, new_verification_url)
                    
                    return Response({
                        'success': False,
                        'message': 'Verification link has expired. A new verification email has been sent.',
                        'email': user.email
                    }, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({
                        'success': False,
                        'message': 'Invalid verification token.'
                    }, status=status.HTTP_400_BAD_REQUEST)
                    
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Invalid verification token.'
            }, status=status.HTTP_404_NOT_FOUND)

class ResendVerificationEmailView(APIView):
    """View to resend verification email."""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """Resend verification email."""
        email = request.data.get('email')
        
        if not email:
            return Response({
                'error': 'Email is required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
            
            if user.is_email_verified:
                return Response({
                    'message': 'Email is already verified.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Generate new token
            new_token = user.generate_verification_token()
            verification_url = f"{settings.BACKEND_URL}/api/auth/verify-email/{new_token}/"
            
            # Send verification email
            EmailService.send_verification_email(user, verification_url)
            
            return Response({
                'message': 'Verification email has been resent. Please check your inbox.',
                'email': user.email
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({
                'error': 'User with this email does not exist.'
            }, status=status.HTTP_404_NOT_FOUND)

class LoginView(APIView):
    """View for user login with email verification check."""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """Handle user login."""
        serializer = LoginSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            # Authenticate user with Email or Username
            from django.db.models import Q
            try:
                # Check if input is email or username
                user_obj = User.objects.filter(
                    Q(email=email) | Q(username=email)
                ).first()
                
                if user_obj:
                    # If user found, verify password manually or use authenticate with actual username
                    # create a custom authentication backend or just use check_password if simplistic
                    # Better: authenticate using the found user's credentials
                    # Standard authenticate() expects 'username' and 'password'
                    # We can pass the found user's email or username as 'username' arg if using ModelBackend
                    
                    user = authenticate(request, username=user_obj.email, password=password)
                    if not user:
                         # Try with actual username if email/username differ in auth backend logic
                         user = authenticate(request, username=user_obj.username, password=password)
                else:
                    user = None

            except Exception as e:
                print(f"Login Error: {e}")
                user = None
            
            if user is not None:
                # Check if email is verified
                if not user.is_email_verified:
                    return Response({
                        'error': 'Please verify your email before logging in.',
                        'email': user.email,
                        'resend_url': f'{settings.BACKEND_URL}/api/auth/resend-verification/'
                    }, status=status.HTTP_401_UNAUTHORIZED)
                
                if user.is_active:
                    # Generate JWT tokens
                    refresh = RefreshToken.for_user(user)
                    
                    return Response({
                        'user': UserSerializer(user).data,
                        'access': str(refresh.access_token),
                        'refresh': str(refresh)
                    }, status=status.HTTP_200_OK)
                else:
                    return Response(
                        {'error': 'Account is disabled.'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
            else:
                return Response(
                    {'error': 'Invalid email or password.'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    """View for user logout."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Handle user logout."""
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            return Response(
                {'message': 'Successfully logged out.'},
                status=status.HTTP_205_RESET_CONTENT
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class UserProfileView(APIView):
    """View for user profile."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get user profile."""
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request):
        """Update user profile."""
        serializer = UserProfileSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(APIView):
    """View for changing password."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Change user password."""
        user = request.user
        
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')
        
        # Validate inputs
        if not old_password or not new_password or not confirm_password:
            return Response(
                {'error': 'All password fields are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_password != confirm_password:
            return Response(
                {'error': 'New passwords do not match.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check old password
        if not user.check_password(old_password):
            return Response(
                {'error': 'Old password is incorrect.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set new password
        user.set_password(new_password)
        user.save()
        
        return Response(
            {'message': 'Password changed successfully.'},
            status=status.HTTP_200_OK
        )

class PasswordResetRequestView(APIView):
    """View for requesting password reset."""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """Handle password reset request."""
        serializer = PasswordResetRequestSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            try:
                user = User.objects.get(email=email)
                
                if not user.is_email_verified:
                    return Response({
                        'error': 'Please verify your email first.'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Generate reset token
                reset_token = user.generate_password_reset_token()
                reset_url = f"{settings.FRONTEND_URL}/reset-password/{reset_token}/"
                
                # Send reset email
                EmailService.send_password_reset_email(user, reset_url)
                
                return Response({
                    'message': 'Password reset email has been sent. Please check your inbox.',
                    'email': user.email
                }, status=status.HTTP_200_OK)
                
            except User.DoesNotExist:
                # Don't reveal if user exists
                return Response({
                    'message': 'If your email is registered, you will receive a password reset link.'
                }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(APIView):
    """View for confirming password reset."""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, token):
        """Handle password reset confirmation."""
        serializer = PasswordResetConfirmSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                user = User.objects.get(reset_password_token=token)
                
                if user.is_password_reset_token_expired():
                    return Response({
                        'error': 'Password reset link has expired. Please request a new one.'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Set new password
                user.set_password(serializer.validated_data['new_password'])
                user.reset_password_token = ""  # Clear token
                user.save()
                
                return Response({
                    'message': 'Password has been reset successfully. You can now login with your new password.'
                }, status=status.HTTP_200_OK)
                
            except User.DoesNotExist:
                return Response({
                    'error': 'Invalid password reset token.'
                }, status=status.HTTP_404_NOT_FOUND)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Permission Classes for Role-Based Access
class IsAdmin(permissions.BasePermission):
    """Permission check for Admin users."""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin()

class IsClerk(permissions.BasePermission):
    """Permission check for Clerk users."""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_clerk()

class IsCoach(permissions.BasePermission):
    """Permission check for Coach users."""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_coach()

class IsParent(permissions.BasePermission):
    """Permission check for Parent users."""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_parent()

class IsAdminOrClerk(permissions.BasePermission):
    """Permission check for Admin or Clerk users."""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_admin() or request.user.is_clerk()
        )