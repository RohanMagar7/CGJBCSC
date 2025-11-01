from django.db import models

# Create your models here.
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
try:
    # djongo provides an ObjectIdField for Mongo-like primary keys
    from djongo.models import ObjectIdField
except Exception:
    # Fallback to AutoField if djongo isn't available in the environment
    ObjectIdField = None
from django.core.exceptions import ValidationError
from django.db.models.signals import post_save
from django.dispatch import receiver
import logging

logger = logging.getLogger(__name__)

# -------------------------
# User Manager
# -------------------------
class UserManager(BaseUserManager):
    def create_user(self, username, phone_number, password=None, **extra_fields):
        if not username:
            raise ValueError("Username required")
        user = self.model(username=username, phone_number=phone_number, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, phone_number, password=None, **extra_fields):
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(username, phone_number, password, **extra_fields)

# -------------------------
# User Model
# -------------------------
class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('user', 'User'),
        ('admin', 'Admin'),
    )
    # Use AutoField for SQLite compatibility
    user_id = models.AutoField(primary_key=True, editable=False)
    full_name = models.CharField(max_length=100, db_index=True)  # Index for name searches
    username = models.CharField(max_length=50, unique=True, db_index=True)  # Index for login
    # Make email and phone unique so duplicates are prevented at the DB level
    email = models.EmailField(blank=True, null=True, unique=True, db_index=True)  # Index for email lookups
    phone_number = models.CharField(max_length=15, unique=True, db_index=True)  # Index for phone searches
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user', db_index=True)  # Index for role filtering
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True, db_index=True)  # Index for active user queries
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)  # Index for date filtering

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['phone_number']

    objects = UserManager()

    @property
    def id(self):
        """Alias for user_id to maintain compatibility with Django and JWT"""
        return self.user_id

    def __str__(self):
        return self.username
    
    class Meta:
        indexes = [
            models.Index(fields=['username', 'is_active']),  # Composite index for active user login
            models.Index(fields=['role', 'is_active']),  # Composite index for role-based queries
            models.Index(fields=['-created_at']),  # Index for recent users
        ]

# -------------------------
# Services
# -------------------------
class Service(models.Model):
    service_id = models.AutoField(primary_key=True, editable=False)
    service_name = models.CharField(max_length=100, db_index=True)  # Index for name searches
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Service price in NPR", db_index=True)  # Index for price filtering
    processing_days = models.PositiveIntegerField(default=7, help_text="Number of days to process the service", db_index=True)  # Index for processing time queries
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.service_name} - NPR {self.price}"
    
    class Meta:
        ordering = ['service_name']
        indexes = [
            models.Index(fields=['service_name', 'price']),  # Composite index for name-price queries
            models.Index(fields=['-created_at']),  # Index for recent services
        ]

# -------------------------
# Required Documents for Services
# -------------------------
class RequiredDocument(models.Model):
    required_doc_id = models.AutoField(primary_key=True, editable=False)
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='required_documents', db_index=True)  # Index for FK lookups
    document_name = models.CharField(max_length=200, help_text="Name of the required document (e.g., 'Citizenship Certificate')", db_index=True)
    description = models.TextField(blank=True, help_text="Additional instructions for this document")
    is_mandatory = models.BooleanField(default=True, help_text="Is this document mandatory?", db_index=True)  # Index for mandatory filtering
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    def __str__(self):
        return f"{self.service.service_name} - {self.document_name}"
    
    class Meta:
        ordering = ['service', 'document_name']
        unique_together = ['service', 'document_name']
        indexes = [
            models.Index(fields=['service', 'is_mandatory']),  # Composite index for service mandatory docs
            models.Index(fields=['-created_at']),
        ]

# -------------------------
# User Applications
# -------------------------
class UserApplication(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Completed', 'Completed')
    )
    application_id = models.AutoField(primary_key=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True)  # Index for user queries
    service = models.ForeignKey(Service, on_delete=models.CASCADE, db_index=True)  # Index for service queries
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Pending', db_index=True)  # Index for status filtering
    reject_reason = models.TextField(blank=True, null=True)
    submitted_at = models.DateTimeField(auto_now_add=True, db_index=True)  # Index for date filtering
    updated_at = models.DateTimeField(auto_now=True, db_index=True)  # Index for recent updates
    
    class Meta:
        ordering = ['-submitted_at']  # Default ordering for better performance
        indexes = [
            models.Index(fields=['user', 'status']),  # Composite index for user applications by status
            models.Index(fields=['service', 'status']),  # Composite index for service applications by status
            models.Index(fields=['status', '-submitted_at']),  # Composite index for status-based date queries
            models.Index(fields=['-updated_at']),  # Index for recently updated applications
        ]
    
    def __str__(self):
        return f"Application #{self.application_id} - {self.user.username} - {self.service.service_name}"

# -------------------------
# Payment Model
# -------------------------
# -------------------------
# Payment Settings (Global)
# -------------------------
class PaymentSettings(models.Model):
    """Global payment settings for UPI/QR code"""
    settings_id = models.AutoField(primary_key=True, editable=False)
    upi_id = models.CharField(max_length=100, blank=True, null=True, help_text="UPI ID for payments (e.g., merchant@paytm)", db_index=True)
    upi_number = models.CharField(max_length=20, blank=True, null=True, help_text="UPI Mobile Number", db_index=True)
    qr_code_image = models.ImageField(upload_to='payment_qr/', blank=True, null=True, help_text="QR Code Image for UPI Payment")
    is_active = models.BooleanField(default=True, db_index=True)  # Index for active settings lookup
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Payment Settings - UPI: {self.upi_id or 'Not Set'}"
    
    class Meta:
        verbose_name = "Payment Settings"
        verbose_name_plural = "Payment Settings"
        indexes = [
            models.Index(fields=['is_active', '-created_at']),  # Composite index for active settings
        ]

class Payment(models.Model):
    PAYMENT_STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Completed', 'Completed'),
        ('Failed', 'Failed'),
        ('Refunded', 'Refunded'),
    )
    
    PAYMENT_METHOD_CHOICES = (
        ('Cash', 'Cash'),
        ('UPI', 'UPI'),
        ('QR', 'QR Code'),
    )
    
    payment_id = models.AutoField(primary_key=True, editable=False)
    application = models.OneToOneField(UserApplication, on_delete=models.CASCADE, related_name='payment', db_index=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, help_text="Payment amount in NPR", db_index=True)  # Index for amount queries
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='Cash', db_index=True)  # Index for method filtering
    payment_status = models.CharField(max_length=10, choices=PAYMENT_STATUS_CHOICES, default='Pending', db_index=True)  # Index for status filtering
    transaction_id = models.CharField(max_length=100, blank=True, null=True, help_text="External transaction ID from payment gateway", db_index=True)  # Index for transaction lookups
    payment_date = models.DateTimeField(blank=True, null=True, db_index=True)  # Index for date filtering
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)
    notes = models.TextField(blank=True, null=True, help_text="Additional payment notes")
    payment_link_sent = models.BooleanField(default=False, help_text="Whether payment details have been sent to user", db_index=True)
    payment_link_sent_at = models.DateTimeField(blank=True, null=True, help_text="When payment details were sent")
    
    def __str__(self):
        return f"Payment #{self.payment_id} - {self.application.service.service_name} - NPR {self.amount}"
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['payment_status', '-created_at']),  # Composite index for status-based queries
            models.Index(fields=['payment_method', 'payment_status']),  # Composite index for method-status queries
            models.Index(fields=['-payment_date']),  # Index for payment date sorting
            models.Index(fields=['transaction_id']),  # Index for transaction lookup
        ]

# -------------------------
# File Validation
# -------------------------
def validate_file(file):
    max_size = 250 * 1024  # 250KB
    allowed_types = ['application/pdf', 'image/jpeg', 'image/png']
    if file.size > max_size:
        raise ValidationError("File too large. Maximum file size is 250KB.")
    if file.content_type not in allowed_types:
        raise ValidationError("Unsupported file type. Only PDF, JPEG, PNG allowed.")

# -------------------------
# User Documents
# -------------------------
class UserDocument(models.Model):
    document_id = models.AutoField(primary_key=True, editable=False)
    application = models.ForeignKey(UserApplication, on_delete=models.CASCADE, related_name='documents', db_index=True)  # Index for FK lookups
    required_document = models.ForeignKey(RequiredDocument, on_delete=models.CASCADE, null=True, blank=True, 
                                         help_text="Link to the required document type", db_index=True)  # Index for FK lookups
    document_name = models.CharField(max_length=200, default="Document", help_text="Name of the document", db_index=True)  # Index for name searches
    file_path = models.FileField(upload_to='documents/', validators=[validate_file])
    uploaded_at = models.DateTimeField(auto_now_add=True, db_index=True)  # Index for date filtering
    
    def __str__(self):
        return f"{self.application.user.username} - {self.document_name}"
    
    class Meta:
        ordering = ['-uploaded_at']
        indexes = [
            models.Index(fields=['application', '-uploaded_at']),  # Composite index for application documents
            models.Index(fields=['required_document', '-uploaded_at']),  # Composite index for document type
        ]

# -------------------------
# Final Documents (Admin)
# -------------------------
class FinalDocument(models.Model):
    final_doc_id = models.AutoField(primary_key=True, editable=False)
    application = models.ForeignKey(UserApplication, on_delete=models.CASCADE, db_index=True)  # Index for FK lookups
    file_path = models.FileField(upload_to='final_documents/', validators=[validate_file])
    uploaded_at = models.DateTimeField(auto_now_add=True, db_index=True)  # Index for date filtering
    
    class Meta:
        ordering = ['-uploaded_at']
        indexes = [
            models.Index(fields=['application', '-uploaded_at']),  # Composite index for application final docs
        ]

# -------------------------
# Signals: Auto update & email
# -------------------------
@receiver(post_save, sender=FinalDocument)
def update_application_status(sender, instance, created, **kwargs):
    if created:
        app = instance.application
        app.status = 'Completed'
        app.save()
        # Email suppressed - log instead
        if app.user.email:
            logger.info("Suppressed email (application completed) to=%s subject=%s body=%s",
                        app.user.email,
                        f"Your application for {app.service.service_name} is completed",
                        f"Hello {app.user.full_name},\nYour application is COMPLETED.")

# -------------------------
# Announcement Model
# -------------------------
class Announcement(models.Model):
    TYPE_CHOICES = (
        ('info', 'Info'),
        ('success', 'Success'),
        ('warning', 'Warning'),
        ('error', 'Error'),
    )
    
    title = models.CharField(max_length=200, db_index=True)  # Index for title searches
    content = models.TextField()
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='info', db_index=True)  # Index for type filtering
    is_active = models.BooleanField(default=True, db_index=True)  # Index for active filtering
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)  # Index for date filtering
    updated_at = models.DateTimeField(auto_now=True, db_index=True)  # Index for recent updates
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, db_index=True)  # Index for FK lookups
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_active', '-created_at']),  # Composite index for active announcements
            models.Index(fields=['type', '-created_at']),  # Composite index for type-based queries
            models.Index(fields=['created_by', '-created_at']),  # Composite index for user announcements
        ]
    
    def __str__(self):
        return self.title


# -------------------------
# Government Scheme Model
# -------------------------
class GovScheme(models.Model):
    CATEGORY_CHOICES = (
        ('Education', 'Education'),
        ('Health', 'Health'),
        ('Agriculture', 'Agriculture'),
        ('Employment', 'Employment'),
        ('Housing', 'Housing'),
        ('Business', 'Business'),
        ('Social Welfare', 'Social Welfare'),
    )

    scheme_id = models.AutoField(primary_key=True, editable=False)
    name = models.CharField(max_length=255, db_index=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Social Welfare', db_index=True)
    description = models.TextField(blank=True)
    eligibility = models.TextField(blank=True)
    benefits = models.TextField(blank=True)
    # Store lists as JSON for documents and steps
    try:
        JSONField = models.JSONField
    except AttributeError:
        JSONField = None

    if JSONField:
        documents = JSONField(default=list, blank=True)
        how_to_apply = JSONField(default=list, blank=True)
    else:
        # Fallback to TextField storing JSON string (rare, modern Django should have JSONField)
        documents = models.TextField(blank=True, default='[]')
        how_to_apply = models.TextField(blank=True, default='[]')

    official_website = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_active', '-created_at']),
            models.Index(fields=['category', 'is_active']),
        ]

    def __str__(self):
        return self.name

    @property
    def id(self):
        """Alias to match frontend expectations (scheme.id)"""
        return self.scheme_id


# -------------------------
# Gopinath Scheme Application
# -------------------------
class GopinathApplication(models.Model):
    APPLICATION_STATUS = (
        ('Submitted', 'Submitted'),
        ('Under Review', 'Under Review'),
        ('Accepted', 'Accepted'),
        ('Rejected', 'Rejected'),
    )

    app_id = models.AutoField(primary_key=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, db_index=True)

    # Personal Details
    full_name = models.CharField(max_length=200, db_index=True)
    dob = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, blank=True)
    mobile = models.CharField(max_length=15, db_index=True)
    email = models.EmailField(blank=True, null=True)
    aadhaar = models.CharField(max_length=20, blank=True, null=True, db_index=True)
    passport_photo = models.FileField(upload_to='schemes/gopinath/photos/', validators=[validate_file], null=True, blank=True)

    # Educational Details
    college_name = models.CharField(max_length=255, blank=True)
    college_address = models.TextField(blank=True)
    course = models.CharField(max_length=200, blank=True)
    study_year = models.CharField(max_length=50, blank=True)
    college_id_number = models.CharField(max_length=100, blank=True)
    college_id_card = models.FileField(upload_to='schemes/gopinath/college_id/', validators=[validate_file], null=True, blank=True)

    # Residence Details
    current_address = models.TextField(blank=True)
    native_place = models.CharField(max_length=255, blank=True)
    residence_type = models.CharField(max_length=50, blank=True)  # hostel/room/rented
    residence_name_address = models.TextField(blank=True)

    # Scheme Details
    ration_card_number = models.CharField(max_length=100, blank=True)
    ration_card_type = models.CharField(max_length=50, blank=True)
    veg_nonveg = models.CharField(max_length=20, blank=True)
    ration_card_file = models.FileField(upload_to='schemes/gopinath/ration_card/', validators=[validate_file], null=True, blank=True)

    # Bank Details
    bank_name = models.CharField(max_length=200, blank=True)
    branch_name = models.CharField(max_length=200, blank=True)
    account_number = models.CharField(max_length=64, blank=True)
    ifsc = models.CharField(max_length=20, blank=True)
    bank_passbook = models.FileField(upload_to='schemes/gopinath/bank_passbook/', validators=[validate_file], null=True, blank=True)

    # Other attachments
    aadhaar_file = models.FileField(upload_to='schemes/gopinath/aadhaar/', validators=[validate_file], null=True, blank=True)
    fee_residence_proof = models.FileField(upload_to='schemes/gopinath/proofs/', validators=[validate_file], null=True, blank=True)
    last_marksheet = models.FileField(upload_to='schemes/gopinath/marksheets/', validators=[validate_file], null=True, blank=True)

    # Declarations
    declaration = models.BooleanField(default=False)
    signature = models.FileField(upload_to='schemes/gopinath/signatures/', validators=[validate_file], null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True, db_index=True)
    status = models.CharField(max_length=20, choices=APPLICATION_STATUS, default='Submitted', db_index=True)

    class Meta:
        ordering = ['-submitted_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['mobile', 'aadhaar']),
            models.Index(fields=['-submitted_at']),
        ]

    def __str__(self):
        return f"GopinathApplication #{self.app_id} - {self.full_name}"
