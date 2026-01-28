from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
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
        serializer.save(created_by_user=self.request.user)

class TournamentRegistrationViewSet(viewsets.ModelViewSet):
    queryset = TournamentRegistration.objects.all()
    serializer_class = TournamentRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'PARENT':
            return TournamentRegistration.objects.filter(student__parent_user=user)
        return TournamentRegistration.objects.all()

    @action(detail=True, methods=['post'])
    def mark_attendance(self, request, pk=None):
        registration = self.get_object()
        registration.attended = request.data.get('attended', True)
        registration.save()
        return Response({'status': 'attendance updated'})

    @action(detail=True, methods=['post'])
    def record_fee(self, request, pk=None):
        registration = self.get_object()
        registration.payment_status = 'PAID'
        registration.save()
        return Response({'status': 'payment recorded'})

class TournamentMatchViewSet(viewsets.ModelViewSet):
    queryset = TournamentMatch.objects.all()
    serializer_class = TournamentMatchSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'])
    def record_result(self, request, pk=None):
        """[R27] Record match outcome."""
        match = self.get_object()
        winner_id = request.data.get('winner_id')
        result_details = request.data.get('result_details', '')
        
        match.winner_id = winner_id
        match.result_details = result_details
        match.save()
        
        return Response({'status': 'result recorded'})
