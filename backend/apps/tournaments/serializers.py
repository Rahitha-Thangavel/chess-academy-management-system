from rest_framework import serializers
from .models import Tournament, TournamentRegistration, TournamentMatch

class TournamentSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by_user.get_full_name', read_only=True)

    class Meta:
        model = Tournament
        fields = [
            'id', 'tournament_name', 'tournament_date', 'venue', 
            'entry_fee', 'created_by_user', 'created_by_name', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by_user', 'created_at', 'updated_at']

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
