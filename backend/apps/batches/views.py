from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Batch, BatchEnrollment, CoachAvailability, RescheduleRequest
from .serializers import (
    BatchSerializer, BatchEnrollmentSerializer, 
    CoachAvailabilitySerializer, RescheduleRequestSerializer
)

class BatchViewSet(viewsets.ModelViewSet):
    queryset = Batch.objects.all()
    serializer_class = BatchSerializer
    permission_classes = [permissions.IsAuthenticated]

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
            
            return Response({'status': 'rejected'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
