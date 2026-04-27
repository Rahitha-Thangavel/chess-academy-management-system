"""Backend module: backend/dump_data.py.

Helpers, utilities, or logic for the chess academy management system."""

import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.payments.models import Payment
from apps.students.models import Student

print(f"Total Payments: {Payment.objects.count()}")
for p in Payment.objects.all()[:5]:
    print(f"Payment: ID={p.id}, Student={p.student.first_name}, Amount={p.amount}, Date={p.payment_date}, Type={p.payment_type}")

print(f"Total Students: {Student.objects.count()}")
for s in Student.objects.all()[:5]:
    print(f"Student: ID={s.id}, Name={s.first_name} {s.last_name}, Status={s.status}")
