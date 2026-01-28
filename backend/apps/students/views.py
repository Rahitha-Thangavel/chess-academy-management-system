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
    filterset_fields = ['status', 'grade_level', 'school', 'parent_user']
    search_fields = ['first_name', 'last_name', 'school', 'parent_user__username', 'parent_user__first_name']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'PARENT':
            return Student.objects.filter(parent_user=user)
        # Admins/Clerks see all or filtered
        status_param = self.request.query_params.get('status')
        if status_param:
            return Student.objects.filter(status=status_param)
        return Student.objects.all()

    def create(self, request, *args, **kwargs):
        print(f"DEBUG: Create request user: {request.user}, role: {getattr(request.user, 'role', 'Unknown')}")
        print(f"DEBUG: Create data: {request.data}")
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
             print(f"DEBUG: Validation Errors: {serializer.errors}")
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

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
        if request.user.role not in ['ADMIN', 'CLERK']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        student = self.get_object()
        student.status = Student.Status.ACTIVE
        student.save()
        
        # Trigger Notification
        from apps.notifications.utils import create_notification
        create_notification(
            user=student.parent_user,
            notification_type='SYSTEM',
            title='Registration Approved',
            message=f'Student registration for {student.first_name} {student.last_name} has been approved.'
        )
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        if request.user.role not in ['ADMIN', 'CLERK']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        student = self.get_object()
        student.status = Student.Status.REJECTED
        student.save()
        
        # Trigger Notification
        from apps.notifications.utils import create_notification
        create_notification(
            user=student.parent_user,
            notification_type='SYSTEM',
            title='Registration Rejected',
            message=f'Student registration for {student.first_name} {student.last_name} has been rejected.'
        )
        return Response({'status': 'rejected'})
