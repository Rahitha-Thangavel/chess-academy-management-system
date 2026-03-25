import os
import sys
import django

# Add the current directory to sys.path
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.conf import settings
from apps.users.models import User
from apps.students.models import Student

print(f"DATABASE: {settings.DATABASES['default']['NAME']}")
print(f"TOTAL USERS: {User.objects.count()}")
print(f"COACHES: {User.objects.filter(role=User.Role.COACH).count()}")
print(f"PARENTS: {User.objects.filter(role=User.Role.PARENT).count()}")
print(f"STUDENTS: {Student.objects.count()}")

# Sample check
coach = User.objects.filter(role=User.Role.COACH).first()
if coach:
    print(f"Sample Coach: {coach.id}, Name: {coach.get_full_name()}, Pwd check: {coach.check_password(f'{coach.id}@123')}")

parent = User.objects.filter(role=User.Role.PARENT).first()
if parent:
    print(f"Sample Parent: {parent.id}, Name: {parent.get_full_name()}, Pwd check: {parent.check_password(f'{parent.id}@123')}")
    students = Student.objects.filter(parent_user=parent)
    print(f"Students for this parent: {students.count()}")
    for stu in students:
        print(f"  - Student: {stu.id}, Name: {stu.get_full_name()}, Batches: {[e.batch.batch_name for e in stu.enrollments.all()]}")
