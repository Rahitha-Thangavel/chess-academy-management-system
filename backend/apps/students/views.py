from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from .models import Student
from .serializers import StudentSerializer

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = {
        'status': ['exact'],
        'school': ['exact', 'icontains'],
        'grade_level': ['exact'],
        'parent_user': ['exact'],
    }
    search_fields = ['first_name', 'last_name', 'school', 'parent_user__username', 'parent_user__first_name', 'id']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'PARENT':
            return Student.objects.filter(parent_user=user)
        
        queryset = Student.objects.all()
        
        # Manual handle of batch filter if needed, or just let DjangoFilter handle the rest
        batch_id = self.request.query_params.get('enrollments__batch')
        if batch_id:
            queryset = queryset.filter(enrollments__batch=batch_id)
            
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        student = serializer.save()
        
        # Trigger Notifications
        try:
            from apps.notifications.utils import create_notification
            from apps.users.models import User
            
            # Notify Parent
            create_notification(
                user=student.parent_user,
                notification_type='SYSTEM',
                title='Student Registered',
                message=f'Student {student.first_name} {student.last_name} has been registered and is pending approval.',
                target_url='/parent/students'
            )
            
            # Notify Admins
            admins = User.objects.filter(role='ADMIN')
            for admin in admins:
                create_notification(
                    user=admin,
                    notification_type='ADMIN_ALERT',
                    title='Pending Student Approval',
                    message=f'A new student registration for {student.first_name} {student.last_name} needs approval.',
                    target_url='/admin/students'
                )
        except Exception as e:
            print(f"Error triggering notifications: {e}")

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_update(self, serializer):
        if self.request.user.role not in ['ADMIN', 'CLERK']:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only Admin/Clerk can edit student records.')
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.role not in ['ADMIN', 'CLERK']:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only Admin/Clerk can delete student records.')
        instance.delete()

    @action(detail=False, methods=['get'])
    def pending(self, request):
        if request.user.role not in ['ADMIN', 'CLERK']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        pending_students = Student.objects.filter(status=Student.Status.PENDING)
        serializer = self.get_serializer(pending_students, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_children(self, request):
        print(f"DEBUG: User: {request.user}, Role: {request.user.role}, Auth: {request.auth}")
        if request.user.role != 'PARENT':
             return Response({'error': f'Not a parent. User role is {request.user.role}'}, status=status.HTTP_403_FORBIDDEN)
        children = Student.objects.filter(parent_user=request.user)
        serializer = self.get_serializer(children, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        if request.user.role != 'ADMIN':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        student = self.get_object()
        student.status = Student.Status.ACTIVE
        student.save()
        
        # Trigger Notification
        from apps.notifications.utils import create_notification, mark_stale_notifications
        mark_stale_notifications('/admin/students')
        create_notification(
            user=student.parent_user,
            notification_type='SYSTEM',
            title='Registration Approved',
            message=f'Student registration for {student.first_name} {student.last_name} has been approved.',
            target_url='/parent/students'
        )
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        if request.user.role != 'ADMIN':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        student = self.get_object()
        student.status = Student.Status.REJECTED
        student.save()
        
        # Trigger Notification
        from apps.notifications.utils import create_notification, mark_stale_notifications
        mark_stale_notifications('/admin/students')
        create_notification(
            user=student.parent_user,
            notification_type='SYSTEM',
            title='Registration Rejected',
            message=f'Student registration for {student.first_name} {student.last_name} has been rejected.',
            target_url='/parent/students'
        )
        return Response({'status': 'rejected'})
