from django.contrib import admin
from .models import User, Service, UserApplication, UserDocument, FinalDocument, Announcement, Payment, RequiredDocument, PaymentSettings, GovScheme

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

@admin.register(GovScheme)
class GovSchemeAdmin(admin.ModelAdmin):
    list_display = ['scheme_id', 'name', 'category', 'is_active', 'created_at', 'created_by']
    list_filter = ['category', 'is_active', 'created_at']
    search_fields = ['name', 'description', 'eligibility', 'benefits']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at', 'created_by']
    
    def save_model(self, request, obj, form, change):
        if not change:  # If creating new object
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
