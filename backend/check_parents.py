import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.students.models import Student

students = Student.objects.filter(status='ACTIVE')
for s in students:
    parent = s.parent_user
    print(f"Student: {s.first_name} (ID: {s.id}), Parent: {parent}, Parent ID: {parent.id if parent else 'None'}")
