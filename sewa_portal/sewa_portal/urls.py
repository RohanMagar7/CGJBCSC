# digital_sewa/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static
# from core.health import health_check

urlpatterns = [
    path('admin/', admin.site.urls),
    # Health check for Render keep-alive
    # path('health/', health_check, name='health_check'),
    # The API router is defined in the `core` app (core/urls.py)
    path('api/', include('core.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
