"""Payments app views.

API views/endpoints for the payments app."""

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q
from django.utils import timezone
from datetime import date
from .models import Payment, Salary, Expense
from .serializers import PaymentSerializer, SalarySerializer, ExpenseSerializer
from apps.students.models import Student
from apps.attendance.models import Attendance, CoachAttendance
from apps.tournaments.models import TournamentRegistration
from decimal import Decimal
from rest_framework.exceptions import PermissionDenied
import calendar
from apps.batches.models import BatchEnrollment, Batch


def build_payment_period(month: int, year: int) -> str:
    month_name = calendar.month_name[int(month)] if int(month) in range(1, 13) else str(month)
    return f"{month_name} {year}"


def parse_month_year(month_value, year_value):
    today = timezone.now().date()
    try:
        month = int(month_value or today.month)
    except (TypeError, ValueError):
        month = today.month

    try:
        year = int(year_value or today.year)
    except (TypeError, ValueError):
        year = today.year

    if month not in range(1, 13):
        month = today.month

    return month, year

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
        fee_data = self._build_monthly_fee_breakdown(student=student, month=int(month), year=int(year))
        return fee_data['calculated_fee']

    def _is_month_closed(self, month: int, year: int) -> bool:
        today = timezone.localdate()
        if year < today.year:
            return True
        if year == today.year and month < today.month:
            return True
        return False

    def _count_weekday_occurrences(self, month: int, year: int, weekday_index: int) -> int:
        _, last_day = calendar.monthrange(year, month)
        total = 0
        for day in range(1, last_day + 1):
            if date(year, month, day).weekday() == weekday_index:
                total += 1
        return total

    def _count_scheduled_classes(self, student: Student, month: int, year: int) -> int:
        weekday_map = {
            Batch.DayOfWeek.MON: 0,
            Batch.DayOfWeek.TUE: 1,
            Batch.DayOfWeek.WED: 2,
            Batch.DayOfWeek.THU: 3,
            Batch.DayOfWeek.FRI: 4,
            Batch.DayOfWeek.SAT: 5,
            Batch.DayOfWeek.SUN: 6,
        }

        enrollments = BatchEnrollment.objects.filter(student=student).select_related('batch')
        total_classes = 0
        for enrollment in enrollments:
            batch = enrollment.batch
            if batch.batch_type == Batch.BatchType.ONE_TIME:
                if batch.exact_date and batch.exact_date.month == month and batch.exact_date.year == year:
                    total_classes += 1
                continue

            weekday_index = weekday_map.get(batch.schedule_day)
            if weekday_index is None:
                continue
            total_classes += self._count_weekday_occurrences(month, year, weekday_index)

        return total_classes

    def _build_monthly_fee_breakdown(self, student: Student, month: int, year: int):
        base_monthly_fee = Decimal('2000.00')
        attendance_adjusted_fee = base_monthly_fee
        per_day_fee_rate = Decimal('350.00')

        attendance_count = Attendance.objects.filter(
            student=student,
            attendance_date__month=month,
            attendance_date__year=year,
            status='PRESENT',
        ).count()
        scheduled_class_count = self._count_scheduled_classes(student, month, year)
        month_closed = self._is_month_closed(month, year)
        threshold_classes = scheduled_class_count / 2 if scheduled_class_count else 0
        fee_mode = 'FULL_MONTH'

        if not month_closed:
            attendance_adjusted_fee = base_monthly_fee
            fee_mode = 'IN_PROGRESS'
        else:
            if 0 < attendance_count <= 2:
                attendance_adjusted_fee = (per_day_fee_rate * attendance_count).quantize(Decimal('0.01'))
                fee_mode = 'PER_DAY'
            elif scheduled_class_count and attendance_count <= threshold_classes:
                attendance_adjusted_fee = (attendance_adjusted_fee / 2).quantize(Decimal('0.01'))
                fee_mode = 'HALF_MONTH'
            elif attendance_count == 0:
                attendance_adjusted_fee = Decimal('0.00')
                fee_mode = 'NO_ATTENDANCE'

        active_siblings = list(Student.objects.filter(
            parent_user=student.parent_user,
            status=Student.Status.ACTIVE,
        ).order_by('enrollment_date', 'id'))
        sibling_count = len(active_siblings)
        sibling_position = next(
            (index + 1 for index, sibling in enumerate(active_siblings) if sibling.id == student.id),
            1,
        )

        sibling_discount_rate = Decimal('0.25') if sibling_position >= 2 else Decimal('0.00')
        sibling_discount_amount = (attendance_adjusted_fee * sibling_discount_rate).quantize(Decimal('0.01'))
        final_fee = (attendance_adjusted_fee - sibling_discount_amount).quantize(Decimal('0.01'))

        return {
            'base_fee': base_monthly_fee.quantize(Decimal('0.01')),
            'attendance_adjusted_fee': attendance_adjusted_fee.quantize(Decimal('0.01')),
            'attendance_discount_amount': (base_monthly_fee - attendance_adjusted_fee).quantize(Decimal('0.01')),
            'attendance_count': attendance_count,
            'scheduled_class_count': scheduled_class_count,
            'threshold_classes': threshold_classes,
            'month_closed': month_closed,
            'fee_mode': fee_mode,
            'per_day_fee_rate': per_day_fee_rate.quantize(Decimal('0.01')),
            'sibling_count': sibling_count,
            'sibling_position': sibling_position,
            'sibling_discount_rate': sibling_discount_rate,
            'sibling_discount_amount': sibling_discount_amount,
            'calculated_fee': final_fee,
        }

    def _build_family_summary(self, parent_user, month: int, year: int):
        active_children = list(Student.objects.filter(
            parent_user=parent_user,
            status=Student.Status.ACTIVE,
        ).order_by('enrollment_date', 'id'))

        monthly_items = []
        monthly_total = Decimal('0.00')
        current_monthly_paid_student_ids = set(
            Payment.objects.filter(
                student__parent_user=parent_user,
                payment_type='MONTHLY',
                payment_date__month=month,
                payment_date__year=year,
            ).values_list('student_id', flat=True)
        )

        for child in active_children:
            fee_data = self._build_monthly_fee_breakdown(child, month, year)
            fee_data.update({
                'student_id': child.id,
                'student_name': child.get_full_name(),
                'is_paid': child.id in current_monthly_paid_student_ids,
                'type': 'MONTHLY',
                'label': f'{child.get_full_name()} monthly fee',
            })
            if not fee_data['is_paid']:
                monthly_total += fee_data['calculated_fee']
            monthly_items.append(fee_data)

        tournament_items = []
        tournament_total = Decimal('0.00')
        pending_regs = TournamentRegistration.objects.filter(
            student__parent_user=parent_user,
            status='APPROVED',
            payment_status='PENDING',
        ).select_related('student', 'tournament').order_by('tournament__tournament_date', 'student__first_name')
        for registration in pending_regs:
            amount = Decimal(registration.tournament.entry_fee).quantize(Decimal('0.01'))
            tournament_total += amount
            tournament_items.append({
                'registration_id': registration.id,
                'student_id': registration.student_id,
                'student_name': registration.student.get_full_name(),
                'tournament_name': registration.tournament.tournament_name,
                'tournament_date': registration.tournament.tournament_date,
                'amount': amount,
                'type': 'TOURNAMENT',
                'label': f'{registration.tournament.tournament_name} tournament fee',
            })

        return {
            'month': month,
            'year': year,
            'monthly_items': monthly_items,
            'monthly_total_due': monthly_total.quantize(Decimal('0.01')),
            'tournament_items': tournament_items,
            'tournament_total_due': tournament_total.quantize(Decimal('0.01')),
            'grand_total_due': (monthly_total + tournament_total).quantize(Decimal('0.01')),
        }

    def perform_create(self, serializer):
        user = self.request.user

        payment_type = serializer.validated_data.get('payment_type')
        student = serializer.validated_data.get('student')
        registration_id = serializer.validated_data.pop('registration_id', None)

        # [R17] Admin/Clerk record payments; [R20] Parents can pay their own fees online.
        if user.role == 'PARENT':
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
            already_paid = Payment.objects.filter(
                student=student,
                payment_type='MONTHLY',
                payment_date__month=month,
                payment_date__year=year,
            ).exists()
            if already_paid:
                raise PermissionDenied(f'Monthly fee for {build_payment_period(month, year)} has already been paid.')
            computed_amount = self._calculate_monthly_fee(student=student, month=month, year=year)
            serializer.validated_data['amount'] = computed_amount
        elif payment_type == 'TOURNAMENT':
            if not registration_id:
                raise PermissionDenied('Tournament registration reference is required.')
            registration = TournamentRegistration.objects.select_related('student', 'tournament').filter(
                id=registration_id,
                student=student,
            ).first()
            if not registration:
                raise PermissionDenied('Tournament registration not found.')
            if user.role == 'PARENT' and registration.student.parent_user_id != user.id:
                raise PermissionDenied('Tournament registration does not belong to you.')
            serializer.validated_data['amount'] = registration.tournament.entry_fee
        else:
            raise PermissionDenied('Unsupported payment type.')

        payment = serializer.save()
        if payment_type == 'TOURNAMENT':
            registration.payment_status = 'PAID'
            registration.fee_paid = payment.amount
            registration.save(update_fields=['payment_status', 'fee_paid'])
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
    def finance_summary(self, request):
        if request.user.role not in ['ADMIN', 'CLERK']:
            raise PermissionDenied('Unauthorized.')

        month, year = parse_month_year(
            request.query_params.get('month'),
            request.query_params.get('year'),
        )
        payment_period = build_payment_period(month, year)

        monthly_payments = Payment.objects.filter(
            payment_date__month=month,
            payment_date__year=year,
        )
        student_fee_income = sum(
            Decimal(str(payment.amount))
            for payment in monthly_payments.filter(payment_type='MONTHLY')
        )
        tournament_fee_income = sum(
            Decimal(str(payment.amount))
            for payment in monthly_payments.filter(payment_type='TOURNAMENT')
        )
        total_income = student_fee_income + tournament_fee_income

        salary_records = Salary.objects.filter(payment_period=payment_period)
        coach_salary_expense = sum(Decimal(str(salary.net_amount)) for salary in salary_records)
        coach_salaries_paid = sum(
            Decimal(str(salary.net_amount))
            for salary in salary_records.filter(status='PAID')
        )

        monthly_expenses = Expense.objects.filter(
            expense_date__month=month,
            expense_date__year=year,
        )
        expense_breakdown = {}
        total_other_expenses = Decimal('0.00')
        for expense in monthly_expenses:
            category_key = expense.category
            expense_breakdown.setdefault(category_key, Decimal('0.00'))
            expense_breakdown[category_key] += Decimal(str(expense.amount))
            total_other_expenses += Decimal(str(expense.amount))

        net_income = total_income - coach_salary_expense - total_other_expenses

        return Response({
            'month': month,
            'year': year,
            'payment_period': payment_period,
            'student_fee_income': str(student_fee_income.quantize(Decimal('0.01'))),
            'tournament_fee_income': str(tournament_fee_income.quantize(Decimal('0.01'))),
            'total_income': str(total_income.quantize(Decimal('0.01'))),
            'coach_salary_expense': str(coach_salary_expense.quantize(Decimal('0.01'))),
            'coach_salaries_paid': str(coach_salaries_paid.quantize(Decimal('0.01'))),
            'other_expenses_total': str(total_other_expenses.quantize(Decimal('0.01'))),
            'expense_breakdown': {
                key: str(value.quantize(Decimal('0.01')))
                for key, value in expense_breakdown.items()
            },
            'net_income': str(net_income.quantize(Decimal('0.01'))),
        })

    @action(detail=False, methods=['get'])
    def calculate_fee(self, request):
        """
        [R2] Discount if parent has 2+ children.
        [R15] Half fee if attendee has <= 4 classes in a month.
        """
        student_id = request.query_params.get('student_id')
        month, year = parse_month_year(
            request.query_params.get('month'),
            request.query_params.get('year'),
        )
        
        if not student_id:
            return Response({'error': 'student_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if request.user.role == 'PARENT':
                student = Student.objects.get(
                    id=student_id,
                    parent_user=request.user,
                    status=Student.Status.ACTIVE,
                )
            else:
                student = Student.objects.get(id=student_id, status=Student.Status.ACTIVE)
        except Student.DoesNotExist:
            return Response({'error': 'Active student not found'}, status=status.HTTP_404_NOT_FOUND)

        fee_breakdown = self._build_monthly_fee_breakdown(student, month, year)
        base_monthly_fee = Decimal('2000.00')
        final_fee = fee_breakdown['calculated_fee'] if fee_breakdown else base_monthly_fee

        return Response({
            'student_id': student_id,
            'student_name': student.get_full_name(),
            'base_fee': str(base_monthly_fee),
            'calculated_fee': str(final_fee.quantize(Decimal('0.01'))),
            'final_fee': str(final_fee.quantize(Decimal('0.01'))),
            'sibling_count': fee_breakdown['sibling_count'] if fee_breakdown else 1,
            'attendance_count': fee_breakdown['attendance_count'] if fee_breakdown else 'N/A',
            'scheduled_class_count': fee_breakdown['scheduled_class_count'] if fee_breakdown else 0,
            'threshold_classes': fee_breakdown['threshold_classes'] if fee_breakdown else 0,
            'month_closed': fee_breakdown['month_closed'] if fee_breakdown else False,
            'fee_mode': fee_breakdown['fee_mode'] if fee_breakdown else 'FULL_MONTH',
            'per_day_fee_rate': str(fee_breakdown['per_day_fee_rate']) if fee_breakdown else '350.00',
            'attendance_adjusted_fee': str(fee_breakdown['attendance_adjusted_fee']) if fee_breakdown else str(base_monthly_fee),
            'attendance_discount_amount': str(fee_breakdown['attendance_discount_amount']) if fee_breakdown else '0.00',
            'sibling_discount_rate': str(fee_breakdown['sibling_discount_rate']) if fee_breakdown else '0.00',
            'sibling_discount_label': '25% on each additional child after the first' if fee_breakdown and fee_breakdown['sibling_position'] >= 2 else 'No sibling discount',
            'sibling_discount_amount': str(fee_breakdown['sibling_discount_amount']) if fee_breakdown else '0.00',
            'sibling_position': fee_breakdown['sibling_position'] if fee_breakdown else 1,
        })

    @action(detail=False, methods=['get'])
    def family_summary(self, request):
        if request.user.role != 'PARENT':
            raise PermissionDenied('Only parents can view family payment summaries.')

        today = timezone.now().date()
        month = int(request.query_params.get('month', today.month))
        year = int(request.query_params.get('year', today.year))
        summary = self._build_family_summary(request.user, month, year)

        summary['monthly_items'] = [{
            **item,
            'base_fee': str(item['base_fee']),
            'attendance_adjusted_fee': str(item['attendance_adjusted_fee']),
            'attendance_discount_amount': str(item['attendance_discount_amount']),
            'sibling_discount_rate': str(item['sibling_discount_rate']),
            'sibling_discount_amount': str(item['sibling_discount_amount']),
            'calculated_fee': str(item['calculated_fee']),
        } for item in summary['monthly_items']]
        summary['tournament_items'] = [{
            **item,
            'amount': str(item['amount']),
        } for item in summary['tournament_items']]
        summary['monthly_total_due'] = str(summary['monthly_total_due'])
        summary['tournament_total_due'] = str(summary['tournament_total_due'])
        summary['grand_total_due'] = str(summary['grand_total_due'])
        return Response(summary)

    @action(detail=False, methods=['get'])
    def dues(self, request):
        """[R18] Track pending/overdue payments."""
        month, year = parse_month_year(
            request.query_params.get('month'),
            request.query_params.get('year'),
        )
        reference_date = date(year, month, 1)
        paid_students = Payment.objects.filter(
            payment_type='MONTHLY',
            payment_date__month=month,
            payment_date__year=year
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
            y3, m3 = reference_date.year, reference_date.month
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
                'month': month,
                'year': year,
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
        payment_period = build_payment_period(month, year)

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


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Expense.objects.all()
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        if month:
            queryset = queryset.filter(expense_date__month=int(month))
        if year:
            queryset = queryset.filter(expense_date__year=int(year))
        return queryset

    def perform_create(self, serializer):
        if self.request.user.role not in ['ADMIN', 'CLERK']:
            raise PermissionDenied('Unauthorized.')
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        if self.request.user.role not in ['ADMIN', 'CLERK']:
            raise PermissionDenied('Unauthorized.')
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.role not in ['ADMIN', 'CLERK']:
            raise PermissionDenied('Unauthorized.')
        instance.delete()
