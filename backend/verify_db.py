"""Backend module: backend/verify_db.py.

Helpers, utilities, or logic for the chess academy management system."""

import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings
from apps.payments.models import Payment
from apps.students.models import Student

print(f"DATABASE ENGINE: {settings.DATABASES['default']['ENGINE']}")
print(f"DATABASE NAME: {settings.DATABASES['default']['NAME']}")
print(f"Total Payments: {Payment.objects.count()}")
for p in Payment.objects.all():
    print(f"Payment: ID={p.id}, Student={p.student.first_name}, Amount={p.amount}, Date={p.payment_date}")

print(f"Total Active Students: {Student.objects.filter(status='ACTIVE').count()}")
for s in Student.objects.filter(status='ACTIVE'):
    print(f"Active Student: {s.first_name} {s.last_name} (ID: {s.id})")
