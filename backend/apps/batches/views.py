from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Batch, BatchEnrollment, CoachAvailability, RescheduleRequest, CoachBatchApplication
from .serializers import (
    BatchSerializer, BatchEnrollmentSerializer, 
    CoachAvailabilitySerializer, RescheduleRequestSerializer,
    CoachBatchApplicationSerializer
)

class BatchViewSet(viewsets.ModelViewSet):
    serializer_class = BatchSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role == 'COACH':
            return Batch.objects.filter(coach_user=user)
        return Batch.objects.all()

    @action(detail=False, methods=['get'])
    def unassigned(self, request):
        """List batches with no coach assigned (for coach applications)."""
        batches = Batch.objects.filter(coach_user__isnull=True)
        serializer = self.get_serializer(batches, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def available_for_registration(self, request):
        """[R13] List batches with availability for students/parents."""
        # Simple Logic: exclude full batches.
        # Optimized: annotate student count.
        from django.db.models import Count, F
        # Filter batches that are NOT full.
        # We need to assume max_students is a field.
        batches = Batch.objects.annotate(student_count=Count('enrollments')).filter(student_count__lt=F('max_students'))
        
        serializer = self.get_serializer(batches, many=True)
        return Response(serializer.data)

class CoachBatchApplicationViewSet(viewsets.ModelViewSet):
    queryset = CoachBatchApplication.objects.all()
    serializer_class = CoachBatchApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'COACH':
            return CoachBatchApplication.objects.filter(coach=user)
        # Admin/Clerk sees all
        return CoachBatchApplication.objects.all()

    def perform_create(self, serializer):
        # Auto-set coach to current user if not provided (and if user is coach)
        if self.request.user.role == 'COACH':
            serializer.save(coach=self.request.user)
        else:
            serializer.save()

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        import datetime
        if request.user.role not in ['ADMIN']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            
        app = self.get_object()
        app.status = 'APPROVED'
        app.admin_notes = request.data.get('admin_notes', '')
        app.decision_date = datetime.date.today()
        app.save()
        
        # Assign coach to batch
        batch = app.batch
        batch.coach_user = app.coach
        batch.save()
        
        # Trigger Notification
        from apps.notifications.utils import create_notification
        create_notification(
            user=app.coach,
            notification_type='COACH_ALERT',
            title='Application Approved',
            message=f'Your application for batch {batch.batch_name} has been approved.'
        )
        
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        import datetime
        if request.user.role not in ['ADMIN']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            
        app = self.get_object()
        app.status = 'REJECTED'
        app.admin_notes = request.data.get('admin_notes', '')
        app.decision_date = datetime.date.today()
        app.save()
        
        # Trigger Notification
        from apps.notifications.utils import create_notification
        create_notification(
            user=app.coach,
            notification_type='COACH_ALERT',
            title='Application Rejected',
            message=f'Your application for batch {app.batch.batch_name} has been rejected.'
        )
        
        return Response({'status': 'rejected'})

    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        batch = self.get_object()
        student_id = request.data.get('student_id')
        enrollment_date = request.data.get('enrollment_date')
        
        enrollment, created = BatchEnrollment.objects.get_or_create(
            batch=batch,
            student_id=student_id,
            defaults={'enrollment_date': enrollment_date}
        )
        return Response(BatchEnrollmentSerializer(enrollment).data)

class CoachAvailabilityViewSet(viewsets.ModelViewSet):
    queryset = CoachAvailability.objects.all()
    serializer_class = CoachAvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'COACH':
            return CoachAvailability.objects.filter(coach=user)
        return CoachAvailability.objects.all()

    def perform_create(self, serializer):
        serializer.save(coach=self.request.user)

class RescheduleRequestViewSet(viewsets.ModelViewSet):
    queryset = RescheduleRequest.objects.all()
    serializer_class = RescheduleRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'PARENT':
            return RescheduleRequest.objects.filter(student__parent_user=user)
        return RescheduleRequest.objects.all()

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """[R14] Approve request and update schedule (enrollment)."""
        print(f"Approving request {pk} by user {request.user.email} (Role: {request.user.role})")
        if request.user.role not in ['ADMIN', 'CLERK']:
             print(f"Approval failed: Unauthorized role {request.user.role}")
             return Response({'error': f'Unauthorized. Your role is: {request.user.role}'}, status=status.HTTP_403_FORBIDDEN)
             
        try:
            reschedule = self.get_object()
            admin_comment = request.data.get('admin_comment', '')
            
            reschedule.status = 'APPROVED'
            reschedule.admin_comment = admin_comment
            reschedule.save()
            print(f"Request {pk} status set to APPROVED")
            
            # If a target batch was specified, we might want to automatically enroll them
            if reschedule.target_batch:
                BatchEnrollment.objects.update_or_create(
                    student=reschedule.student,
                    batch=reschedule.target_batch,
                    defaults={'enrollment_date': reschedule.preferred_date or reschedule.original_date}
                )
                print(f"Updated BatchEnrollment for student {reschedule.student}")
            
            # Trigger Notification
            from apps.notifications.utils import create_notification
            create_notification(
                user=reschedule.student.parent_user,
                notification_type='BATCH',
                title='Reschedule Approved',
                message=f'Reschedule request for {reschedule.student.first_name} has been approved.'
            )
            
            return Response({'status': 'approved'})
        except Exception as e:
            print(f"Approval error for request {pk}: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        print(f"Rejecting request {pk} by user {request.user.email} (Role: {request.user.role})")
        if request.user.role not in ['ADMIN', 'CLERK']:
             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
             
        try:
            reschedule = self.get_object()
            admin_comment = request.data.get('admin_comment', '')
            
            reschedule.status = 'REJECTED'
            reschedule.admin_comment = admin_comment
            reschedule.save()
            
            # Trigger Notification
            from apps.notifications.utils import create_notification
            create_notification(
                user=reschedule.student.parent_user,
                notification_type='BATCH',
                title='Reschedule Rejected',
                message=f'Reschedule request for {reschedule.student.first_name} has been rejected.'
            )
            
            return Response({'status': 'rejected'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class BatchEnrollmentViewSet(viewsets.ModelViewSet):
    queryset = BatchEnrollment.objects.all()
    serializer_class = BatchEnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['batch', 'student']

    def create(self, request, *args, **kwargs):
        student_id = request.data.get('student')
        batch_id = request.data.get('batch')
        
        # Validation checks
        if request.user.role == 'PARENT':
            # 1. Check if student belongs to parent
            try:
                from apps.students.models import Student
                student = Student.objects.get(id=student_id, parent_user=request.user)
            except Student.DoesNotExist:
                return Response({'error': 'Student not found or does not belong to you.'}, status=status.HTTP_403_FORBIDDEN)
        elif request.user.role not in ['ADMIN', 'CLERK']:
             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
             
        # 2. Check max enrollments
        enrollment_count = BatchEnrollment.objects.filter(student_id=student_id).count()
        if enrollment_count >= 2:
            return Response({'error': 'Student is already enrolled in maximum 2 batches.'}, status=status.HTTP_400_BAD_REQUEST)

        # 3. Check batch capacity
        try:
            batch = Batch.objects.get(id=batch_id)
            current_students = BatchEnrollment.objects.filter(batch_id=batch_id).count()
            if current_students >= batch.max_students:
                 return Response({'error': 'Batch is full.'}, status=status.HTTP_400_BAD_REQUEST)
        except Batch.DoesNotExist:
            return Response({'error': 'Batch not found.'}, status=status.HTTP_404_NOT_FOUND)

        return super().create(request, *args, **kwargs)
        
    def get_queryset(self):
        user = self.request.user
        if user.role == 'PARENT':
            return BatchEnrollment.objects.filter(student__parent_user=user)
        return BatchEnrollment.objects.all()
