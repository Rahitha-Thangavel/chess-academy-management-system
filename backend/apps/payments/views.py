from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q
from django.utils import timezone
from .models import Payment, Salary
from .serializers import PaymentSerializer, SalarySerializer
from apps.students.models import Student
from apps.attendance.models import Attendance, CoachAttendance
from decimal import Decimal

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'PARENT':
            return Payment.objects.filter(student__parent_user=user)
        return Payment.objects.all()

    @action(detail=False, methods=['get'])
    def calculate_fee(self, request):
        """
        [R2] Discount if parent has 2+ children.
        [R15] Half fee if attendee has <= 4 classes in a month.
        """
        student_id = request.query_params.get('student_id')
        month = request.query_params.get('month') # 1-12
        year = request.query_params.get('year') or timezone.now().year
        
        if not student_id:
            return Response({'error': 'student_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

        base_monthly_fee = Decimal('2000.00') # Example base fee
        final_fee = base_monthly_fee

        # R15: Half fee if <= 4 classes
        if month:
            attendance_count = Attendance.objects.filter(
                student=student,
                attendance_date__month=month,
                attendance_date__year=year,
                status='PRESENT'
            ).count()
            
            if attendance_count <= 4:
                final_fee = final_fee / 2

        # R2: Discount if parent has 2+ children
        sibling_count = Student.objects.filter(parent_user=student.parent_user).count()
        if sibling_count >= 2:
            # Apply a 10% discount for siblings
            final_fee = final_fee * Decimal('0.90')

        return Response({
            'student_id': student_id,
            'base_fee': str(base_monthly_fee),
            'calculated_fee': str(final_fee.quantize(Decimal('0.01'))),
            'sibling_count': sibling_count,
            'attendance_count': attendance_count if month else 'N/A'
        })

    @action(detail=False, methods=['get'])
    def dues(self, request):
        """[R18] Track pending/overdue payments."""
        now = timezone.now()
        paid_students = Payment.objects.filter(
            payment_type='MONTHLY',
            payment_date__month=now.month,
            payment_date__year=now.year
        ).values_list('student_id', flat=True)

        unpaid_students = Student.objects.filter(status='ACTIVE').exclude(id__in=paid_students)
        
        # Format response
        data = []
        for s in unpaid_students:
            parent_name = "N/A"
            parent_phone = "N/A"
            if s.parent_user:
                parent_name = f"{s.parent_user.first_name} {s.parent_user.last_name}"
                parent_phone = s.parent_user.phone
            
            data.append({
                'id': s.id,
                'name': f"{s.first_name} {s.last_name}",
                'parent': parent_name,
                'parent_phone': parent_phone
            })
        
        return Response(data)

class SalaryViewSet(viewsets.ModelViewSet):
    queryset = Salary.objects.all()
    serializer_class = SalarySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_coach():
            return Salary.objects.filter(coach_user=user)
        return Salary.objects.all()

    @action(detail=False, methods=['post'])
    def calculate_salary(self, request):
        """[R21] Calculate salary based on attendance and hourly rates."""
        coach_id = request.data.get('coach_id')
        month = request.data.get('month')
        year = request.data.get('year') or timezone.now().year

        if not all([coach_id, month]):
            return Response({'error': 'coach_id and month are required'}, status=status.HTTP_400_BAD_REQUEST)

        # Get coach attendance records for the month
        attendance_records = CoachAttendance.objects.filter(
            coach_id=coach_id,
            date__month=month,
            date__year=year,
            clock_in_time__isnull=False,
            clock_out_time__isnull=False
        )

        total_hours = Decimal('0.00')
        for record in attendance_records:
            duration = record.clock_out_time - record.clock_in_time
            total_hours += Decimal(str(duration.total_seconds() / 3600))

        # Get coach hourly rate from profile
        try:
            from apps.users.models import UserProfile
            profile = UserProfile.objects.get(user_id=coach_id)
            hourly_rate = profile.hourly_rate or Decimal('500.00')
        except UserProfile.DoesNotExist:
            hourly_rate = Decimal('500.00')

        salary_amount = total_hours * hourly_rate

        return Response({
            'coach_id': coach_id,
            'total_hours': str(total_hours.quantize(Decimal('0.01'))),
            'hourly_rate': str(hourly_rate),
            'salary_amount': str(salary_amount.quantize(Decimal('0.01')))
        })
