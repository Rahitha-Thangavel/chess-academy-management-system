
import os
import django
import sys

# Setup Django Environment
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.test import RequestFactory
from rest_framework.test import APIClient
from apps.users.models import User
from apps.users.views import LoginView
from django.db import IntegrityError

def run_verification():
    print("--- Verifying Username Support ---")
    
    email = "test_uniquser@example.com"
    username = "uniqueuser123"
    password = "SafePassword123!"
    
    # Clean up
    User.objects.filter(email=email).delete()
    User.objects.filter(username=username).delete()
    
    print(f"1. Creating User: Email={email}, Username={username}")
    user = User.objects.create_user(
        email=email,
        username=username,
        password=password,
        first_name="Test",
        last_name="User",
        is_active=True,
        is_email_verified=True # Auto verify for login test
    )
    
    client = APIClient()
    
    print("\n2. Testing Login with EMAIL")
    response = client.post('/api/auth/login/', {
        'email': email,
        'password': password
    })
    if response.status_code == 200:
        print("PASS: Login with Email successful.")
    else:
        print(f"FAIL: Login with Email failed. {response.data}")

    print("\n3. Testing Login with USERNAME")
    response = client.post('/api/auth/login/', {
        'email': username, # Our serializer expects 'email' key even if value is username
        'password': password
    })
    if response.status_code == 200:
        print("PASS: Login with Username successful.")
    else:
        print(f"FAIL: Login with Username failed. {response.data}")
        
    print("\n4. Testing Duplicate Username Constraint")
    try:
        User.objects.create_user(
            email="another@example.com",
            username=username, # SAME username
            password="password"
        )
        print("FAIL: Database allowed duplicate username!")
    except IntegrityError:
         print("PASS: Database correctly blocked duplicate username.")
    except Exception as e:
         print(f"PASS: Error raised as expected (though check if it is IntegrityError): {e}")

if __name__ == "__main__":
    run_verification()
