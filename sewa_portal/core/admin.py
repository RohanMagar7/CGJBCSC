from django.contrib import admin
from .models import User, Service, UserApplication, UserDocument, FinalDocument, Announcement, Payment, RequiredDocument, PaymentSettings, GovScheme, GopinathApplication
from django.utils.safestring import mark_safe

# Register your models here.
admin.site.register(User)

class RequiredDocumentInline(admin.TabularInline):
    model = RequiredDocument
    extra = 1
    fields = ['document_name', 'description', 'is_mandatory']

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['service_id', 'service_name', 'price', 'processing_days', 'created_at']
    list_filter = ['processing_days', 'created_at']
    search_fields = ['service_name', 'description']
    ordering = ['service_name']
    inlines = [RequiredDocumentInline]

@admin.register(RequiredDocument)
class RequiredDocumentAdmin(admin.ModelAdmin):
    list_display = ['required_doc_id', 'service', 'document_name', 'is_mandatory', 'created_at']
    list_filter = ['is_mandatory', 'service', 'created_at']
    search_fields = ['document_name', 'service__service_name']
    ordering = ['service', 'document_name']

admin.site.register(UserApplication)
admin.site.register(UserDocument)
admin.site.register(FinalDocument)
admin.site.register(Announcement)


@admin.register(GopinathApplication)
class GopinathApplicationAdmin(admin.ModelAdmin):
    list_display = ['app_id', 'full_name', 'mobile', 'email', 'status', 'submitted_at']
    list_filter = ['status', 'submitted_at']
    search_fields = ['full_name', 'mobile', 'email', 'aadhaar']
    readonly_fields = ['submitted_at', 'signature_preview']
    ordering = ['-submitted_at']
    actions = ['approve_applications', 'reject_applications', 'mark_under_review']

    def approve_applications(self, request, queryset):
        """Admin action to mark selected applications as Accepted and send email notification."""
        from django.core.mail import send_mail
        updated = 0
        for app in queryset:
            app.status = 'Accepted'
            app.save()
            # send notification email if email provided
            if app.email:
                try:
                    send_mail(
                        'आपली नोंदणी मंजूर झाली आहे - गोपीनाथ योजना',
                        f"नमस्कार {app.full_name},\n\nआपली नोंदणी मंजूर करण्यात आली आहे.\n\nधन्यवाद,\nगोपीनाथ टीम",
                        None,
                        [app.email],
                        fail_silently=True,
                    )
                except Exception:
                    # Fail silently to avoid blocking admin action; errors are logged by mail backend
                    pass
            updated += 1
        self.message_user(request, f"Marked {updated} application(s) as Accepted and notified applicants (when email present).")
    approve_applications.short_description = 'Mark selected applications as Accepted and notify'

    def reject_applications(self, request, queryset):
        """Admin action to mark selected applications as Rejected."""
        updated = queryset.update(status='Rejected')
        self.message_user(request, f"Marked {updated} application(s) as Rejected.")
    reject_applications.short_description = 'Mark selected applications as Rejected'

    def mark_under_review(self, request, queryset):
        updated = queryset.update(status='Under Review')
        self.message_user(request, f"Marked {updated} application(s) as Under Review.")
    mark_under_review.short_description = 'Mark selected applications as Under Review'

    def signature_preview(self, obj):
        """Return an HTML preview / link to the uploaded signature file (if present)."""
        try:
            if obj.signature and hasattr(obj.signature, 'url'):
                url = obj.signature.url
                # If it's an image, render an <img>, otherwise return a download link
                if str(obj.signature.name).lower().endswith(('.png', '.jpg', '.jpeg')):
                    return mark_safe(f'<a href="{url}" target="_blank"><img src="{url}" style="max-height:120px;"/></a>')
                return mark_safe(f'<a href="{url}" target="_blank">Download signature</a>')
        except Exception:
            return "-"
        return "-"
    signature_preview.short_description = 'Signature'

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['payment_id', 'get_user', 'get_service', 'amount', 'payment_method', 'payment_status', 'payment_date', 'created_at']
    list_filter = ['payment_status', 'payment_method', 'payment_date', 'created_at']
    search_fields = ['transaction_id', 'application__user__full_name', 'application__service__service_name']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
    
    def get_user(self, obj):
        return obj.application.user.full_name
    get_user.short_description = 'User'
    get_user.admin_order_field = 'application__user__full_name'
    
    def get_service(self, obj):
        return obj.application.service.service_name
    get_service.short_description = 'Service'
    get_service.admin_order_field = 'application__service__service_name'

@admin.register(PaymentSettings)
class PaymentSettingsAdmin(admin.ModelAdmin):
    list_display = ['settings_id', 'upi_id', 'upi_number', 'is_active', 'updated_at']
    fields = ('upi_id', 'upi_number', 'qr_code_image', 'is_active')
    
    def has_add_permission(self, request):
        # Only allow one PaymentSettings instance
        return not PaymentSettings.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        # Don't allow deletion of payment settings
        return False


# Admin registration for GovScheme
@admin.register(GovScheme)
class GovSchemeAdmin(admin.ModelAdmin):
    list_display = ['scheme_id', 'name', 'category', 'is_active', 'created_at']
    list_filter = ['category', 'is_active', 'created_at']
    search_fields = ['name', 'description', 'eligibility', 'benefits']
    ordering = ['-created_at']
