"""Backend module: backend/scripts/verify_data.py.

Helpers, utilities, or logic for the chess academy management system."""

from apps.users.models import User
from apps.students.models import Student

def verify():
    coaches_count = User.objects.filter(role=User.Role.COACH).count()
    parents_count = User.objects.filter(role=User.Role.PARENT).count()
    students_count = Student.objects.count()

    print(f"Coaches: {coaches_count}")
    print(f"Parents: {parents_count}")
    print(f"Students: {students_count}")

    # Check some random data
    p = User.objects.filter(role=User.Role.PARENT).first()
    if p:
        s_count = Student.objects.filter(parent_user=p).count()
        print(f"Example Parent: {p.id}, Name: {p.get_full_name()}, Students: {s_count}")
        password_check = p.check_password(f"{p.id}@123")
        print(f"Password '{p.id}@123' verification: {password_check}")
        print(f"Email verified: {p.is_email_verified}")

    c = User.objects.filter(role=User.Role.COACH).first()
    if c:
        print(f"Example Coach: {c.id}, Name: {c.get_full_name()}")
        password_check = c.check_password(f"{c.id}@123")
        print(f"Password '{c.id}@123' verification: {password_check}")

if __name__ == "django.core.management.commands.shell":
    verify()
