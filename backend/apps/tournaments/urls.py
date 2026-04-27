"""Tournaments app routes.

URL patterns for the tournaments app."""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TournamentViewSet, TournamentRegistrationViewSet, TournamentMatchViewSet

router = DefaultRouter()
router.register(r'tournaments', TournamentViewSet)
router.register(r'registrations', TournamentRegistrationViewSet)
router.register(r'matches', TournamentMatchViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
