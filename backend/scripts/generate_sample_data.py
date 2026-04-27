"""Backend module: backend/scripts/generate_sample_data.py.

Helpers, utilities, or logic for the chess academy management system."""

import os
import sys
import random
import django
from django.utils import timezone
from datetime import date, timedelta

# Add the current directory to sys.path
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.conf import settings
from apps.users.models import User, UserProfile
from apps.students.models import Student
from django.db import transaction

# Sri Lankan Sinhala Names
sinhala_first_names = [
    "Kusal", "Pathum", "Charith", "Wanindu", "Dasun", "Dinesh", "Dimuth", "Angelo", "Suranga", "Lahiru",
    "Kasun", "Nuwan", "Saman", "Roshan", "Tharindu", "Amila", "Ishara", "Gayan", "Prabath", "Vihan",
    "Anura", "Dhammika", "Mahela", "Sanath", "Kumar", "Muttaiah", "Tilkaratne", "Aravinda", "Arjuna", "Rangana",
    "Sandini", "Nilanthi", "Kanchana", "Piumi", "Dulanjali", "Tharushi", "Dilhani", "Gayani", "Inoka", "Hasini",
    "Oshadi", "Vishwa", "Asalanka", "Bhanuka", "Kamindu", "Sadeera", "Dunith", "Matheesha", "Dilshan", "Lasith"
]

sinhala_last_names = [
    "Perera", "Fernando", "Silva", "de Silva", "Mendis", "Karunaratne", "Rajapaksa", "Sirisena", "Jayawardene", "Sangakkara",
    "Mathews", "Chandimal", "Hasaranga", "Shanaka", "Liyanage", "Gunathilaka", "Prasanna", "Lakmal", "Kumara", "Chameera",
    "Peiris", "Wijewardene", "Senanayake", "Bandara", "Ratnayake", "Dassanayake", "Jayasinghe", "Herath", "Gamage", "Madushanka",
    "Wellalage", "Theekshana", "Pathirana", "Vandersay", "Malinga", "Kulasekara", "Vaas", "Muralidaran", "Ranatunga", "Gurusinghe"
]

# Sri Lankan Tamil Names
tamil_first_names = [
    "Sivan", "Karthik", "Arun", "Vijay", "Rahitha", "Mathu", "Gobi", "Ravi", "Balan", "Thiru",
    "Jegathees", "Prabhu", "Suresh", "Ramesh", "Kumaran", "Selvam", "Senthil", "Vignesh", "Anandan", "Baskar",
    "Dharani", "Eswaran", "Ganesh", "Hari", "Iyer", "Jegan", "Kishore", "Logan", "Mani", "Naren",
    "Oviya", "Priya", "Rekha", "Shanthi", "Uma", "Vani", "Yamuna", "Gayathri", "Lakshmi", "Saraswathi",
    "Anusha", "Bhavani", "Divya", "Ishwarya", "Janani", "Kavitha", "Madhavi", "Nandhini", "Pavithra", "Sindhu"
]

tamil_last_names = [
    "Thangavel", "Rajaratnam", "Sivalingam", "Gunaratnam", "Ponnambalam", "Chelvanayakam", "Amirthalingam", "Sampanthan", "Sumandiran", "Wigneswaran",
    "Arumugam", "Kandasamy", "Murugan", "Subramaniam", "Velupillai", "Prabhakaran", "Maheshwaran", "Loganathan", "Balakrishnan", "Sivanesan",
    "Thiruchelvam", "Kadirgamar", "Jeyaraj", "Douglas", "Devananda", "Karuna", "Pillayan", "Ananthi", "Sritharan", "Gajendrakumar",
    "Sivajilingam", "Manivannan", "Rasamanickam", "Shanakiyan", "Viyalendran", "Angajan", "Ramanathan", "Coomaraswamy", "Vaithilingam", "Sunderalingam"
]

all_first_names = sinhala_first_names + tamil_first_names
all_last_names = sinhala_last_names + tamil_last_names

def generate_username(first_name, last_name):
    base = f"{first_name.lower()}.{last_name.lower()}".replace(" ", "")
    username = base
    counter = 1
    while User.objects.filter(username=username).exists():
        username = f"{base}{counter}"
        counter += 1
    return username

def generate_email(username):
    return f"{username}@test.com"

@transaction.atomic
def run():
    print("Starting data generation...")

    # 1. Generate 15 Coaches
    print("Generating 15 Coaches...")
    coaches = []
    for i in range(15):
        first_name = random.choice(all_first_names)
        last_name = random.choice(all_last_names)
        username = generate_username(first_name, last_name)
        email = generate_email(username)
        
        user = User.objects.create_user(
            email=email,
            username=username,
            first_name=first_name,
            last_name=last_name,
            role=User.Role.COACH,
            is_email_verified=True,
            is_active=True
        )
        
        # Set password based on generated ID
        password = f"{user.id}@123"
        user.set_password(password)
        user.save()
        
        UserProfile.objects.create(
            user=user,
            profile_type=UserProfile.ProfileType.COACH,
            qualification="FIDE National Instructor / Experienced Regional Coach",
            hourly_rate=random.randint(1000, 5000),
            date_of_birth=date(1980 + random.randint(0, 20), random.randint(1, 12), random.randint(1, 28))
        )
        coaches.append(user)
        print(f"Created Coach: {user.id} ({user.get_full_name()})")

    # 2. Generate 150 Parents
    print("Generating 150 Parents...")
    parents = []
    for i in range(150):
        first_name = random.choice(all_first_names)
        last_name = random.choice(all_last_names)
        username = generate_username(first_name, last_name)
        email = generate_email(username)
        
        user = User.objects.create_user(
            email=email,
            username=username,
            first_name=first_name,
            last_name=last_name,
            role=User.Role.PARENT,
            is_email_verified=True,
            is_active=True
        )
        
        # Set password based on generated ID
        password = f"{user.id}@123"
        user.set_password(password)
        user.save()
        
        UserProfile.objects.create(
            user=user,
            profile_type=UserProfile.ProfileType.PARENT,
            address=f"No {random.randint(1, 200)}, {random.choice(['Galle Road', 'Kandy Road', 'Main Street', 'Temple Road'])}, {random.choice(['Colombo', 'Kandy', 'Galle', 'Jaffna', 'Matara', 'Negombo'])}",
            emergency_contact=f"077{random.randint(1000000, 9999999)}",
            relationship=random.choice(["Father", "Mother", "Guardian"])
        )
        parents.append(user)
        if (i+1) % 10 == 0:
            print(f"Created {i+1} parents...")

    # 3. Generate 200 Students
    print("Generating 200 Students...")
    
    # We need to assign 200 students to 150 parents.
    # Some parents should have 2 students.
    # Total students = 200. Total parents = 150.
    # Let's give 50 parents 2 students, and 100 parents 1 student.
    
    student_count = 0
    assigned_parents = parents.copy()
    random.shuffle(assigned_parents)
    
    # First 50 parents get 2 students each
    for i in range(50):
        parent = assigned_parents[i]
        for _ in range(2):
            first_name = random.choice(all_first_names)
            last_name = parent.last_name # Usually share last name
            
            student = Student.objects.create(
                first_name=first_name,
                last_name=last_name,
                date_of_birth=date(2010 + random.randint(0, 10), random.randint(1, 12), random.randint(1, 28)),
                grade_level=f"Grade {random.randint(1, 12)}",
                school=f"{random.choice(['Ananda', 'Nalanda', 'Royal', 'St. Thomas', 'Musaeus', 'Visakha', 'Mahinda', 'Richmond', 'Jaffna Hindu'])} College",
                parent_user=parent,
                status=Student.Status.ACTIVE,
                created_by=coaches[0] # Just assign to a coach/clerk or leave as sys
            )
            student_count += 1

    # Remaining 100 parents get 1 student each
    for i in range(50, 150):
        parent = assigned_parents[i]
        first_name = random.choice(all_first_names)
        last_name = parent.last_name
        
        student = Student.objects.create(
            first_name=first_name,
            last_name=last_name,
            date_of_birth=date(2010 + random.randint(0, 10), random.randint(1, 12), random.randint(1, 28)),
            grade_level=f"Grade {random.randint(1, 12)}",
            school=f"{random.choice(['Ananda', 'Nalanda', 'Royal', 'St. Thomas', 'Musaeus', 'Visakha', 'Mahinda', 'Richmond', 'Jaffna Hindu'])} College",
            parent_user=parent,
            status=Student.Status.ACTIVE,
            created_by=coaches[0]
        )
        student_count += 1

    print(f"Successfully created {student_count} students.")
    print("Data generation complete!")

if __name__ == "__main__":
    run()
elif __name__ == "django.core.management.commands.shell":
    run()
