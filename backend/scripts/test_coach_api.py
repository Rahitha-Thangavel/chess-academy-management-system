import requests
import json

def test_coach_filters():
    base_url = "http://localhost:8000/api/auth/users/"
    # Assuming we have a valid token. If not, this might fail unless we run in shell context.
    # Let's use the Django shell approach for reliability in this environment.
    pass

if __name__ == "__main__":
    from apps.users.models import User
    from rest_framework.test import APIRequestFactory, force_authenticate
    from apps.users.views import UserListView

    factory = APIRequestFactory()
    view = UserListView.as_view()
    
    # Mock Admin User
    admin = User.objects.filter(role='ADMIN').first()
    
    test_cases = [
        {"desc": "All Coaches", "params": {"role": "COACH"}},
        {"desc": "Search Coach Name", "params": {"role": "COACH", "search": "Amila"}},
        {"desc": "Filter by Qualification", "params": {"role": "COACH", "qualification": "FIDE"}},
        {"desc": "Filter by Status (Active)", "params": {"role": "COACH", "status": "active"}},
        {"desc": "Filter by Rate (3000-5000)", "params": {"role": "COACH", "min_rate": "3000", "max_rate": "5000"}},
    ]

    for tc in test_cases:
        request = factory.get(base_url, tc["params"])
        force_authenticate(request, user=admin)
        response = view(request)
        print(f"--- {tc['desc']} ---")
        print(f"Params: {tc['params']}")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print(f"Count: {len(response.data)}")
            if len(response.data) > 0:
                coach = response.data[0]
                print(f"First Sample: {coach.get('id')} - {coach.get('first_name')} {coach.get('last_name')}")
                print(f"Qual: {coach.get('qualification')}, Rate: {coach.get('hourly_rate')}")
        print("\n")
