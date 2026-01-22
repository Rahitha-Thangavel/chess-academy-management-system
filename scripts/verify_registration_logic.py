
import os
import django
import sys
from pathlib import Path

# Add backend to path
BASE_DIR = Path(__file__).resolve().parent.parent / 'backend'
sys.path.append(str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.users.models import User, ParentProfile, CoachProfile, ClerkProfile
from rest_framework.test import APIRequestFactory
from apps.users.views import RegisterView

def clean_db():
    print("Cleaning User DB...")
    User.objects.all().delete()

def test_registration():
    factory = APIRequestFactory()
    view = RegisterView.as_view()

    # 1. Register Parent
    print("\n--- Testing Parent Registration ---")
    parent_data = {
        'email': 'parent@test.com',
        'password': 'Password123!',
        'confirm_password': 'Password123!',
        'role': 'PARENT',
        'first_name': 'John',
        'last_name': 'Parent',
        'phone': '0771234567',
        'address': '123 Chess St', 
        'emergency_contact': '0711111111',
        'relationship': 'Father'
    }
    request = factory.post('/api/auth/register/', parent_data, format='json')
    response = view(request)
    print(f"Parent Status: {response.status_code}")
    if response.status_code == 201:
        user = User.objects.get(email='parent@test.com')
        try:
            profile = user.parent_profile
            print(f"SUCCESS: Parent created. ID: {profile.parent_id}")
            if profile.parent_id != 'PAR001':
                print(f"FAILURE: Expected PAR001, got {profile.parent_id}")
        except Exception as e:
            print(f"FAILURE: Profile missing. {e}")
    else:
        print(f"FAILURE: {response.data}")

    # 2. Register Coach
    print("\n--- Testing Coach Registration ---")
    coach_data = {
        'email': 'coach@test.com',
        'password': 'Password123!',
        'confirm_password': 'Password123!',
        'role': 'COACH',
        'first_name': 'Mike',
        'last_name': 'Coach',
        'phone': '0772223333',
        'specialization': 'Endgames',
        'hourly_rate': '1500.00'
    }
    request = factory.post('/api/auth/register/', coach_data, format='json')
    response = view(request)
    print(f"Coach Status: {response.status_code}")
    if response.status_code == 201:
        user = User.objects.get(email='coach@test.com')
        try:
            profile = user.coach_profile
            print(f"SUCCESS: Coach created. ID: {profile.coach_id}")
            if profile.coach_id != 'COA001':
                print(f"FAILURE: Expected COA001, got {profile.coach_id}")
        except Exception as e:
            print(f"FAILURE: Profile missing. {e}")
    else:
        print(f"FAILURE: {response.data}")

    # 3. Register Clerk
    print("\n--- Testing Clerk Registration ---")
    clerk_data = {
        'email': 'clerk@test.com',
        'password': 'Password123!',
        'confirm_password': 'Password123!',
        'role': 'CLERK',
        'first_name': 'Sarah',
        'last_name': 'Clerk',
        'phone': '0774445555'
    }
    request = factory.post('/api/auth/register/', clerk_data, format='json')
    response = view(request)
    print(f"Clerk Status: {response.status_code}")
    if response.status_code == 201:
        user = User.objects.get(email='clerk@test.com')
        try:
            profile = user.clerk_profile
            print(f"SUCCESS: Clerk created. ID: {profile.clerk_id}")
            if profile.clerk_id != 'CLK001':
                print(f"FAILURE: Expected CLK001, got {profile.clerk_id}")
        except Exception as e:
            print(f"FAILURE: Profile missing. {e}")
    else:
        print(f"FAILURE: {response.data}")

if __name__ == '__main__':
    try:
        clean_db()
        test_registration()
    except Exception as e:
        print(f"ERROR: {e}")
