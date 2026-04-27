"""Backend module: backend/scripts/test_email.py.

Helpers, utilities, or logic for the chess academy management system."""

import os
import sys
import django
from django.core.mail import send_mail
from django.conf import settings

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

def test_email():
    print("Testing email configuration...")
    print(f"Backend: {settings.EMAIL_BACKEND}")
    print(f"Host: {settings.EMAIL_HOST}")
    print(f"Port: {settings.EMAIL_PORT}")
    print(f"User: {settings.EMAIL_HOST_USER}")
    print(f"TLS: {settings.EMAIL_USE_TLS}")
    
    try:
        print("\nAttempting to send test email...")
        send_mail(
            subject='Test Email from Chess Academy',
            message='If you receive this, your email configuration is working correctly!',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.EMAIL_HOST_USER], # Send to self
            fail_silently=False,
        )
        print("\nSUCCESS: Email sent successfully!")
    except Exception as e:
        print("\nFAILURE: Could not send email.")
        print(f"Error: {str(e)}")
        print("\nTroubleshooting tips:")
        print("1. Check if EMAIL_HOST_PASSWORD is correct (use App Password for Gmail)")
        print("2. Check if EMAIL_HOST_USER is correct")
        print("3. Check internet connection and firewall blocking port 587")

if __name__ == "__main__":
    test_email()
