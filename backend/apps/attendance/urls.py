from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AttendanceViewSet, CoachAttendanceViewSet

router = DefaultRouter()
router.register(r'students', AttendanceViewSet, basename='student-attendance')
router.register(r'coaches', CoachAttendanceViewSet, basename='coach-attendance')

urlpatterns = [
    path('', include(router.urls)),
]
