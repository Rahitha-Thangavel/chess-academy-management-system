"""Backend module: backend/scripts/test_batch_capacity.py.

Helpers, utilities, or logic for the chess academy management system."""

from apps.batches.models import Batch
from apps.batches.serializers import BatchSerializer
from rest_framework import serializers
import datetime

def test_capacity():
    # Setup
    Batch.objects.all().delete()
    
    # 1. Create first batch: MON 10:00 - 12:00, Capacity 60
    data1 = {
        'batch_name': 'Batch 1',
        'schedule_day': 'MON',
        'start_time': '10:00:00',
        'end_time': '12:00:00',
        'max_students': 60
    }
    ser1 = BatchSerializer(data=data1)
    if ser1.is_valid():
        ser1.save()
        print("Success: Created Batch 1 (60)")
    else:
        print("Fail: Could not create Batch 1", ser1.errors)

    # 2. Create second batch overlapping: MON 11:00 - 13:00, Capacity 40 (Total 100 at 11:00-12:00)
    data2 = {
        'batch_name': 'Batch 2',
        'schedule_day': 'MON',
        'start_time': '11:00:00',
        'end_time': '13:00:00',
        'max_students': 40
    }
    ser2 = BatchSerializer(data=data2)
    if ser2.is_valid():
        ser2.save()
        print("Success: Created Batch 2 (40)")
    else:
        print("Fail: Could not create Batch 2", ser2.errors)

    # 3. Create third batch overlapping: MON 11:30 - 12:30, Capacity 10 (Total 110 at 11:30-12:00)
    data3 = {
        'batch_name': 'Batch 3',
        'schedule_day': 'MON',
        'start_time': '11:30:00',
        'end_time': '12:30:00',
        'max_students': 10
    }
    ser3 = BatchSerializer(data=data3)
    if ser3.is_valid():
        ser3.save()
        print("Fail: Created Batch 3 but expected failure!")
    else:
        print("Success: Prevented Batch 3 (Total 110)", ser3.errors)

    # 4. Create non-overlapping batch: MON 14:00 - 16:00, Capacity 50 (Total 50)
    data4 = {
        'batch_name': 'Batch 4',
        'schedule_day': 'MON',
        'start_time': '14:00:00',
        'end_time': '16:00:00',
        'max_students': 50
    }
    ser4 = BatchSerializer(data=data4)
    if ser4.is_valid():
        ser4.save()
        print("Success: Created non-overlapping Batch 4 (50)")
    else:
        print("Fail: Could not create Batch 4", ser4.errors)

if __name__ == "__main__":
    test_capacity()
