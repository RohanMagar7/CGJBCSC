# services/urls.py
from rest_framework import routers
from django.urls import path, include
from .views import (UserViewSet, ServiceViewSet, UserApplicationViewSet, UserDocumentViewSet, 
                    FinalDocumentViewSet, AnnouncementViewSet, PaymentViewSet, RequiredDocumentViewSet,
                    PaymentSettingsViewSet)

router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'services', ServiceViewSet)
router.register(r'required-documents', RequiredDocumentViewSet)
router.register(r'applications', UserApplicationViewSet)
router.register(r'documents', UserDocumentViewSet)
router.register(r'final_documents', FinalDocumentViewSet)
router.register(r'announcements', AnnouncementViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'payment-settings', PaymentSettingsViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
