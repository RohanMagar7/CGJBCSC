from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.core.mail import send_mail
from django.utils import timezone
from django.db import models
from .models import User, Service, UserApplication, UserDocument, FinalDocument, Announcement, Payment, RequiredDocument, PaymentSettings
from .serializers import (UserSerializer, ServiceSerializer, UserApplicationSerializer, 
                          UserDocumentSerializer, FinalDocumentSerializer, AnnouncementSerializer, 
                          PaymentSerializer, RequiredDocumentSerializer, PaymentSettingsSerializer)
from .permissions import IsAdminUser, IsOwnerOrAdmin

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        # Allow anyone to register (POST)
        if self.action == 'create':
            return [permissions.AllowAny()]
        # Allow authenticated users to view their own profile
        if self.action == 'retrieve':
            return [permissions.IsAuthenticated()]
        # All other actions require admin authentication
        return [permissions.IsAuthenticated(), IsAdminUser()]
    
    def retrieve(self, request, *args, **kwargs):
        """Allow users to retrieve their own profile, admins can view any profile"""
        instance = self.get_object()
        # Check if user is requesting their own profile or is admin
        if request.user.user_id == instance.user_id or request.user.role == 'admin':
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        return Response({'detail': 'You do not have permission to view this profile.'}, status=403)

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.prefetch_related('required_documents').all()  # Optimize with prefetch_related
    serializer_class = ServiceSerializer
    def get_permissions(self):
        if self.request.method in ['POST','PUT','PATCH','DELETE']:
            return [permissions.IsAuthenticated(), IsAdminUser()]
        return [permissions.AllowAny()]

class RequiredDocumentViewSet(viewsets.ModelViewSet):
    queryset = RequiredDocument.objects.select_related('service').all()  # Optimize with select_related
    serializer_class = RequiredDocumentSerializer
    
    def get_permissions(self):
        # Only admins can create/update/delete required documents
        if self.request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated(), IsAdminUser()]
        # Anyone can view required documents
        return [permissions.AllowAny()]
    
    def get_queryset(self):
        queryset = RequiredDocument.objects.select_related('service').all()  # Optimize FK lookup
        service_id = self.request.query_params.get('service_id', None)
        if service_id is not None:
            queryset = queryset.filter(service_id=service_id)
        return queryset

class UserApplicationViewSet(viewsets.ModelViewSet):
    queryset = UserApplication.objects.select_related('user', 'service').prefetch_related('documents', 'documents__required_document').all()  # Optimize with select_related and prefetch_related
    serializer_class = UserApplicationSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return UserApplication.objects.select_related('user', 'service').prefetch_related('documents', 'documents__required_document').all()
        return UserApplication.objects.select_related('user', 'service').prefetch_related('documents', 'documents__required_document').filter(user=user)

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
        
        # If approved, send payment details to user
        if status == 'Approved':
            try:
                payment = Payment.objects.get(application=app)
                payment_settings = PaymentSettings.objects.filter(is_active=True).first()
                
                # Mark payment link as sent
                if not payment.payment_link_sent:
                    payment.payment_link_sent = True
                    payment.payment_link_sent_at = timezone.now()
                    payment.save()
                
                # Prepare email content with payment details
                email_body = f"""Hello {app.user.full_name},

Your application for {app.service.service_name} has been APPROVED! 🎉

PAYMENT DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━
Amount to Pay: NPR {payment.amount}
Payment Method: {payment.payment_method}

"""
                if payment_settings:
                    if payment_settings.upi_id:
                        email_body += f"\n📱 UPI ID: {payment_settings.upi_id}"
                    if payment_settings.upi_number:
                        email_body += f"\n📞 UPI Number: {payment_settings.upi_number}"
                
                email_body += f"""

After completing the payment, please reply with the transaction ID or visit our office.

Thank you!
Sewa Portal
"""
                
                if app.user.email:
                    send_mail(
                        f"✅ Application Approved - Payment Required for {app.service.service_name}",
                        email_body,
                        None, 
                        [app.user.email]
                    )
                
                return Response({
                    'success': True,
                    'status': app.status,
                    'payment_details_sent': True,
                    'payment_settings': PaymentSettingsSerializer(payment_settings, context={'request': request}).data if payment_settings else None
                })
            except Payment.DoesNotExist:
                pass
        elif status == 'Rejected' and app.user.email:
            send_mail(
                f"Application Status: {status}",
                f"Hello {app.user.full_name},\nYour application for {app.service.service_name} is {status}\n{('Reason: '+reason) if status=='Rejected' else ''}",
                None, [app.user.email]
            )
        
        return Response({'success':True,'status':app.status})

class UserDocumentViewSet(viewsets.ModelViewSet):
    queryset = UserDocument.objects.select_related('application', 'application__user', 'application__service', 'required_document').all()  # Optimize with select_related
    serializer_class = UserDocumentSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

class FinalDocumentViewSet(viewsets.ModelViewSet):
    queryset = FinalDocument.objects.select_related('application', 'application__user', 'application__service').all()  # Optimize with select_related
    serializer_class = FinalDocumentSerializer
    def get_permissions(self):
        if self.request.method in ['POST','PUT','PATCH','DELETE']:
            return [permissions.IsAuthenticated(), IsAdminUser()]
        return [permissions.IsAuthenticated(), IsOwnerOrAdmin()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return FinalDocument.objects.select_related('application', 'application__user', 'application__service').all()
        return FinalDocument.objects.select_related('application', 'application__user', 'application__service').filter(application__user=user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context


class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.select_related('created_by').all()  # Optimize with select_related
    serializer_class = AnnouncementSerializer
    
    def get_permissions(self):
        # Allow anyone to view announcements (GET)
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        # Only admins can create, update, delete
        return [permissions.IsAuthenticated(), IsAdminUser()]
    
    def get_queryset(self):
        # Public users only see active announcements
        if self.request.user.is_authenticated and hasattr(self.request.user, 'role') and self.request.user.role == 'admin':
            return Announcement.objects.select_related('created_by').all()
        return Announcement.objects.filter(is_active=True).select_related('created_by')
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.select_related('application', 'application__user', 'application__service').all()  # Optimize with select_related
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Payment.objects.select_related('application', 'application__user', 'application__service').all()
        # Users can only see their own payments
        return Payment.objects.select_related('application', 'application__user', 'application__service').filter(application__user=user)
    
    def get_permissions(self):
        # Allow users to create payments for their own applications
        if self.action in ['list', 'retrieve', 'create']:
            return [permissions.IsAuthenticated()]
        # Only admins can update/delete payments
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAdminUser()]
        return [permissions.IsAuthenticated()]
    
    def perform_create(self, serializer):
        """Ensure users can only create payments for their own applications"""
        user = self.request.user
        application_id = self.request.data.get('application')
        
        # Verify the application belongs to the user (unless admin)
        if user.role != 'admin':
            try:
                application = UserApplication.objects.select_related('user').get(application_id=application_id)  # Optimize FK lookup
                if application.user != user:
                    raise PermissionDenied("You can only create payments for your own applications.")
            except UserApplication.DoesNotExist:
                raise ValidationError("Application not found.")
        
        serializer.save()
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsAdminUser])
    def mark_completed(self, request, pk=None):
        """Admin action to mark payment as completed"""
        payment = self.get_object()
        payment.payment_status = 'Completed'
        payment.payment_date = timezone.now()
        payment.save()
        
        # Send notification email
        if payment.application.user.email:
            send_mail(
                f"Payment Confirmed - {payment.application.service.service_name}",
                f"Hello {payment.application.user.full_name},\n\n"
                f"Your payment of NPR {payment.amount} has been confirmed.\n"
                f"Payment Method: {payment.payment_method}\n"
                f"Transaction ID: {payment.transaction_id or 'N/A'}\n\n"
                f"Thank you!",
                None,
                [payment.application.user.email]
            )
        
        return Response({
            'success': True,
            'message': 'Payment marked as completed',
            'payment': PaymentSerializer(payment).data
        })
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated, IsAdminUser])
    def statistics(self, request):
        """Get payment statistics for admin dashboard"""
        total_payments = Payment.objects.count()
        completed_payments = Payment.objects.filter(payment_status='Completed').count()
        pending_payments = Payment.objects.filter(payment_status='Pending').count()
        total_revenue = Payment.objects.filter(payment_status='Completed').aggregate(
            total=models.Sum('amount')
        )['total'] or 0
        
        return Response({
            'total_payments': total_payments,
            'completed_payments': completed_payments,
            'pending_payments': pending_payments,
            'total_revenue': float(total_revenue),
        })


class PaymentSettingsViewSet(viewsets.ModelViewSet):
    queryset = PaymentSettings.objects.all()
    serializer_class = PaymentSettingsSerializer
    
    def get_permissions(self):
        # Allow anyone to view payment settings (for QR code, UPI ID)
        if self.action in ['list', 'retrieve', 'active']:
            return [permissions.AllowAny()]
        # Only admins can create, update, delete
        return [permissions.IsAuthenticated(), IsAdminUser()]
    
    def get_queryset(self):
        # Only return active payment settings
        return PaymentSettings.objects.filter(is_active=True)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny()])
    def active(self, request):
        """Get the active payment settings for users"""
        settings = PaymentSettings.objects.filter(is_active=True).first()
        if settings:
            serializer = self.get_serializer(settings)
            return Response(serializer.data)
        return Response({'detail': 'No active payment settings found'}, status=404)
