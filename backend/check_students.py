import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.students.models import Student
print(f'Total Students: {Student.objects.count()}')
print(f'Active Students: {Student.objects.filter(status="ACTIVE").count()}')
print(f'Pending Students: {Student.objects.filter(status="PENDING").count()}')
