"""Backend module: backend/scripts/test_student_api.py.

Helpers, utilities, or logic for the chess academy management system."""

import os
import sys
import django

# Add the current directory to sys.path
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from django.contrib.auth import get_user_model
from apps.students.models import Student
from apps.students.views import StudentViewSet

def test_filtering():
    User = get_user_model()
    admin = User.objects.filter(role='ADMIN').first()
    if not admin:
        print("No admin user found for testing.")
        return

    factory = APIRequestFactory()
    
    test_cases = [
        {"desc": "All Students", "params": {}},
        {"desc": "Search 'Th' (Partial Name)", "params": {"search": "Th"}},
        {"desc": "Search '65' (Partial ID)", "params": {"search": "65"}},
        {"desc": "School 'Royal' (Partial)", "params": {"school__icontains": "Royal"}},
    ]

    view = StudentViewSet.as_view({'get': 'list'})

    for case in test_cases:
        request = factory.get('/api/students/', case['params'])
        force_authenticate(request, user=admin)
        
        response = view(request)
        
        print(f"--- {case['desc']} ---")
        print(f"Params: {case['params']}")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print(f"Count: {len(response.data)}")
            if len(response.data) > 0:
                print(f"First Sample: {response.data[0]['id']} - {response.data[0]['first_name']}")
        else:
            print(f"Error: {response.data}")
        print()

if __name__ == "__main__":
    test_filtering()
