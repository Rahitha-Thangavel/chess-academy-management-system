"""Backend module: backend/scripts/generate_batches.py.

Helpers, utilities, or logic for the chess academy management system."""

import os
import django
import random
from datetime import datetime, time, date, timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.batches.models import Batch

def generate_batches():
    print("Deleting existing batches...")
    Batch.objects.all().delete()

    days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
    levels = ['Beginner', 'Intermediate', 'Advanced']
    
    count = 1
    # Generate 25 Recurring Batches
    for i in range(25):
        level = levels[i % 3]
        level_num = (i // 3) + 1
        name = f"{level} Class {level_num:02d}"
        
        day = random.choice(days)
        if day in ['SAT', 'SUN']:
            # Weekend: 9am - 8pm
            start_hour = random.randint(9, 18)
            start_time = time(start_hour, 0)
            end_time = time(start_hour + 2, 0)
        else:
            # Weekday: 4pm - 8pm
            start_hour = random.randint(16, 18)
            start_time = time(start_hour, 0)
            end_time = time(start_hour + 2, 0)
            
        # Capacity check
        total_at_slot = Batch.objects.filter(
            schedule_day=day,
            start_time__lt=end_time,
            end_time__gt=start_time
        ).aggregate(total=Sum('max_students'))['total'] or 0
        
        batch_capacity = random.choice([10, 20, 30]) # Reduced size for better fitting
        if total_at_slot + batch_capacity > 100:
            # Shift or skip
            print(f"Skipping {name} on {day} due to capacity ({total_at_slot + batch_capacity} > 100)")
            continue

        Batch.objects.create(
            batch_name=name,
            batch_type='RECURRING',
            status='ACTIVE',
            schedule_day=day,
            start_time=start_time,
            end_time=end_time,
            max_students=batch_capacity
        )
        print(f"Created {name} on {day}")

    # Generate 5 One-time Finished Batches
    one_time_names = [
        'Tournament Prep Workshop',
        'Advanced Strategy Seminar',
        'Endgame Mastery Class',
        'Opening Principles Workshop',
        'Psychology of Chess'
    ]
    
    today = date.today()
    for name in one_time_names:
        past_date = today - timedelta(days=random.randint(1, 10))
        Batch.objects.create(
            batch_name=name,
            batch_type='ONE_TIME',
            status='FINISHED',
            exact_date=past_date,
            start_time=time(10, 0),
            end_time=time(12, 0),
            max_students=30
        )
        print(f"Created Finished Batch: {name} on {past_date}")

    print("Successfully generated all batches.")

if __name__ == "__main__":
    generate_batches()
