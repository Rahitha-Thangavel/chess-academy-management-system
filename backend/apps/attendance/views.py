from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import Attendance, CoachAttendance
from .serializers import AttendanceSerializer, CoachAttendanceSerializer
from apps.students.models import Student
from rest_framework.exceptions import PermissionDenied

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
        # [R9] Only Admin/Clerk should digitally record attendance for students.
        if self.request.user.role not in ['ADMIN', 'CLERK']:
            raise PermissionDenied('Unauthorized.')

        instance = serializer.save()
        # [R11] Alert if 3 consecutive absences
        if instance.status == 'ABSENT':
            self._check_consecutive_absences(instance.student)

    def perform_update(self, serializer):
        # Only Admin/Clerk can edit recorded student attendance.
        if self.request.user.role not in ['ADMIN', 'CLERK']:
            raise PermissionDenied('Unauthorized.')
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.role not in ['ADMIN', 'CLERK']:
            raise PermissionDenied('Unauthorized.')
        instance.delete()

    def _check_consecutive_absences(self, student):
        last_3 = Attendance.objects.filter(student=student).order_by('-attendance_date')[:3]
        if len(last_3) == 3 and all(a.status == 'ABSENT' for a in last_3):
            # [R11] Create parent notification (avoid spamming).
            from apps.notifications.models import Notification
            from apps.notifications.utils import create_notification

            now = timezone.now()
            recent_alert = Notification.objects.filter(
                user=student.parent_user,
                notification_type='ABSENCE_ALERT',
                created_at__gte=now - timedelta(days=7),
                message__icontains=student.first_name,
            ).exists()

            if not recent_alert:
                create_notification(
                    user=student.parent_user,
                    notification_type='ABSENCE_ALERT',
                    title='Consecutive Absence Alert',
                    message=(
                        f'Student {student.first_name} {student.last_name} has been absent '
                        f'for 3 consecutive classes. Please inform the academy of the reason.'
                    ),
                    target_url='/parent/attendance',
                )

    @action(detail=False, methods=['post'])
    def bulk_record(self, request):
        """[R9] Record attendance for a whole batch."""
        # Only Admin/Clerk should record student attendance digitally.
        if request.user.role not in ['ADMIN', 'CLERK']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

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
        if user.role in ['ADMIN', 'CLERK']:
            return CoachAttendance.objects.all()
        return CoachAttendance.objects.none()

    def perform_create(self, serializer):
        # Coaches mark attendance using custom actions (clock_in/clock_out).
        # Block direct create by others.
        if self.request.user.role != 'COACH':
            raise PermissionDenied('Unauthorized.')
        serializer.save(coach=self.request.user)

    def perform_update(self, serializer):
        # Admin/Clerk can adjust timestamps (FR13).
        if self.request.user.role not in ['ADMIN', 'CLERK']:
            raise PermissionDenied('Unauthorized.')
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.role not in ['ADMIN', 'CLERK']:
            raise PermissionDenied('Unauthorized.')
        instance.delete()

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
