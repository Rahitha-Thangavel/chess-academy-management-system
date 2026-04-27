"""Payments app routes.

URL patterns for the payments app."""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentViewSet, SalaryViewSet, ExpenseViewSet

router = DefaultRouter()
router.register(r'payments', PaymentViewSet)
router.register(r'salaries', SalaryViewSet)
router.register(r'expenses', ExpenseViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
