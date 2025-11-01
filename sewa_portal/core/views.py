from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions, status as http_status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
import logging

logger = logging.getLogger(__name__)
from django.utils import timezone
import os
from django.db import models
from .models import User, Service, UserApplication, UserDocument, FinalDocument, Announcement, Payment, RequiredDocument, PaymentSettings, GovScheme, GopinathApplication
from .serializers import (UserSerializer, ServiceSerializer, UserApplicationSerializer, 
                          UserDocumentSerializer, FinalDocumentSerializer, AnnouncementSerializer, 
                          PaymentSerializer, RequiredDocumentSerializer, PaymentSettingsSerializer,
                          GovSchemeSerializer, GopinathApplicationSerializer)
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail, EmailMessage
from rest_framework.views import APIView
from django.conf import settings
from rest_framework.throttling import SimpleRateThrottle
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


class PasswordResetRequestView(APIView):
    """Accepts { "email": "user@example.com" } and sends a password reset link if a user exists.

    The endpoint does not reveal whether an email exists (generic response), but for debugging
    and usability this implementation logs attempts. The email contains a tokenized link the
    frontend can use to complete the reset.
    """

    permission_classes = [permissions.AllowAny]

    # Throttle class applied to this view to limit password reset requests per IP
    class PasswordResetRateThrottle(SimpleRateThrottle):
        scope = 'password_reset'

        def get_cache_key(self, request, view):
            # Throttle by client IP address
            ident = self.get_ident(request)
            return self.cache_format % {
                'scope': self.scope,
                'ident': ident,
            }

    throttle_classes = [PasswordResetRateThrottle]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        if not email:
            return Response({'email': ['This field is required.']}, status=400)

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            # Don't reveal that the email doesn't exist
            logger.info('Password reset requested for non-existent email: %s', email)
            return Response({'detail': 'If an account with that email exists, a reset link has been sent.'})

        # Generate token and uid
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        # Build reset link for frontend (frontend should implement route to accept uid & token)
        frontend_base = getattr(settings, 'FRONTEND_URL', os.environ.get('FRONTEND_URL', 'http://localhost:5173'))
        reset_path = f"/reset-password?uid={uid}&token={token}"
        reset_link = frontend_base.rstrip('/') + reset_path

        subject = 'Sewa Portal - Password reset request'
        message = f"Hello {user.full_name or user.username},\n\nWe received a request to reset your password.\n\nClick the link below to reset your password (valid for a limited time):\n\n{reset_link}\n\nIf you did not request this, please ignore this email.\n\nThanks,\nSewa Portal Team"

        try:
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=False)
            logger.info('Password reset email sent to %s', user.email)
        except Exception as e:
            logger.exception('Failed to send password reset email to %s: %s', user.email, e)
            return Response({'detail': 'Failed to send reset email'}, status=500)

        return Response({'detail': 'If an account with that email exists, a reset link has been sent.'})


class PasswordResetConfirmView(APIView):
    """Accepts { "uid": "...", "token": "...", "new_password": "..." } and sets new password if token valid."""

    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        uid = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')

        if not uid or not token or not new_password:
            return Response({'detail': 'uid, token and new_password are required.'}, status=400)

        try:
            uid_decoded = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=uid_decoded)
        except Exception:
            return Response({'detail': 'Invalid uid/token.'}, status=400)

        if not default_token_generator.check_token(user, token):
            return Response({'detail': 'Invalid or expired token.'}, status=400)

        # Set new password
        try:
            user.set_password(new_password)
            user.save()
            logger.info('Password reset successful for user id=%s', user.pk)
            return Response({'detail': 'Password has been reset successfully.'})
        except Exception as e:
            logger.exception('Failed to reset password for user id=%s: %s', user.pk, e)
            return Response({'detail': 'Failed to reset password.'}, status=500)

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

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsOwnerOrAdmin])
    def resubmit(self, request, pk=None):
        """Allow an application owner to resubmit a previously rejected application.

        This will:
        - only allow the application owner (or admin) to call it
        - only operate when current status is 'Rejected'
        - optionally validate that all mandatory RequiredDocument items have at least one uploaded UserDocument
        - clear reject_reason and set status to 'Pending'
        """
        app = self.get_object()
        user = request.user

        logger.info("Resubmit attempt: app_id=%s by user=%s (role=%s)", app.application_id, getattr(user, 'username', None), getattr(user, 'role', None))

        # Ownership enforced by permission_classes, but double-check
        if user.role != 'admin' and app.user != user:
            logger.warning("Resubmit permission denied: app_id=%s attempted_by=%s", app.application_id, getattr(user, 'username', None))
            return Response({'detail': 'You do not have permission to resubmit this application.'}, status=403)

        if app.status != 'Rejected':
            logger.info("Resubmit not allowed - status not Rejected: app_id=%s status=%s", app.application_id, app.status)
            return Response({'detail': 'Only rejected applications can be resubmitted.'}, status=400)

        # Optional: verify mandatory documents are present
        validate_docs = request.data.get('validate_documents', True)
        # Add diagnostic logging: record the validate flag, number of uploaded user documents
        try:
            existing_docs_count = UserDocument.objects.filter(application=app).count()
        except Exception:
            existing_docs_count = 'unknown'
        logger.info("Resubmit request keys=%s validate_documents=%s existing_uploaded_docs=%s", list(request.data.keys()), validate_docs, existing_docs_count)
        missing_docs = []
        if validate_docs:
            required_docs = RequiredDocument.objects.filter(service=app.service, is_mandatory=True)
            for rd in required_docs:
                # Check if a UserDocument exists for this application and required_document
                exists = UserDocument.objects.filter(application=app, required_document=rd).exists()
                if not exists:
                    missing_docs.append(rd.document_name)

            if missing_docs:
                logger.info("Resubmit blocked - missing docs for app_id=%s: %s", app.application_id, missing_docs)
                return Response({'detail': 'Missing mandatory documents', 'missing_documents': missing_docs}, status=400)

        # Clear reject reason and set status to Pending
        try:
            app.status = 'Pending'
            app.reject_reason = ''
            app.updated_at = timezone.now()
            app.save()
        except Exception as e:
            logger.exception('Failed to resubmit application id=%s: %s', app.application_id, e)
            return Response({'detail': 'Failed to resubmit application'}, status=500)

        logger.info("Resubmit successful: app_id=%s by user=%s", app.application_id, getattr(user, 'username', None))

        # Return the updated application
        serializer = UserApplicationSerializer(app, context={'request': request})
        return Response({'success': True, 'application': serializer.data})

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


class GopinathApplicationViewSet(viewsets.ModelViewSet):
    """CRUD for Gopinath Scheme applications. Users can create their own application; admins can list and manage."""
    queryset = GopinathApplication.objects.all().select_related('user')
    serializer_class = GopinathApplicationSerializer

    def get_permissions(self):
        # Allow anyone authenticated to create; listing/updating restricted to admin or owner
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        if self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        # attach user if available
        serializer.save(user=self.request.user if self.request.user.is_authenticated else None)

    def create(self, request, *args, **kwargs):
        """Override create to log incoming multipart data (keys + uploaded files) and serializer errors for easier debugging.

        Returns the usual 201 on success or 400 with serializer errors.
        """
        # Log non-sensitive data: keys and file names/sizes (avoid logging file contents or passwords)
        try:
            keys = list(request.data.keys())
        except Exception:
            keys = None

        file_info = {}
        try:
            for k, f in request.FILES.items():
                file_info[k] = {'name': getattr(f, 'name', None), 'size': getattr(f, 'size', None), 'content_type': getattr(f, 'content_type', None)}
        except Exception:
            file_info = 'unavailable'

        logger.info("GopinathApplication create attempt by=%s keys=%s files=%s", getattr(request.user, 'username', None), keys, file_info)

        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            # Log validation errors to server logs for diagnostics
            logger.error("GopinathApplication validation failed for user=%s errors=%s", getattr(request.user, 'username', None), serializer.errors)
            return Response(serializer.errors, status=400)

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        logger.info("GopinathApplication created app_id=%s by=%s", serializer.data.get('app_id'), getattr(request.user, 'username', None))
        return Response(serializer.data, status=201, headers=headers)
    
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


class GopinathApplicationViewSet(viewsets.ModelViewSet):
    """CRUD for Gopinath Scheme applications. Users can create their own application; admins can list and manage."""
    queryset = GopinathApplication.objects.all().select_related('user')
    serializer_class = GopinathApplicationSerializer

    def get_permissions(self):
        # Allow anyone authenticated to create; listing/updating restricted to admin or owner
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        if self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        # attach user if available
        serializer.save(user=self.request.user if self.request.user.is_authenticated else None)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsAdminUser])
    def update_status(self, request, pk=None):
        """Admin action to update the status of a Gopinath application.

        POST payload: { "status": "Accepted" | "Rejected" | "Under Review", "reject_reason": "..." }
        When Accepted, send a notification email to the applicant (if email present).
        """
        app = self.get_object()
        status = request.data.get('status')
        reason = request.data.get('reject_reason', '')

        valid_statuses = [s[0] for s in GopinathApplication.APPLICATION_STATUS]
        if status not in valid_statuses:
            return Response({'error': 'Invalid status'}, status=400)

        app.status = status
        if status == 'Rejected':
            app.reject_reason = reason
        app.save()

        # Send email/notification when accepted or rejected
        try:
            if status == 'Accepted':
                subject = 'आपली नोंदणी मंजूर झाली आहे - गोपीनाथ योजना'
                body = f"नमस्कार {app.full_name},\n\nआपली गोपीनाथ योजना साठी केलेली नोंदणी मंजूर करण्यात आली आहे.\n\nआम्ही लवकरच पुढील सूचना पाठवू.\n\nधन्यवाद,\nगोपीनाथ योजना टीम"
                if app.email:
                    # Email sending is logged (suppressed or routed by actual email backend)
                    send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [app.email], fail_silently=True)
                    logger.info("GopinathApplication accepted email sent to=%s app_id=%s", app.email, app.app_id)
            elif status == 'Rejected' and app.email:
                subject = 'आपली नोंदणी नाकारण्यात आली - गोपीनाथ योजना'
                body = f"नमस्कार {app.full_name},\n\nदुर्दैवाने, आपली नोंदणी नाकारण्यात आली आहे. कारण: {reason}\n\nआपण सुधारणा करून पुन्हा सबमिट करू शकता.\n\nधन्यवाद,\nगोपीनाथ टीम"
                send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [app.email], fail_silently=True)
                logger.info("GopinathApplication rejection email sent to=%s app_id=%s reason=%s", app.email, app.app_id, reason)
        except Exception as e:
            logger.exception('Failed to send notification email for GopinathApplication id=%s: %s', app.app_id, e)

        return Response({'success': True, 'status': app.status})



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

