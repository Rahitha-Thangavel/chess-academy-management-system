"""Analytics app views.

API views/endpoints for the analytics app."""

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg
from django.utils import timezone
from datetime import timedelta, date
from apps.students.models import Student
from apps.attendance.models import Attendance
from apps.attendance.utils import academy_now, get_batch_attendance_window
from apps.payments.models import Payment, Salary
from apps.payments.views import build_payment_period, parse_month_year
from apps.tournaments.models import Tournament, TournamentRegistration
from .permissions import IsAnalyticsUser
import django.db.models as db_models

class ReportsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated, IsAnalyticsUser]

    def get_permissions(self):
        if getattr(self, 'action', None) in ['dashboard_stats', 'daily_summary']:
            return [permissions.IsAuthenticated()]
        return [permission() for permission in self.permission_classes]

    @action(detail=False, methods=['get'])
    def student_attendance(self, request):
        """[R29] Report on student attendance percentage."""
        month, year = parse_month_year(
            request.query_params.get('month'),
            request.query_params.get('year'),
        )
        data = Student.objects.annotate(
            total_classes=Count(
                'attendance_records',
                filter=db_models.Q(
                    attendance_records__attendance_date__month=month,
                    attendance_records__attendance_date__year=year,
                ),
            ),
            present_classes=Count(
                'attendance_records',
                filter=db_models.Q(
                    attendance_records__status='PRESENT',
                    attendance_records__attendance_date__month=month,
                    attendance_records__attendance_date__year=year,
                ),
            ),
        ).filter(total_classes__gt=0).values('id', 'first_name', 'last_name', 'total_classes', 'present_classes')
        return Response(data)

    @action(detail=False, methods=['get'])
    def payments_summary(self, request):
        """[R29] Report on payments and dues."""
        month, year = parse_month_year(
            request.query_params.get('month'),
            request.query_params.get('year'),
        )
        total_collected = Payment.objects.filter(
            payment_date__year=year,
            payment_date__month=month,
        ).aggregate(total=Sum('amount'))['total'] or 0
        by_type = list(
            Payment.objects.filter(
                payment_date__year=year,
                payment_date__month=month,
            ).values('payment_type').annotate(total=Sum('amount'))
        )

        paid_this_month = Payment.objects.filter(
            payment_type='MONTHLY',
            payment_date__year=year,
            payment_date__month=month,
        ).values_list('student_id', flat=True)
        unpaid_students = Student.objects.filter(status='ACTIVE').exclude(id__in=paid_this_month)

        return Response({
            'month': month,
            'year': year,
            'total_collected': total_collected,
            'summary_by_type': by_type,
            'pending_students': unpaid_students.count(),
            'overdue_students': sum(1 for student in unpaid_students if self._count_unpaid_months(student, date(year, month, 1)) >= 3),
        })

    @action(detail=False, methods=['get'])
    def tournament_details(self, request):
        """[R28, R29] Tournament report with participants, fees, attendance, and results."""
        month, year = parse_month_year(
            request.query_params.get('month'),
            request.query_params.get('year'),
        )
        tournament_rows = []
        for tournament in Tournament.objects.filter(
            tournament_date__month=month,
            tournament_date__year=year,
        ).order_by('-tournament_date'):
            registrations = tournament.registrations.all()
            participant_count = registrations.count()
            paid_regs = registrations.filter(payment_status='PAID')
            attended_regs = registrations.filter(attendance_status='PRESENT')
            ranked_regs = registrations.exclude(rank__isnull=True).order_by('rank', '-score')

            tournament_rows.append({
                'id': tournament.id,
                'tournament_name': tournament.tournament_name,
                'tournament_date': tournament.tournament_date,
                'venue': tournament.venue,
                'participant_count': participant_count,
                'fees_collected': str(paid_regs.aggregate(total=Sum('fee_paid'))['total'] or 0),
                'attendance_count': attended_regs.count(),
                'top_results': [
                    {
                        'student': reg.student.get_full_name(),
                        'rank': reg.rank,
                        'score': str(reg.score) if reg.score is not None else None,
                    }
                    for reg in ranked_regs[:3]
                ],
            })
        return Response(tournament_rows)

    @action(detail=False, methods=['get'])
    def coach_salary_summary(self, request):
        """[R22, R29] Salary summaries and trends for coaches."""
        month, year = parse_month_year(
            request.query_params.get('month'),
            request.query_params.get('year'),
        )
        payment_period = build_payment_period(month, year)
        salaries = Salary.objects.select_related('coach_user').filter(payment_period=payment_period).order_by('-created_at')
        if request.user.role == 'COACH':
            salaries = salaries.filter(coach_user=request.user)

        rows = []
        for salary in salaries:
            rows.append({
                'id': salary.id,
                'coach_name': salary.coach_user.get_full_name(),
                'payment_period': salary.payment_period,
                'total_hours': str(salary.total_hours),
                'hourly_rate': str(salary.hourly_rate),
                'gross_amount': str(salary.gross_amount),
                'net_amount': str(salary.net_amount),
                'status': salary.status,
            })

        trend_queryset = Salary.objects.all()
        if request.user.role == 'COACH':
            trend_queryset = trend_queryset.filter(coach_user=request.user)

        trend = list(
            trend_queryset.values('payment_period').annotate(
                average_net=Avg('net_amount'),
                total_net=Sum('net_amount'),
            ).order_by('payment_period')
        )

        return Response({
            'month': month,
            'year': year,
            'rows': rows,
            'trend': trend,
        })

    @action(detail=False, methods=['get'])
    def daily_summary(self, request):
        """Attendance summary for today's classes."""
        from apps.batches.models import Batch
        from django.db.models import Q
        
        current_dt = academy_now()
        today = current_dt.date()
        yesterday = today - timedelta(days=1)
        all_param = request.query_params.get('all', 'false').lower() == 'true'
        
        if all_param:
            batches = Batch.objects.all().select_related('coach_user')
            candidate_dates = [today]
        else:
            day_map = {
                'Monday': 'MON', 'Tuesday': 'TUE', 'Wednesday': 'WED', 
                'Thursday': 'THU', 'Friday': 'FRI', 'Saturday': 'SAT', 'Sunday': 'SUN'
            }
            today_code = day_map.get(today.strftime('%A'), 'MON')
            yesterday_code = day_map.get(yesterday.strftime('%A'), 'MON')
            batches = Batch.objects.filter(
                Q(batch_type='RECURRING', schedule_day__in=[today_code, yesterday_code]) |
                Q(batch_type='ONE_TIME', exact_date__in=[today, yesterday])
            ).select_related('coach_user')
            candidate_dates = [today, yesterday]
            
        data = []
        seen = set()
        for b in batches:
            for target_date in candidate_dates:
                window = get_batch_attendance_window(b, current_dt, target_date=target_date)
                if window['status'] == 'UNSCHEDULED':
                    continue
                if not all_param and window['status'] == 'EXPIRED':
                    continue

                key = (b.id, target_date.isoformat())
                if key in seen:
                    continue
                seen.add(key)

                total_students = b.enrollments.count()
                attendance_records = Attendance.objects.filter(batch=b, attendance_date=target_date)
                present_count = attendance_records.filter(status='PRESENT').count()
                absent_count = attendance_records.filter(status='ABSENT').count()

                status_text = f"{present_count}/{total_students} Present"
                if absent_count > 0:
                    status_text += f" | {absent_count} Absent"

                color = 'success' if present_count >= total_students * 0.8 else 'warning'
                if present_count == 0 and total_students > 0:
                    color = 'danger'

                data.append({
                    'batch_id': b.id,
                    'class': b.batch_name,
                    'coach': b.coach_user.get_full_name() if b.coach_user else "No Coach",
                    'schedule': b.get_schedule_day_display() if b.batch_type == 'RECURRING' else 'One-time',
                    'attendance_date': target_date.isoformat(),
                    'is_today': target_date == today,
                    'start_time': b.start_time.strftime('%H:%M:%S'),
                    'end_time': b.end_time.strftime('%H:%M:%S'),
                    'status': status_text,
                    'color': color,
                    'attendance_window_status': window['status'],
                    'attendance_window_message': window['message'],
                    'can_record_attendance': window['can_record'],
                    'attendance_opens_at': window['opens_at'].isoformat() if window['opens_at'] else None,
                    'attendance_closes_at': window['closes_at'].isoformat() if window['closes_at'] else None,
                    'seconds_until_open': window['seconds_until_open'],
                })
        data.sort(key=lambda item: (item['attendance_date'], item['start_time']))
        return Response(data)

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get summary stats for dashboard badges."""
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            from apps.batches.models import RescheduleRequest, Batch
            from apps.users.models import User
            
            now = timezone.now()
            today = now.date()
            
            # 1. Counts
            if request.user.role == 'PARENT':
                total_students = Student.objects.filter(parent_user=request.user, status='ACTIVE').count()
            else:
                total_students = Student.objects.filter(status='ACTIVE').count()
            active_coaches = User.objects.filter(role='COACH', is_active=True).count()
            
            # 2. Schedule & Pending Actions (Role-specific)
            today_name = today.strftime('%A')
            day_map = {
                'Monday': 'MON', 'Tuesday': 'TUE', 'Wednesday': 'WED', 
                'Thursday': 'THU', 'Friday': 'FRI', 'Saturday': 'SAT', 'Sunday': 'SUN'
            }
            today_code = day_map.get(today_name, 'MON')
            
            todays_batches = Batch.objects.filter(
                db_models.Q(batch_type='RECURRING', schedule_day=today_code) |
                db_models.Q(batch_type='ONE_TIME', exact_date=today)
            ).select_related('coach_user')
            todays_classes_count = todays_batches.count()
            todays_tournaments = Tournament.objects.filter(tournament_date=today).order_by('start_time', 'tournament_name')

            pending_students = 0
            pending_reschedules = 0
            pending_attendance = 0
            pending_payments = 0
            
            if request.user.role in ['ADMIN', 'CLERK']:
                pending_students = Student.objects.filter(status='PENDING').count()
                pending_reschedules = RescheduleRequest.objects.filter(status='PENDING').count()
            elif request.user.role == 'COACH':
                # For coaches, "pending" could be batches that need attendance today
                my_batches = todays_batches.filter(coach_user=request.user)
                for b in my_batches:
                    if not Attendance.objects.filter(batch=b, attendance_date=today).exists():
                        pending_attendance += 1
            elif request.user.role == 'PARENT':
                # For parents, pending could be unpaid invoices or unread notifications
                # Let's count students with no payment this month
                paid_this_month = Payment.objects.filter(
                    payment_date__year=today.year,
                    payment_date__month=today.month,
                    payment_type='MONTHLY'
                ).values_list('student_id', flat=True)
                pending_payments = Student.objects.filter(parent_user=request.user, status='ACTIVE').exclude(id__in=paid_this_month).count()

            total_pending_actions = pending_students + pending_reschedules + pending_attendance
            
            # Notifications (Real)
            from apps.notifications.models import Notification
            notifications_count = Notification.objects.filter(user=request.user, is_read=False).count()
            
            # 3. Payments (Admin/Clerk only)
            monthly_revenue = 0
            today_payments = 0
            unpaid_count = 0
            if request.user.role in ['ADMIN', 'CLERK']:
                monthly_revenue = Payment.objects.filter(
                    payment_date__year=today.year,
                    payment_date__month=today.month
                ).aggregate(total=Sum('amount'))['total'] or 0
                
                today_payments = Payment.objects.filter(
                    payment_date=today
                ).aggregate(total=Sum('amount'))['total'] or 0

                paid_this_month_global = Payment.objects.filter(
                    payment_date__year=today.year,
                    payment_date__month=today.month,
                    payment_type='MONTHLY'
                ).values_list('student_id', flat=True)
                unpaid_count = Student.objects.filter(status='ACTIVE').exclude(id__in=paid_this_month_global).count()
                payments_due = unpaid_count * 2000 # Assume LKR 2000 per month
            else:
                payments_due = 0
            
            # Registration list (Recent Activity)
            recent_registrations = Student.objects.order_by('-created_at')[:5]
            reg_data = [{
                'name': f"{s.first_name} {s.last_name}",
                'detail': f"{s.grade_level} | {s.created_at.strftime('%b %d')}",
                'type': 'registration'
            } for s in recent_registrations]

            schedule_batches = todays_batches
            if request.user.role == 'COACH':
                schedule_batches = todays_batches.filter(coach_user=request.user)

            schedule_data = []
            for batch in schedule_batches:
                schedule_data.append({
                    'batch_id': batch.id,
                    'time': batch.start_time.strftime('%I:%M %p'),
                    'start_time': batch.start_time.strftime('%H:%M:%S'),
                    'end_time': batch.end_time.strftime('%H:%M:%S'),
                    'title': batch.batch_name,
                    'coach': batch.coach_user.get_full_name() if batch.coach_user else "No Coach Assigned",
                    'students': f"{batch.enrollments.count()} students"
                })

            tournament_data = [{
                'id': tournament.id,
                'title': tournament.tournament_name,
                'venue': tournament.venue or 'TBD',
                'time': f"{tournament.start_time.strftime('%H:%M')} - {tournament.end_time.strftime('%H:%M')}",
                'status': (
                    'Starts later' if now.time() < tournament.start_time
                    else 'Open now' if now.time() <= tournament.end_time
                    else 'Finished'
                ),
                'can_manage': tournament.start_time <= now.time() <= tournament.end_time,
            } for tournament in todays_tournaments]

            # Recent Notifications (Actionable/Unread only)
            recent_notifs = Notification.objects.filter(user=request.user, is_read=False).order_by('-created_at')[:5]
            notif_data = [{
                'id': n.id,
                'title': n.title,
                'message': n.message,
                'is_read': n.is_read,
                'target_url': n.target_url,
                'created_at': n.created_at.isoformat()
            } for n in recent_notifs]

            return Response({
                'total_students': total_students,
                'active_coaches': active_coaches,
                'pending_actions': total_pending_actions,
                'pending_students': pending_students,
                'pending_reschedules': pending_reschedules,
                'pending_attendance': pending_attendance,
                'pending_payments': pending_payments if request.user.role == 'PARENT' else 0,
                'notifications': notifications_count, 
                'recent_notifications': notif_data,
                'todays_classes': todays_classes_count,
                'monthly_revenue': monthly_revenue,
                'today_payments': today_payments,
                'unpaid_students_count': unpaid_count,
                'payments_due': payments_due,
                'todays_schedule': schedule_data,
                'todays_tournaments': tournament_data,
                'recent_registrations': reg_data,
                'upcoming_tournaments_count': Tournament.objects.filter(tournament_date__gte=today).count()
            })
        except Exception as e:
            logger.error(f"Error in dashboard_stats: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _count_unpaid_months(self, student, today):
        months = [
            (today.year, today.month),
        ]
        year = today.year
        month = today.month
        for _ in range(2):
            if month == 1:
                year -= 1
                month = 12
            else:
                month -= 1
            months.append((year, month))

        unpaid_months = 0
        for year, month in months:
            has_paid = Payment.objects.filter(
                student=student,
                payment_type='MONTHLY',
                payment_date__year=year,
                payment_date__month=month,
            ).exists()
            if not has_paid:
                unpaid_months += 1
        return unpaid_months
