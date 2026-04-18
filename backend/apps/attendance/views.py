from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from django.utils.dateparse import parse_date
from .models import Attendance, CoachAttendance
from .serializers import AttendanceSerializer, CoachAttendanceSerializer
from .utils import academy_now, get_batch_attendance_window
from apps.students.models import Student
from apps.batches.models import Batch
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
        date = request.data.get('date', academy_now().date())
        attendance_data = request.data.get('attendance', []) # List of {student_id: status}

        if not batch_id:
            return Response({'error': 'batch_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            batch = Batch.objects.get(id=batch_id)
        except Batch.DoesNotExist:
            return Response({'error': 'Batch not found.'}, status=status.HTTP_404_NOT_FOUND)

        if isinstance(date, str):
            parsed_date = parse_date(date)
            if not parsed_date:
                return Response({'error': 'Invalid date provided.'}, status=status.HTTP_400_BAD_REQUEST)
            date = parsed_date

        current_dt = academy_now()
        window = get_batch_attendance_window(batch, current_dt, target_date=date)
        if not window['can_record']:
            return Response({'error': window['message'], 'window_status': window['status']}, status=status.HTTP_400_BAD_REQUEST)

        created_records = []
        for item in attendance_data:
            student_id = item.get('student_id')
            status_val = item.get('status')
            
            record, created = Attendance.objects.update_or_create(
                student_id=student_id,
                batch=batch,
                attendance_date=date,
                defaults={'status': status_val}
            )
            created_records.append(record)
            if status_val == 'ABSENT':
                self._check_consecutive_absences(record.student)

        return Response({'status': 'recorded', 'count': len(created_records)})

    @action(detail=False, methods=['get'])
    def flags(self, request):
        """[R16] Flag missing or inconsistent attendance records."""
        if request.user.role not in ['ADMIN', 'CLERK']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        from apps.batches.models import Batch, BatchEnrollment

        today = timezone.now().date()
        schedule_map = {
            0: 'MON', 1: 'TUE', 2: 'WED', 3: 'THU', 4: 'FRI', 5: 'SAT', 6: 'SUN'
        }
        today_code = schedule_map.get(today.weekday())

        missing_batches = []
        partial_batches = []
        for batch in Batch.objects.filter(status='ACTIVE', schedule_day=today_code):
            enrolled_count = BatchEnrollment.objects.filter(batch=batch).count()
            recorded_count = Attendance.objects.filter(batch=batch, attendance_date=today).count()

            if enrolled_count > 0 and recorded_count == 0:
                missing_batches.append({
                    'batch_id': batch.id,
                    'batch_name': batch.batch_name,
                    'issue': 'No attendance has been recorded for this scheduled class.',
                })
            elif 0 < recorded_count < enrolled_count:
                partial_batches.append({
                    'batch_id': batch.id,
                    'batch_name': batch.batch_name,
                    'recorded_count': recorded_count,
                    'expected_count': enrolled_count,
                    'issue': 'Attendance is partially recorded.',
                })

        inconsistent_records = []
        for record in Attendance.objects.select_related('student', 'batch').filter(attendance_date=today):
            enrolled = BatchEnrollment.objects.filter(student=record.student, batch=record.batch).exists()
            if not enrolled:
                inconsistent_records.append({
                    'attendance_id': record.id,
                    'student_name': record.student.get_full_name(),
                    'batch_name': record.batch.batch_name,
                    'issue': 'Attendance exists for a student who is not enrolled in this batch.',
                })

        coach_timestamp_issues = []
        recent_coach_records = CoachAttendance.objects.select_related('coach', 'batch').filter(
            date__gte=today - timedelta(days=30)
        )
        for record in recent_coach_records:
            if not record.clock_in_time or not record.clock_out_time:
                coach_timestamp_issues.append({
                    'coach_attendance_id': record.id,
                    'coach_name': record.coach.get_full_name(),
                    'batch_name': record.batch.batch_name,
                    'date': record.date,
                    'issue': 'Missing clock-in or clock-out timestamp.',
                })

        return Response({
            'missing_batches': missing_batches,
            'partial_batches': partial_batches,
            'inconsistent_records': inconsistent_records,
            'coach_timestamp_issues': coach_timestamp_issues,
        })

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
        if request.user.role != 'COACH':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        batch_id = request.data.get('batch_id')
        if not batch_id:
            return Response({'error': 'batch_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        today = timezone.now().date()
        active_record = CoachAttendance.objects.filter(
            coach=request.user,
            date=today,
            clock_in_time__isnull=False,
            clock_out_time__isnull=True,
        ).first()
        if active_record and str(active_record.batch_id) != str(batch_id):
            return Response(
                {'error': f'You already have an active class running for {active_record.batch.batch_name}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        record, created = CoachAttendance.objects.get_or_create(
            coach=request.user,
            batch_id=batch_id,
            date=today,
            defaults={'clock_in_time': timezone.now()}
        )

        if not created and record.clock_in_time and not record.clock_out_time:
            return Response(
                {'error': 'This class session is already running.', 'record': CoachAttendanceSerializer(record).data},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not created and record.clock_in_time and record.clock_out_time:
            return Response(
                {'error': 'This class session has already been completed for today.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not created and not record.clock_in_time:
            record.clock_in_time = timezone.now()
            record.save()

        return Response(CoachAttendanceSerializer(record).data)

    @action(detail=False, methods=['post'])
    def clock_out(self, request):
        """[R12] Auto timestamping clock-out."""
        if request.user.role != 'COACH':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        batch_id = request.data.get('batch_id')
        if not batch_id:
            return Response({'error': 'batch_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            record = CoachAttendance.objects.get(
                coach=request.user,
                batch_id=batch_id,
                date=timezone.now().date()
            )
            if not record.clock_in_time:
                return Response({'error': 'You must start the class before ending it.'}, status=status.HTTP_400_BAD_REQUEST)
            if record.clock_out_time:
                return Response({'error': 'This class session has already been ended.'}, status=status.HTTP_400_BAD_REQUEST)
            record.clock_out_time = timezone.now()
            record.save()
            return Response(CoachAttendanceSerializer(record).data)
        except CoachAttendance.DoesNotExist:
            return Response({'error': 'No clock-in record found for today'}, status=status.HTTP_404_NOT_FOUND)
