"""Tournaments app serializers.

Django REST Framework serializers for the tournaments app."""

from rest_framework import serializers
from django.utils import timezone
from .models import Tournament, TournamentRegistration, TournamentMatch

class TournamentSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by_user.get_full_name', read_only=True)
    is_today = serializers.SerializerMethodField()
    window_status = serializers.SerializerMethodField()

    class Meta:
        model = Tournament
        fields = [
            'id', 'tournament_name', 'tournament_date', 'start_time', 'end_time', 'venue', 
            'entry_fee', 'created_by_user', 'created_by_name', 
            'created_at', 'updated_at', 'is_today', 'window_status'
        ]
        read_only_fields = ['id', 'created_by_user', 'created_at', 'updated_at']

    def get_is_today(self, obj):
        return obj.tournament_date == timezone.localdate()

    def get_window_status(self, obj):
        now = timezone.localtime()
        today = now.date()
        if obj.tournament_date > today:
            return 'UPCOMING'
        if obj.tournament_date < today:
            return 'FINISHED'
        if now.time() < obj.start_time:
            return 'BEFORE_START'
        if now.time() > obj.end_time:
            return 'FINISHED'
        return 'OPEN'

class TournamentRegistrationSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    tournament_name = serializers.CharField(source='tournament.tournament_name', read_only=True)

    class Meta:
        model = TournamentRegistration
        fields = [
            'id', 'tournament', 'tournament_name', 'student', 'student_name', 
            'registration_date', 'status', 'payment_status', 'fee_paid', 'attendance_status', 
            'score', 'rank'
        ]
        read_only_fields = [
            'id',
            'registration_date',
            'status',
            'tournament_name',
            'student_name',
            'payment_status',
            'fee_paid',
            'attendance_status',
            'score',
            'rank',
        ]

class TournamentMatchSerializer(serializers.ModelSerializer):
    player1_name = serializers.CharField(source='player1.get_full_name', read_only=True)
    player2_name = serializers.CharField(source='player2.get_full_name', read_only=True)
    winner_name = serializers.CharField(source='winner.get_full_name', read_only=True, allow_null=True)

    class Meta:
        model = TournamentMatch
        fields = [
            'id', 'tournament', 'player1', 'player1_name', 'player2', 'player2_name',
            'round_number', 'match_date', 'winner', 'winner_name', 'result_details', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
