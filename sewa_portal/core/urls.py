# services/urls.py
from rest_framework import routers
from django.urls import path, include
from .views import UserViewSet, ServiceViewSet, UserApplicationViewSet, UserDocumentViewSet, FinalDocumentViewSet

router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'services', ServiceViewSet)
router.register(r'applications', UserApplicationViewSet)
router.register(r'documents', UserDocumentViewSet)
router.register(r'final_documents', FinalDocumentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
