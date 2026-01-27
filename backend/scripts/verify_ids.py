
import os
import django
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.users.models import User
from apps.students.models import Student
from apps.batches.models import Batch
from apps.tournaments.models import Tournament
from apps.payments.models import Payment
from datetime import date, time

def test_ids():
    print("Testing ID Generation...")
    
    # 1. Users
    print("\n--- Users ---")
    admin = User.objects.create_superuser('admin@test.com', 'pass123', role='ADMIN', first_name='Boss', last_name='Admin')
    print(f"Admin ID: {admin.id} (Expected ADM001)")
    
    clerk = User.objects.create_user('clerk@test.com', 'pass123', role='CLERK', first_name='Joe', last_name='Clerk')
    print(f"Clerk ID: {clerk.id} (Expected CLK001)")
    
    coach = User.objects.create_user('coach@test.com', 'pass123', role='COACH', first_name='Mike', last_name='Coach')
    print(f"Coach ID: {coach.id} (Expected COA001)")
    
    parent = User.objects.create_user('parent@test.com', 'pass123', role='PARENT', first_name='Jane', last_name='Parent')
    print(f"Parent ID: {parent.id} (Expected PAR001)")
    
    parent2 = User.objects.create_user('parent2@test.com', 'pass123', role='PARENT', first_name='John', last_name='Parent')
    print(f"Parent2 ID: {parent2.id} (Expected PAR002)")
    
    # 2. Students
    print("\n--- Students ---")
    student = Student.objects.create(
        first_name='Little', last_name='Bobby', 
        date_of_birth=date(2015, 1, 1), 
        enrollment_date=date.today(),
        parent_user=parent
    )
    print(f"Student ID: {student.id} (Expected STU{date.today().year}001)")
    
    # 3. Batches
    print("\n--- Batches ---")
    batch = Batch.objects.create(
        batch_name="Beginners",
        start_time=time(10, 0),
        end_time=time(11, 0),
        coach_user=coach
    )
    print(f"Batch ID: {batch.id} (Expected BATCH-001)")
    
    # 4. Tournaments
    print("\n--- Tournaments ---")
    tour = Tournament.objects.create(
        tournament_name="Winter Cup",
        tournament_date=date.today(),
        created_by_user=admin
    )
    print(f"Tournament ID: {tour.id} (Expected TOUR{date.today().year}001)")
    
    # 5. Payments
    print("\n--- Payments ---")
    pay = Payment.objects.create(
        student=student,
        amount=500.00,
        payment_date=date.today(),
        payment_method='CASH',
        payment_type='MONTHLY'
    )
    print(f"Payment ID: {pay.id} (Expected PAY{date.today().year}001)")

if __name__ == "__main__":
    try:
        test_ids()
        print("\nSUCCESS: All IDs generated successfully.")
    except Exception as e:
        print(f"\nERROR: {e}")
