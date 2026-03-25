from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count
from apps.students.models import Student
from apps.attendance.models import Attendance
from apps.payments.models import Payment, Salary
from apps.tournaments.models import Tournament, TournamentRegistration
from .permissions import IsStaffOrCoach

class ReportsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated, IsStaffOrCoach]

    @action(detail=False, methods=['get'])
    def student_attendance(self, request):
        """[R29] Report on student attendance percentage."""
        data = Student.objects.annotate(
            total_classes=Count('attendance_records'),
            present_classes=Count('attendance_records', filter=db_models.Q(attendance_records__status='PRESENT'))
        ).values('id', 'first_name', 'last_name', 'total_classes', 'present_classes')
        return Response(data)

    @action(detail=False, methods=['get'])
    def payments_summary(self, request):
        """[R29] Report on payments and dues."""
        total_collected = Payment.objects.aggregate(total=Sum('amount'))['total'] or 0
        by_type = Payment.objects.values('payment_type').annotate(total=Sum('amount'))
        return Response({
            'total_collected': total_collected,
            'summary_by_type': by_type
        })

    @action(detail=False, methods=['get'])
    def tournament_details(self, request):
        """[R28] Report on tournaments, fees, and participants."""
        tournaments = Tournament.objects.annotate(
            participant_count=Count('registrations'),
            fees_collected=Sum('registrations__tournament__entry_fee', filter=db_models.Q(registrations__payment_status='PAID'))
        ).values('id', 'tournament_name', 'tournament_date', 'participant_count', 'fees_collected')
        return Response(tournaments)

    @action(detail=False, methods=['get'])
    def daily_summary(self, request):
        """Attendance summary for today's classes."""
        from apps.batches.models import Batch
        from apps.attendance.models import Attendance
        import datetime
        from django.utils import timezone
        
        today = timezone.now().date()
        all_param = request.query_params.get('all', 'false').lower() == 'true'
        
        if all_param:
            batches = Batch.objects.all().select_related('coach_user')
        else:
            today_name = today.strftime('%A')
            day_map = {
                'Monday': 'MON', 'Tuesday': 'TUE', 'Wednesday': 'WED', 
                'Thursday': 'THU', 'Friday': 'FRI', 'Saturday': 'SAT', 'Sunday': 'SUN'
            }
            today_code = day_map.get(today_name, 'MON')
            batches = Batch.objects.filter(schedule_day=today_code).select_related('coach_user')
            
        data = []
        for b in batches:
            total_students = b.enrollments.count()
            attendance_records = Attendance.objects.filter(batch=b, date=today)
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
                'schedule': b.get_schedule_day_display(),
                'status': status_text,
                'color': color
            })
        return Response(data)

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get summary stats for dashboard badges."""
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            from apps.batches.models import RescheduleRequest, Batch
            from apps.users.models import User
            import datetime
            from django.utils import timezone
            
            now = timezone.now()
            today = now.date()
            
            # 1. Counts
            total_students = Student.objects.filter(status='ACTIVE').count()
            active_coaches = User.objects.filter(role='COACH', is_active=True).count()
            
            # 2. Schedule & Pending Actions (Role-specific)
            today_name = today.strftime('%A')
            day_map = {
                'Monday': 'MON', 'Tuesday': 'TUE', 'Wednesday': 'WED', 
                'Thursday': 'THU', 'Friday': 'FRI', 'Saturday': 'SAT', 'Sunday': 'SUN'
            }
            today_code = day_map.get(today_name, 'MON')
            
            todays_batches = Batch.objects.filter(schedule_day=today_code).select_related('coach_user')
            todays_classes_count = todays_batches.count()

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
                    if not Attendance.objects.filter(batch=b, date=today).exists():
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

            schedule_data = []
            for batch in todays_batches:
                schedule_data.append({
                    'time': batch.start_time.strftime('%I:%M %p'),
                    'title': batch.batch_name,
                    'coach': batch.coach_user.get_full_name() if batch.coach_user else "No Coach Assigned",
                    'students': f"{batch.enrollments.count()} students"
                })

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
                'recent_registrations': reg_data,
                'upcoming_tournaments_count': Tournament.objects.filter(tournament_date__gte=today).count()
            })
        except Exception as e:
            logger.error(f"Error in dashboard_stats: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

import django.db.models as db_models
