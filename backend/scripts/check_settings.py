import os
import sys
import django
from django.conf import settings

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

def check_settings():
    print(f"FRONTEND_URL: {settings.FRONTEND_URL}")
    print(f"BACKEND_URL: {settings.BACKEND_URL}")

if __name__ == "__main__":
    check_settings()
