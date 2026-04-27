"""Backend module: backend/scripts/fix_batch_capacity.py.

Helpers, utilities, or logic for the chess academy management system."""

import os
import django
from datetime import time, timedelta
from django.db.models import Sum, Q

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.batches.models import Batch

def fix_capacity():
    print("Auditing batch capacities...")
    days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
    limit = 100

    for day in days:
        batches = list(Batch.objects.filter(schedule_day=day, status='ACTIVE').order_by('start_time'))
        if not batches: continue

        print(f"Checking {day}...")
        
        # Get all unique time points
        time_points = set()
        for b in batches:
            time_points.add(b.start_time)
            time_points.add(b.end_time)
        
        sorted_points = sorted(list(time_points))
        
        for i in range(len(sorted_points) - 1):
            t_start = sorted_points[i]
            t_end = sorted_points[i+1]
            
            # Find batches active during this interval
            active_batches = [b for b in batches if b.start_time <= t_start and b.end_time >= t_end]
            
            total_cap = sum(b.max_students for b in active_batches)
            
            if total_cap > limit:
                print(f"  Conflict at {t_start}-{t_end}: {total_cap} > {limit}")
                # Reduction factor
                factor = limit / total_cap
                for b in active_batches:
                    new_max = int(b.max_students * factor)
                    print(f"    Reducing {b.batch_name} from {b.max_students} to {new_max}")
                    b.max_students = new_max
                    b.save()
                
    print("Capacity audit and fix complete.")

if __name__ == "__main__":
    fix_capacity()
