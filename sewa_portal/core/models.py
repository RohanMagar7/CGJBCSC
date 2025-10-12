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
from django.core.mail import send_mail

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
    full_name = models.CharField(max_length=100)
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(blank=True, null=True)
    phone_number = models.CharField(max_length=15)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['phone_number']

    objects = UserManager()

    @property
    def id(self):
        """Alias for user_id to maintain compatibility with Django and JWT"""
        return self.user_id

    def __str__(self):
        return self.username

# -------------------------
# Services
# -------------------------
class Service(models.Model):
    service_id = models.AutoField(primary_key=True, editable=False)
    service_name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

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
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Pending')
    reject_reason = models.TextField(blank=True, null=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

# -------------------------
# File Validation
# -------------------------
def validate_file(file):
    max_size = 5 * 1024 * 1024  # 5MB
    allowed_types = ['application/pdf', 'image/jpeg', 'image/png']
    if file.size > max_size:
        raise ValidationError("File too large. Max size 5MB.")
    if file.content_type not in allowed_types:
        raise ValidationError("Unsupported file type. Only PDF, JPEG, PNG allowed.")

# -------------------------
# User Documents
# -------------------------
class UserDocument(models.Model):
    document_id = models.AutoField(primary_key=True, editable=False)
    application = models.ForeignKey(UserApplication, on_delete=models.CASCADE)
    file_path = models.FileField(upload_to='documents/', validators=[validate_file])
    uploaded_at = models.DateTimeField(auto_now_add=True)

# -------------------------
# Final Documents (Admin)
# -------------------------
class FinalDocument(models.Model):
    final_doc_id = models.AutoField(primary_key=True, editable=False)
    application = models.ForeignKey(UserApplication, on_delete=models.CASCADE)
    file_path = models.FileField(upload_to='final_documents/', validators=[validate_file])
    uploaded_at = models.DateTimeField(auto_now_add=True)

# -------------------------
# Signals: Auto update & email
# -------------------------
@receiver(post_save, sender=FinalDocument)
def update_application_status(sender, instance, created, **kwargs):
    if created:
        app = instance.application
        app.status = 'Completed'
        app.save()
        # Email
        if app.user.email:
            send_mail(
                f"Your application for {app.service.service_name} is completed",
                f"Hello {app.user.full_name},\nYour application is COMPLETED.",
                None, [app.user.email]
            )
