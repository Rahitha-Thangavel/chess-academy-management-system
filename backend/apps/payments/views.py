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
from rest_framework.exceptions import PermissionDenied

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'PARENT':
            return Payment.objects.filter(student__parent_user=user).select_related('student')
        return Payment.objects.all()

    def _calculate_monthly_fee(self, student: Student, month: int, year: int) -> Decimal:
        """
        [R2, R15] Server-side fee computation to keep frontend honest.
        """
        base_monthly_fee = Decimal('2000.00')
        final_fee = base_monthly_fee

        attendance_count = Attendance.objects.filter(
            student=student,
            attendance_date__month=month,
            attendance_date__year=year,
            status='PRESENT',
        ).count()

        # [R15] Half fee if <= 4 classes in a month
        if attendance_count <= 4:
            final_fee = final_fee / 2

        # [R2] Sibling discount if parent has 2+ children in academy
        sibling_count = Student.objects.filter(parent_user=student.parent_user).count()
        if sibling_count >= 2:
            final_fee = final_fee * Decimal('0.90')

        return final_fee.quantize(Decimal('0.01'))

    def perform_create(self, serializer):
        user = self.request.user

        payment_type = serializer.validated_data.get('payment_type')
        student = serializer.validated_data.get('student')

        # [R17] Admin/Clerk record payments; [R20] Parents can pay their own fees online.
        if user.role == 'PARENT':
            if payment_type != 'MONTHLY':
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied('Parents can only pay monthly fees.')
            if student.parent_user_id != user.id:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied('Student does not belong to you.')
        elif user.role not in ['ADMIN', 'CLERK']:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Unauthorized')

        payment_date = serializer.validated_data.get('payment_date') or timezone.now().date()
        month = payment_date.month
        year = payment_date.year

        # [R2, R15] Enforce computed monthly amount server-side.
        if payment_type == 'MONTHLY':
            computed_amount = self._calculate_monthly_fee(student=student, month=month, year=year)
            serializer.validated_data['amount'] = computed_amount

        payment = serializer.save()
        # Trigger Notification for Parent
        from apps.notifications.utils import create_notification
        create_notification(
            user=payment.student.parent_user,
            notification_type='PAYMENT',
            title='Payment Received',
            message=f'A payment of LKR {payment.amount} for student {payment.student.get_full_name()} has been successfully recorded.',
            target_url='/parent/payments'
        )

    def perform_update(self, serializer):
        # Only Admin/Clerk can update recorded payments.
        if self.request.user.role not in ['ADMIN', 'CLERK']:
            raise PermissionDenied('Unauthorized.')
        serializer.save()

    def perform_destroy(self, instance):
        # Only Admin/Clerk can delete recorded payments.
        if self.request.user.role not in ['ADMIN', 'CLERK']:
            raise PermissionDenied('Unauthorized.')
        instance.delete()

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
            if request.user.role == 'PARENT':
                student = Student.objects.get(id=student_id, parent_user=request.user)
            else:
                student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

        base_monthly_fee = Decimal('2000.00') # Example base fee
        final_fee = self._calculate_monthly_fee(student=student, month=month, year=year) if month else base_monthly_fee

        sibling_count = Student.objects.filter(parent_user=student.parent_user).count()
        attendance_count = Attendance.objects.filter(
            student=student,
            attendance_date__month=month,
            attendance_date__year=year,
            status='PRESENT'
        ).count() if month else None

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

        def _prev_month(y: int, m: int):
            if m == 1:
                return y - 1, 12
            return y, m - 1
        
        # Format response
        data = []
        for s in unpaid_students:
            parent_name = "N/A"
            parent_phone = "N/A"
            if s.parent_user:
                parent_name = f"{s.parent_user.first_name} {s.parent_user.last_name}"
                parent_phone = s.parent_user.phone
            
            # [R18] Also compute how many of the last 3 months are unpaid.
            y3, m3 = now.year, now.month
            y2, m2 = _prev_month(y3, m3)
            y1, m1 = _prev_month(y2, m2)
            unpaid_months = 0
            for (yy, mm) in [(y3, m3), (y2, m2), (y1, m1)]:
                has_paid = Payment.objects.filter(
                    student=s,
                    payment_type='MONTHLY',
                    payment_date__month=mm,
                    payment_date__year=yy,
                ).exists()
                if not has_paid:
                    unpaid_months += 1

            data.append({
                'id': s.id,
                'name': f"{s.first_name} {s.last_name}",
                'parent': parent_name,
                'parent_phone': parent_phone,
                'unpaid_months': unpaid_months,
                'is_overdue': unpaid_months >= 3,
            })
        
        return Response(data)

class SalaryViewSet(viewsets.ModelViewSet):
    queryset = Salary.objects.all()
    serializer_class = SalarySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'COACH':
            return Salary.objects.filter(coach_user=user)
        return Salary.objects.all()

    def perform_update(self, serializer):
        if self.request.user.role not in ['ADMIN', 'CLERK']:
            raise PermissionDenied('Only Admin/Clerk can update salary status.')
        old_status = self.get_object().status
        salary = serializer.save()
        
        # Notify Coach if status changed to PAID
        if old_status != 'PAID' and salary.status == 'PAID':
            from apps.notifications.utils import create_notification
            create_notification(
                user=salary.coach_user,
                notification_type='PAYMENT',
                title='Salary Paid',
                message=f'Your salary for the period {salary.payment_period} has been paid.',
                target_url='/coach/salary'
            )

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

        # [R21] Also persist an estimated salary record (idempotent per period).
        import calendar
        month_name = calendar.month_name[int(month)] if int(month) in range(1, 13) else str(month)
        payment_period = f"{month_name} {year}"

        salary_obj, created = Salary.objects.get_or_create(
            coach_user_id=coach_id,
            payment_period=payment_period,
            defaults={
                'total_hours': total_hours,
                'hourly_rate': hourly_rate,
                'gross_amount': salary_amount,
                'deductions': Decimal('0.00'),
                'net_amount': salary_amount,
                'status': 'PENDING',
            },
        )

        # Keep record updated with latest computed hours/rate.
        salary_obj.total_hours = total_hours
        salary_obj.hourly_rate = hourly_rate
        salary_obj.gross_amount = salary_amount
        salary_obj.net_amount = salary_amount
        if created:
            salary_obj.status = 'PENDING'
        salary_obj.save()

        return Response({
            'coach_id': coach_id,
            'total_hours': str(total_hours.quantize(Decimal('0.01'))),
            'hourly_rate': str(hourly_rate),
            'salary_amount': str(salary_amount.quantize(Decimal('0.01'))),
            'salary_id': salary_obj.id,
            'payment_period': payment_period,
        })
