from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BatchViewSet, CoachAvailabilityViewSet, RescheduleRequestViewSet

router = DefaultRouter()
router.register(r'batches', BatchViewSet)
router.register(r'availability', CoachAvailabilityViewSet)
router.register(r'reschedule-requests', RescheduleRequestViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
