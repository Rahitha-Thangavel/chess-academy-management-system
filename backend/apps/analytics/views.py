from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count
from apps.students.models import Student
from apps.attendance.models import Attendance
from apps.payments.models import Payment, Salary
from apps.tournaments.models import Tournament, TournamentRegistration
from .permissions import IsAdminOrCoach

class ReportsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrCoach]

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
    def dashboard_stats(self, request):
        """Get summary stats for dashboard badges."""
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            from apps.batches.models import RescheduleRequest, Batch
            from apps.users.models import User
            import datetime
            
            # 1. Counts
            total_students = Student.objects.filter(status='ACTIVE').count()
            active_coaches = User.objects.filter(role='COACH', is_active=True).count()
            
            # 2. Pending Actions
            pending_students = Student.objects.filter(status='PENDING').count()
            pending_reschedules = RescheduleRequest.objects.filter(status='PENDING').count()
            total_pending_actions = pending_students + pending_reschedules
            
            # 3. Payments - Wrapped in try/except to prevent dashboard crash
            payments_due = 0
            monthly_revenue = 0
            try:
                monthly_revenue = Payment.objects.filter(
                    payment_date__month=datetime.date.today().month
                ).aggregate(total=Sum('amount'))['total'] or 0
            except Exception as pay_err:
                logger.error(f"Error calculating revenue: {pay_err}")
            
            # 4. Today's Schedule
            today_name = datetime.date.today().strftime('%A')
            day_map = {
                'Monday': 'MON', 'Tuesday': 'TUE', 'Wednesday': 'WED', 
                'Thursday': 'THU', 'Friday': 'FRI', 'Saturday': 'SAT', 'Sunday': 'SUN'
            }
            today_code = day_map.get(today_name, 'MON')
            
            todays_batches = Batch.objects.filter(schedule_day=today_code).select_related('coach_user')
            todays_classes_count = todays_batches.count()
            
            schedule_data = []
            for batch in todays_batches:
                schedule_data.append({
                    'time': batch.start_time.strftime('%I:%M %p'),
                    'title': batch.batch_name,
                    'coach': batch.coach_user.get_full_name(),
                    'students': f"{batch.enrollments.count()} students"
                })

            return Response({
                'total_students': total_students,
                'active_coaches': active_coaches,
                'pending_actions': total_pending_actions,
                'pending_students': pending_students,
                'pending_reschedules': pending_reschedules,
                'notifications': 8, 
                'todays_classes': todays_classes_count,
                'payments_due': payments_due,
                'monthly_revenue': monthly_revenue,
                'todays_schedule': schedule_data
            })
        except Exception as e:
            logger.error(f"Error in dashboard_stats: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

import django.db.models as db_models
