"""Backend module: backend/check_roles.py.

Helpers, utilities, or logic for the chess academy management system."""

import os
import django
from django.conf import settings

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.users.models import User

with open('roles_output.txt', 'w') as f:
    f.write("\n--- Listing Users with Role='COACH' ---\n")
    coaches = User.objects.filter(role='COACH')
    for c in coaches:
        f.write(f"User: {c.email}, Role: {c.role}, Active: {c.is_active}\n")

    f.write("\n--- Listing ALL Users ---\n")
    all_users = User.objects.all()
    for u in all_users:
        f.write(f"User: {u.email} (ID: {u.id}), Role: '{u.role}', Active: {u.is_active}\n")
