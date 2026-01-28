import os
import django
from django.utils import timezone
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.students.models import Student
from apps.payments.models import Payment

now = timezone.now()
print(f"Current Time: {now}")
print(f"Month: {now.month}, Year: {now.year}")

paid_students = Payment.objects.filter(
    payment_type='MONTHLY',
    payment_date__month=now.month,
    payment_date__year=now.year
).values_list('student_id', flat=True)

print(f"Paid Student IDs: {list(paid_students)}")

unpaid = Student.objects.filter(status='ACTIVE').exclude(id__in=paid_students)
print(f"Unpaid Students Count: {unpaid.count()}")
for s in unpaid:
    print(f"Unpaid: {s.first_name} {s.last_name} (ID: {s.id})")
