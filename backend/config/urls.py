from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Swagger/OpenAPI documentation
schema_view = get_schema_view(
    openapi.Info(
        title="Chess Academy Management System API",
        default_version='v1',
        description="API documentation for Chess Academy Management System",
        contact=openapi.Contact(email="admin@chessacademy.com"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    # Comment out other apps until we create proper views
    path('api/', include('apps.students.urls')),
    path('api/', include('apps.batches.urls')),
    path('api/', include('apps.attendance.urls')),
    path('api/', include('apps.payments.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    path('api/', include('apps.tournaments.urls')),
    
    # API Documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='redoc'),
]