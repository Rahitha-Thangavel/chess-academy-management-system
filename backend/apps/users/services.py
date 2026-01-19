from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags

class EmailService:
    """Service for sending emails."""
    
    @staticmethod
    def send_verification_email(user, verification_url):
        """Send email verification email."""
        subject = 'Verify Your Chess Academy Account'
        
        # HTML email template
        html_message = render_to_string('users/email_verification.html', {
            'user': user,
            'verification_url': verification_url,
            'frontend_url': settings.FRONTEND_URL,
        })
        
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
    
    @staticmethod
    def send_password_reset_email(user, reset_url):
        """Send password reset email."""
        subject = 'Reset Your Chess Academy Password'
        
        html_message = render_to_string('users/password_reset.html', {
            'user': user,
            'reset_url': reset_url,
            'frontend_url': settings.FRONTEND_URL,
        })
        
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
    
    @staticmethod
    def send_welcome_email(user):
        """Send welcome email after verification."""
        subject = 'Welcome to Chess Academy!'
        
        html_message = render_to_string('users/welcome_email.html', {
            'user': user,
            'frontend_url': settings.FRONTEND_URL,
        })
        
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )