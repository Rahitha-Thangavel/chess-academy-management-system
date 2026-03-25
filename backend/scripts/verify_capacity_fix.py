from apps.batches.models import Batch
from apps.batches.serializers import BatchSerializer
from django.db.models import Sum

def final_verify():
    print("Verifying Capacity Enforcement...")
    
    # 1. Audit current Friday 18:00 - 20:00
    friday_batches = Batch.objects.filter(schedule_day='FRI', start_time__lte='18:00:00', end_time__gte='20:00:00')
    total = friday_batches.aggregate(s=Sum('max_students'))['s'] or 0
    print(f"Friday 18:00-20:00 Total Capacity: {total}")
    
    if total > 100:
        print("FAIL: Still over 100!")
    else:
        print("SUCCESS: Data is now within limits.")

    # 2. Test Serializer Enforcement
    # Try to push BATCH-007 capacity to 100 (which should fail because of others)
    b7 = Batch.objects.get(id='BATCH-007')
    data = {'max_students': 100}
    ser = BatchSerializer(instance=b7, data=data, partial=True)
    if ser.is_valid():
        print("FAIL: Serializer allowed 100 students (should have failed)!")
    else:
        print("SUCCESS: Serializer blocked over-capacity update:", ser.errors)

if __name__ == "__main__":
    final_verify()
