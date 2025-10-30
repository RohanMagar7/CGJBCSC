from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions, status as http_status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
import logging

logger = logging.getLogger(__name__)
from django.utils import timezone
from django.db import models
from django.conf import settings
import os
import hmac
import hashlib
try:
    import razorpay
except Exception:
    razorpay = None
from .models import User, Service, UserApplication, UserDocument, FinalDocument, Announcement, Payment, RequiredDocument, PaymentSettings, GovScheme
from .serializers import (UserSerializer, ServiceSerializer, UserApplicationSerializer, 
                          UserDocumentSerializer, FinalDocumentSerializer, AnnouncementSerializer, 
                          PaymentSerializer, RequiredDocumentSerializer, PaymentSettingsSerializer,
                          GovSchemeSerializer)
from .permissions import IsAdminUser, IsOwnerOrAdmin
from .backup_manager import backup_manager

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def create(self, request, *args, **kwargs):
        """Override create to log incoming registration data and validation errors
        so failures are visible in server logs for easier debugging.
        """
        # Avoid logging sensitive information like passwords in plaintext
        data_to_log = dict(request.data)
        if 'password' in data_to_log:
            data_to_log['password'] = '********'

        logger.info("Registration attempt: %s", data_to_log)

        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logger.error("Registration validation failed: %s", serializer.errors)
            return Response(serializer.errors, status=400)

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        logger.info("Registration successful for username=%s", serializer.data.get('username'))
        return Response(serializer.data, status=201, headers=headers)
    
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

    def destroy(self, request, *args, **kwargs):
        """
        Delete an application. Users can delete their own applications, admins can delete any.
        Related documents and payments will be cascade deleted automatically.
        """
        application = self.get_object()
        app_id = application.application_id
        service_name = application.service.service_name
        user_name = application.user.username
        
        # Log the deletion
        logger.info(
            "Application deletion: app_id=%s, service=%s, user=%s, deleted_by=%s (role=%s)",
            app_id, service_name, user_name, request.user.username, request.user.role
        )
        
        # Perform deletion (CASCADE will handle related documents and payments)
        self.perform_destroy(application)
        
        return Response(
            {
                'success': True,
                'message': f'Application #{app_id} for {service_name} has been deleted successfully.'
            },
            status=200
        )

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
                    # Email sending suppressed in production deployment by design.
                    logger.info("Suppressed email (application approved) to=%s subject=%s body=%s",
                                app.user.email,
                                f"✅ Application Approved - Payment Required for {app.service.service_name}",
                                email_body)
                
                return Response({
                    'success': True,
                    'status': app.status,
                    'payment_details_sent': True,
                    'payment_settings': PaymentSettingsSerializer(payment_settings, context={'request': request}).data if payment_settings else None
                })
            except Payment.DoesNotExist:
                pass
        elif status == 'Rejected' and app.user.email:
            logger.info("Suppressed email (application rejected) to=%s subject=%s body=%s",
                        app.user.email,
                        f"Application Status: {status}",
                        f"Hello {app.user.full_name},\nYour application for {app.service.service_name} is {status}\n{('Reason: '+reason) if status=='Rejected' else ''}")
        
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


class GovSchemeViewSet(viewsets.ModelViewSet):
    """CRUD for government schemes used by admin UI and public listing.
    - Admins: full access (list/retrieve/create/update/delete)
    - Public users: list/retrieve only (only active schemes)
    """
    # Provide a queryset so DRF router can automatically determine basename
    queryset = GovScheme.objects.all().order_by('-created_at')
    serializer_class = GovSchemeSerializer

    def get_permissions(self):
        # POST/PUT/PATCH/DELETE only allowed for admin users
        if self.request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated(), IsAdminUser()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        # Import model here to avoid top-level import cycles
        from .models import GovScheme
        user = self.request.user
        if user.is_authenticated and hasattr(user, 'role') and user.role == 'admin':
            return GovScheme.objects.all().order_by('-created_at')
        return GovScheme.objects.filter(is_active=True).order_by('-created_at')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context


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
        
        # Send notification email (suppressed)
        if payment.application.user.email:
            logger.info("Suppressed email (payment confirmed) to=%s subject=%s body=%s",
                        payment.application.user.email,
                        f"Payment Confirmed - {payment.application.service.service_name}",
                        f"Hello {payment.application.user.full_name},\n\n"
                        f"Your payment of NPR {payment.amount} has been confirmed.\n"
                        f"Payment Method: {payment.payment_method}\n"
                        f"Transaction ID: {payment.transaction_id or 'N/A'}\n\n"
                        f"Thank you!")
        
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

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def create_razorpay_order(self, request):
        """Create a Razorpay order and return order details and public key id."""
        application_id = request.data.get('application')
        amount = request.data.get('amount')

        if not application_id or amount is None:
            return Response({'error': 'application and amount are required'}, status=400)

        try:
            amount_int = int(float(amount) * 100)
        except Exception:
            return Response({'error': 'Invalid amount'}, status=400)

        # Validate application ownership for non-admins
        user = request.user
        try:
            application = UserApplication.objects.get(application_id=application_id)
            if user.role != 'admin' and application.user != user:
                return Response({'error': 'Permission denied for application'}, status=403)
        except UserApplication.DoesNotExist:
            return Response({'error': 'Application not found'}, status=404)

        # Ensure razorpay is installed and keys configured
        key_id = os.environ.get('RAZORPAY_KEY_ID') or getattr(settings, 'RAZORPAY_KEY_ID', None)
        key_secret = os.environ.get('RAZORPAY_KEY_SECRET') or getattr(settings, 'RAZORPAY_KEY_SECRET', None)
        if not key_id or not key_secret or razorpay is None:
            return Response({'error': 'Razorpay not configured on server'}, status=500)

        client = razorpay.Client(auth=(key_id, key_secret))
        order_payload = {
            'amount': amount_int,
            'currency': 'INR',
            'receipt': f'application_{application_id}',
            'payment_capture': 1,
        }
        logger.info("Creating Razorpay order: user=%s application=%s payload=%s", getattr(user, 'username', user.id if hasattr(user,'id') else None), application_id, {k: v for k, v in order_payload.items() if k != 'amount' or True})
        try:
            order = client.order.create(order_payload)
            logger.info('Razorpay order created: order_id=%s application=%s', order.get('id'), application_id)
            return Response({'key_id': key_id, 'order': order})
        except Exception as e:
            # Log exception with traceback and include type for easier debugging
            import traceback as _traceback
            tb = _traceback.format_exc()
            logger.error('Razorpay order creation failed for application=%s user=%s payload=%s error=%s\n%s',
                         application_id,
                         getattr(user, 'username', str(user)),
                         order_payload,
                         repr(e),
                         tb)
            # Return helpful diagnostic (avoid leaking secrets)
            return Response({'error': 'Failed to create Razorpay order', 'details': str(e), 'type': type(e).__name__}, status=500)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def verify_razorpay_payment(self, request):
        """Verify Razorpay payment signature and mark payment completed."""
        payment_id = request.data.get('razorpay_payment_id')
        order_id = request.data.get('razorpay_order_id')
        signature = request.data.get('razorpay_signature')
        application_id = request.data.get('application')

        if not all([payment_id, order_id, signature, application_id]):
            return Response({'error': 'Missing verification fields'}, status=400)

        key_secret = os.environ.get('RAZORPAY_KEY_SECRET') or getattr(settings, 'RAZORPAY_KEY_SECRET', None)
        if not key_secret:
            return Response({'error': 'Razorpay secret not configured'}, status=500)

        # Verify HMAC SHA256 signature
        msg = f"{order_id}|{payment_id}"
        generated_signature = hmac.new(key_secret.encode(), msg.encode(), hashlib.sha256).hexdigest()
        if generated_signature != signature:
            return Response({'error': 'Invalid signature'}, status=400)

        try:
            application = UserApplication.objects.get(application_id=application_id)
            payment = Payment.objects.get(application=application)
            payment.transaction_id = payment_id
            payment.payment_status = 'Completed'
            payment.payment_date = timezone.now()
            payment.payment_method = 'Razorpay'
            payment.save()

            # Move the related application into Processing since payment completed
            try:
                application.status = 'Processing'
                application.save()
            except Exception:
                logger.exception('Failed to update application status to Processing after payment')

            return Response({'success': True, 'payment': PaymentSerializer(payment).data, 'application_status': application.status})
        except Exception as e:
            logger.exception('Error updating payment after Razorpay verification')
            return Response({'error': 'Failed to update payment', 'details': str(e)}, status=500)


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
        user = self.request.user
        # Admin can see all payment settings
        if user.is_authenticated and hasattr(user, 'role') and user.role == 'admin':
            return PaymentSettings.objects.all()
        # Public users only see active payment settings
        return PaymentSettings.objects.filter(is_active=True)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context
    
    def create(self, request, *args, **kwargs):
        """Create new payment settings"""
        logger.info("Creating payment settings by admin: %s", request.user.username)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=201, headers=headers)
    
    def update(self, request, *args, **kwargs):
        """Update payment settings (including QR code)"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        logger.info(
            "Updating payment settings ID=%s by admin: %s",
            instance.settings_id, request.user.username
        )
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """Delete payment settings"""
        instance = self.get_object()
        settings_id = instance.settings_id
        
        logger.info(
            "Deleting payment settings ID=%s by admin: %s",
            settings_id, request.user.username
        )
        
        self.perform_destroy(instance)
        
        return Response(
            {
                'success': True,
                'message': f'Payment settings #{settings_id} deleted successfully.'
            },
            status=200
        )
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny()])
    def active(self, request):
        """Get the active payment settings for users"""
        settings = PaymentSettings.objects.filter(is_active=True).first()
        if settings:
            serializer = self.get_serializer(settings)
            return Response(serializer.data)
        return Response({'detail': 'No active payment settings found'}, status=404)


class BackupViewSet(viewsets.ViewSet):
    """
    Admin-only endpoint for database backup management
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    @action(detail=False, methods=['post'], url_path='create')
    def create_backup(self, request):
        """
        Create a new database backup and upload to Dropbox
        POST /api/backups/create/
        """
        logger.info(f"Manual backup initiated by admin: {request.user.username}")
        
        success, message, file_info = backup_manager.create_backup()
        
        if success:
            return Response({
                'success': True,
                'message': message,
                'backup': file_info
            }, status=http_status.HTTP_201_CREATED)
        else:
            return Response({
                'success': False,
                'message': message
            }, status=http_status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'], url_path='list')
    def list_backups(self, request):
        """
        List all available backups in Dropbox
        GET /api/backups/list/
        """
        success, backups = backup_manager.list_backups()
        
        if success:
            return Response({
                'success': True,
                'count': len(backups),
                'backups': backups
            })
        else:
            return Response({
                'success': False,
                'message': 'Failed to list backups'
            }, status=http_status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'], url_path='cleanup')
    def cleanup_old(self, request):
        """
        Delete old backups, keeping only the most recent ones
        POST /api/backups/cleanup/
        """
        keep_count = request.data.get('keep_count', 7)
        
        logger.info(f"Backup cleanup initiated by admin: {request.user.username}")
        
        success, deleted_count = backup_manager.delete_old_backups(keep_count=keep_count)
        
        if success:
            return Response({
                'success': True,
                'message': f'Deleted {deleted_count} old backup(s)',
                'deleted_count': deleted_count
            })
        else:
            return Response({
                'success': False,
                'message': 'Failed to cleanup backups'
            }, status=http_status.HTTP_500_INTERNAL_SERVER_ERROR)

