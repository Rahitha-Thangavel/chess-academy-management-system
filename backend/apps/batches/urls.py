from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BatchEnrollmentViewSet, BatchViewSet, CoachAvailabilityViewSet, RescheduleRequestViewSet, CoachBatchApplicationViewSet

router = DefaultRouter()
router.register(r'batches', BatchViewSet, basename='batch')
router.register(r'coach-applications', CoachBatchApplicationViewSet)
router.register(r'availability', CoachAvailabilityViewSet)
router.register(r'reschedule-requests', RescheduleRequestViewSet)
router.register(r'enrollments', BatchEnrollmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
