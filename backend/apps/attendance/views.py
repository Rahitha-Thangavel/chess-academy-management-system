from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Attendance, CoachAttendance
from .serializers import AttendanceSerializer, CoachAttendanceSerializer
from apps.students.models import Student

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['batch', 'student', 'attendance_date', 'status']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'PARENT':
            return Attendance.objects.filter(student__parent_user=user)
        if user.role == 'COACH':
            return Attendance.objects.filter(batch__coach_user=user)
        return Attendance.objects.all()

    def perform_create(self, serializer):
        instance = serializer.save()
        # [R11] Alert if 3 consecutive absences
        if instance.status == 'ABSENT':
            self._check_consecutive_absences(instance.student)

    def _check_consecutive_absences(self, student):
        last_3 = Attendance.objects.filter(student=student).order_by('-attendance_date')[:3]
        if len(last_3) == 3 and all(a.status == 'ABSENT' for a in last_3):
            # In a real app, send Email/SMS. For now, we log it.
            print(f"ALERT: Student {student.get_full_name()} has 3 consecutive absences!")
            # Logic to notify parent can be added here (e.g. creating a Notification model)

    @action(detail=False, methods=['post'])
    def bulk_record(self, request):
        """[R9] Record attendance for a whole batch."""
        batch_id = request.data.get('batch_id')
        date = request.data.get('date', timezone.now().date())
        attendance_data = request.data.get('attendance', []) # List of {student_id: status}

        if not batch_id:
            return Response({'error': 'batch_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        created_records = []
        for item in attendance_data:
            student_id = item.get('student_id')
            status_val = item.get('status')
            
            record, created = Attendance.objects.update_or_create(
                student_id=student_id,
                batch_id=batch_id,
                attendance_date=date,
                defaults={'status': status_val}
            )
            created_records.append(record)
            if status_val == 'ABSENT':
                self._check_consecutive_absences(record.student)

        return Response({'status': 'recorded', 'count': len(created_records)})

class CoachAttendanceViewSet(viewsets.ModelViewSet):
    queryset = CoachAttendance.objects.all()
    serializer_class = CoachAttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'COACH':
            return CoachAttendance.objects.filter(coach=user)
        return CoachAttendance.objects.all()

    @action(detail=False, methods=['post'])
    def clock_in(self, request):
        """[R12] Auto timestamping clock-in."""
        batch_id = request.data.get('batch_id')
        if not batch_id:
            return Response({'error': 'batch_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        record, created = CoachAttendance.objects.get_or_create(
            coach=request.user,
            batch_id=batch_id,
            date=timezone.now().date(),
            defaults={'clock_in_time': timezone.now()}
        )
        
        if not created and not record.clock_in_time:
            record.clock_in_time = timezone.now()
            record.save()

        return Response(CoachAttendanceSerializer(record).data)

    @action(detail=False, methods=['post'])
    def clock_out(self, request):
        """[R12] Auto timestamping clock-out."""
        batch_id = request.data.get('batch_id')
        if not batch_id:
            return Response({'error': 'batch_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            record = CoachAttendance.objects.get(
                coach=request.user,
                batch_id=batch_id,
                date=timezone.now().date()
            )
            record.clock_out_time = timezone.now()
            record.save()
            return Response(CoachAttendanceSerializer(record).data)
        except CoachAttendance.DoesNotExist:
            return Response({'error': 'No clock-in record found for today'}, status=status.HTTP_404_NOT_FOUND)
