from rest_framework import viewsets, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from .models import Tournament, TournamentRegistration, TournamentMatch
from .serializers import (
    TournamentSerializer, TournamentRegistrationSerializer, 
    TournamentMatchSerializer
)

class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.role != 'ADMIN':
            raise PermissionDenied('Only Admin can create tournaments.')
        tour = serializer.save(created_by_user=self.request.user)
        # Notify all Parents
        from apps.notifications.utils import create_notification
        from apps.users.models import User
        parents = User.objects.filter(role='PARENT')
        for parent in parents:
            create_notification(
                user=parent,
                notification_type='TOURNAMENT',
                title='New Tournament Created',
                message=f'A new tournament "{tour.tournament_name}" has been scheduled for {tour.tournament_date}. Click to register.',
                target_url='/parent/tournaments'
            )
    def perform_update(self, serializer):
        if self.request.user.role != 'ADMIN':
            raise PermissionDenied('Only Admin can update tournaments.')
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.role != 'ADMIN':
            raise PermissionDenied('Only Admin can delete tournaments.')
        instance.delete()

class TournamentRegistrationViewSet(viewsets.ModelViewSet):
    queryset = TournamentRegistration.objects.all()
    serializer_class = TournamentRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['tournament', 'status', 'payment_status', 'attendance_status']
    # SearchFilter expects real model/related fields (not serializer-only fields).
    search_fields = ['student__first_name', 'student__last_name', 'tournament__tournament_name']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'PARENT':
            return TournamentRegistration.objects.filter(student__parent_user=user)
        if user.role in ['ADMIN', 'CLERK']:
            return TournamentRegistration.objects.all()
        return TournamentRegistration.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role not in ['PARENT', 'ADMIN', 'CLERK']:
            raise PermissionDenied('Not allowed to register for tournaments.')

        reg = serializer.save(registered_by=user)
        # Notify Admins
        from apps.notifications.utils import create_notification
        from apps.users.models import User
        admins = User.objects.filter(role='ADMIN')
        for admin in admins:
            create_notification(
                user=admin,
                notification_type='ADMIN_ALERT',
                title='Tournament Registration Request',
                message=f'Student {reg.student.get_full_name()} has requested to register for {reg.tournament.tournament_name}.',
                target_url='/admin/tournaments'
            )

    def perform_update(self, serializer):
        if self.request.user.role not in ['ADMIN', 'CLERK']:
            raise PermissionDenied('Unauthorized.')
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.role not in ['ADMIN', 'CLERK']:
            raise PermissionDenied('Unauthorized.')
        instance.delete()

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        if request.user.role != 'ADMIN':
            raise PermissionDenied('Only Admin can approve tournament registrations.')

        reg = self.get_object()
        reg.status = 'APPROVED'
        reg.save()
        
        # Trigger Notification for Parent
        from apps.notifications.utils import create_notification, mark_stale_notifications
        mark_stale_notifications('/admin/tournaments')
        create_notification(
            user=reg.student.parent_user,
            notification_type='TOURNAMENT',
            title='Tournament Registration Approved',
            message=f'Registration for {reg.student.first_name} in tournament {reg.tournament.tournament_name} has been approved.',
            target_url='/parent/tournaments'
        )
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        if request.user.role != 'ADMIN':
            raise PermissionDenied('Only Admin can reject tournament registrations.')

        reg = self.get_object()
        reg.status = 'REJECTED'
        reg.save()
        
        # Trigger Notification for Parent
        from apps.notifications.utils import create_notification, mark_stale_notifications
        mark_stale_notifications('/admin/tournaments')
        create_notification(
            user=reg.student.parent_user,
            notification_type='TOURNAMENT',
            title='Tournament Registration Rejected',
            message=f'Registration for {reg.student.first_name} in tournament {reg.tournament.tournament_name} has been rejected.',
            target_url='/parent/tournaments'
        )
        return Response({'status': 'rejected'})

    @action(detail=True, methods=['post'])
    def record_fee(self, request, pk=None):
        """
        [R25] Admin/Clerk records tournament fees and marks registration as paid.
        The admin UI calls this endpoint after approval.
        """
        if request.user.role not in ['ADMIN', 'CLERK']:
            raise PermissionDenied('Unauthorized.')

        reg = self.get_object()
        reg.status = 'APPROVED'

        tournament_fee = reg.tournament.entry_fee
        reg.payment_status = 'PAID'
        reg.fee_paid = tournament_fee
        reg.save()

        from apps.notifications.utils import create_notification, mark_stale_notifications
        mark_stale_notifications('/admin/tournaments')
        create_notification(
            user=reg.student.parent_user,
            notification_type='TOURNAMENT',
            title='Tournament Registration Approved',
            message=(
                f'Registration for {reg.student.first_name} in tournament '
                f'{reg.tournament.tournament_name} has been approved and fee recorded.'
            ),
            target_url='/parent/tournaments'
        )
        return Response({'status': 'fee recorded', 'payment_status': reg.payment_status, 'fee_paid': str(reg.fee_paid)})

    @action(detail=True, methods=['post'])
    def record_attendance(self, request, pk=None):
        """
        [R26] Admin/Clerk records participant attendance for tournaments.
        """
        if request.user.role not in ['ADMIN', 'CLERK']:
            raise PermissionDenied('Unauthorized.')

        reg = self.get_object()
        attendance_status = request.data.get('attendance_status') or request.data.get('attended')
        if attendance_status not in ['PRESENT', 'ABSENT', None]:
            return Response({'error': 'Invalid attendance_status.'}, status=status.HTTP_400_BAD_REQUEST)

        if attendance_status is not None:
            reg.attendance_status = attendance_status
        reg.save()

        return Response({'status': 'attendance recorded', 'attendance_status': reg.attendance_status})

class TournamentMatchViewSet(viewsets.ModelViewSet):
    queryset = TournamentMatch.objects.all()
    serializer_class = TournamentMatchSerializer
    permission_classes = [permissions.IsAuthenticated]

    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['tournament', 'round_number']
    # SearchFilter expects real model/related fields (not serializer-only fields).
    search_fields = [
        'player1__first_name', 'player1__last_name',
        'player2__first_name', 'player2__last_name',
        'winner__first_name', 'winner__last_name',
        'result_details',
    ]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'CLERK']:
            return TournamentMatch.objects.all().select_related('tournament', 'player1', 'player2', 'winner')
        return TournamentMatch.objects.none()

    def perform_create(self, serializer):
        if self.request.user.role not in ['ADMIN', 'CLERK']:
            raise PermissionDenied('Unauthorized.')
        serializer.save()

    def perform_update(self, serializer):
        if self.request.user.role not in ['ADMIN', 'CLERK']:
            raise PermissionDenied('Unauthorized.')
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.role not in ['ADMIN', 'CLERK']:
            raise PermissionDenied('Unauthorized.')
        instance.delete()

    @action(detail=True, methods=['post'])
    def record_result(self, request, pk=None):
        """[R27] Record match outcome."""
        if request.user.role not in ['ADMIN', 'CLERK']:
            raise PermissionDenied('Unauthorized.')

        match = self.get_object()
        winner_id = request.data.get('winner_id')
        result_details = request.data.get('result_details', '')

        player1_score = request.data.get('player1_score')
        player2_score = request.data.get('player2_score')
        player1_rank = request.data.get('player1_rank')
        player2_rank = request.data.get('player2_rank')
        player1_attendance_status = request.data.get('player1_attendance_status')
        player2_attendance_status = request.data.get('player2_attendance_status')
        
        if winner_id:
            match.winner_id = winner_id
        match.result_details = result_details
        match.save()

        # Update tournament registration score/rank for both players (if provided).
        for student_id, score, rank, attendance_status in [
            (match.player1_id, player1_score, player1_rank, player1_attendance_status),
            (match.player2_id, player2_score, player2_rank, player2_attendance_status),
        ]:
            reg = TournamentRegistration.objects.filter(
                tournament=match.tournament_id,
                student_id=student_id,
            ).first()
            if not reg:
                continue
            if score is not None:
                reg.score = score
            if rank is not None:
                reg.rank = rank
            if attendance_status is not None:
                reg.attendance_status = attendance_status
            reg.save()
        
        return Response({'status': 'result recorded'})
