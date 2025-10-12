from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.mail import send_mail
from .models import User, Service, UserApplication, UserDocument, FinalDocument
from .serializers import UserSerializer, ServiceSerializer, UserApplicationSerializer, UserDocumentSerializer, FinalDocumentSerializer
from .permissions import IsAdminUser, IsOwnerOrAdmin

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    def get_permissions(self):
        if self.request.method in ['POST','PUT','PATCH','DELETE']:
            return [permissions.IsAuthenticated(), IsAdminUser()]
        return [permissions.AllowAny()]

class UserApplicationViewSet(viewsets.ModelViewSet):
    queryset = UserApplication.objects.all()
    serializer_class = UserApplicationSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return UserApplication.objects.all()
        return UserApplication.objects.filter(user=user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsAdminUser])
    def update_status(self, request, pk=None):
        app = self.get_object()
        status = request.data.get('status')
        reason = request.data.get('reject_reason', '')
        if status not in ['Approved','Rejected']:
            return Response({'error':'Invalid status'}, status=400)
        app.status = status
        if status=='Rejected':
            app.reject_reason = reason
        app.save()
        if app.user.email:
            send_mail(
                f"Your application for {app.service.service_name} is {status}",
                f"Hello {app.user.full_name},\nStatus: {status}\n{('Reason: '+reason) if status=='Rejected' else ''}",
                None, [app.user.email]
            )
        return Response({'success':True,'status':app.status})

class UserDocumentViewSet(viewsets.ModelViewSet):
    queryset = UserDocument.objects.all()
    serializer_class = UserDocumentSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

class FinalDocumentViewSet(viewsets.ModelViewSet):
    queryset = FinalDocument.objects.all()
    serializer_class = FinalDocumentSerializer
    def get_permissions(self):
        if self.request.method in ['POST','PUT','PATCH','DELETE']:
            return [permissions.IsAuthenticated(), IsAdminUser()]
        return [permissions.IsAuthenticated(), IsOwnerOrAdmin()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return FinalDocument.objects.all()
        return FinalDocument.objects.filter(application__user=user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context
