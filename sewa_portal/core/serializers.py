from rest_framework import serializers
from .models import User, Service, UserApplication, UserDocument, FinalDocument, Announcement, Payment, RequiredDocument, PaymentSettings
import json

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def validate_email(self, value):
        """Ensure email is unique (when provided)."""
        if not value:
            return value
        qs = User.objects.filter(email__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    def validate_phone_number(self, value):
        """Ensure phone number is unique."""
        qs = User.objects.filter(phone_number=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('A user with this phone number already exists.')
        return value

    def create(self, validated_data):
        """
        Create a new user via public registration.
        Always creates a regular 'user' role, never admin.
        Admins must be created via Django admin panel or createsuperuser command.
        """
        password = validated_data.pop('password', None)
        
        # Remove role/staff/superuser from validated_data to prevent manipulation
        validated_data.pop('role', None)
        validated_data.pop('is_staff', None)
        validated_data.pop('is_superuser', None)
        
        # Always create as regular user
        user = User(**validated_data, role='user', is_staff=False, is_superuser=False)
        if password:
            user.set_password(password)
        user.save()
        return user
    
    def update(self, instance, validated_data):
        """
        Update user details. 
        Only admins can update role field via the API (protected in views).
        """
        # Handle password update separately
        password = validated_data.pop('password', None)
        
        # Update role if provided (only admins can do this, protected in view)
        if 'role' in validated_data:
            role = validated_data.get('role')
            if role == 'admin':
                instance.is_staff = True
                instance.is_superuser = True
            else:
                instance.is_staff = False
                instance.is_superuser = False
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update password if provided
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance

class RequiredDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequiredDocument
        fields = ['required_doc_id', 'service', 'document_name', 'description', 'is_mandatory', 'created_at']

class ServiceSerializer(serializers.ModelSerializer):
    required_documents = RequiredDocumentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Service
        fields = ['service_id', 'service_name', 'description', 'price', 'processing_days', 
                  'created_at', 'updated_at', 'required_documents']

class UserDocumentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    required_document_name = serializers.CharField(source='required_document.document_name', read_only=True, allow_null=True)
    
    class Meta:
        model = UserDocument
        fields = ['document_id', 'application', 'required_document', 'document_name', 
                  'required_document_name', 'file_path', 'file_url', 'uploaded_at']

    def get_file_url(self, obj):
        """
        Return the Dropbox temporary URL directly.
        With Dropbox storage, obj.file_path.url returns a Dropbox download link.
        No need to build absolute URI - it's already a full URL.
        """
        if obj.file_path:
            # This returns the Dropbox temporary URL (valid for 4 hours)
            return obj.file_path.url
        return None

class FinalDocumentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    class Meta:
        model = FinalDocument
        fields = ['final_doc_id', 'application', 'file_path', 'file_url', 'uploaded_at']

    def get_file_url(self, obj):
        """
        Return the Dropbox temporary URL directly.
        With Dropbox storage, obj.file_path.url returns a Dropbox download link.
        No need to build absolute URI - it's already a full URL.
        """
        if obj.file_path:
            # This returns the Dropbox temporary URL (valid for 4 hours)
            return obj.file_path.url
        return None

class UserApplicationSerializer(serializers.ModelSerializer):
    documents = UserDocumentSerializer(many=True, read_only=True)
    final_document = FinalDocumentSerializer(many=True, read_only=True, source='finaldocument_set')
    payment = serializers.SerializerMethodField()
    service_name = serializers.CharField(source='service.service_name', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    
    class Meta:
        model = UserApplication
        fields = ['application_id', 'user', 'service', 'service_name', 'user_name', 'status', 
                  'reject_reason', 'submitted_at', 'updated_at', 'documents', 'final_document', 'payment']
    
    def get_payment(self, obj):
        try:
            payment = obj.payment
            return PaymentSerializer(payment).data
        except Payment.DoesNotExist:
            return None

class PaymentSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='application.service.service_name', read_only=True)
    user_name = serializers.CharField(source='application.user.full_name', read_only=True)
    
    class Meta:
        model = Payment
        fields = ['payment_id', 'application', 'amount', 'payment_method', 'payment_status', 
                  'transaction_id', 'payment_date', 'created_at', 'updated_at', 'notes',
                  'service_name', 'user_name', 'payment_link_sent', 'payment_link_sent_at']
        read_only_fields = ['payment_id', 'created_at', 'updated_at']

class PaymentSettingsSerializer(serializers.ModelSerializer):
    qr_code_url = serializers.SerializerMethodField()
    
    class Meta:
        model = PaymentSettings
        fields = ['settings_id', 'upi_id', 'upi_number', 'qr_code_image', 'qr_code_url', 
                  'is_active', 'created_at', 'updated_at']
        read_only_fields = ['settings_id', 'created_at', 'updated_at']
    
    def get_qr_code_url(self, obj):
        """
        Return the Dropbox temporary URL directly.
        With Dropbox storage, obj.qr_code_image.url returns a Dropbox download link.
        No need to build absolute URI - it's already a full URL.
        """
        if obj.qr_code_image:
            # This returns the Dropbox temporary URL (valid for 4 hours)
            return obj.qr_code_image.url
        return None

class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = ['id', 'title', 'content', 'type', 'is_active', 'created_at', 'updated_at', 'created_by']
        read_only_fields = ['created_at', 'updated_at', 'created_by']


class GovSchemeSerializer(serializers.ModelSerializer):
    # Expose `id` to match frontend expectations (alias of scheme_id)
    id = serializers.IntegerField(source='scheme_id', read_only=True)
    howToApply = serializers.SerializerMethodField()
    officialWebsite = serializers.SerializerMethodField()

    class Meta:
        model = None  # set below to avoid forward reference issues
        # fields will be set below after model is imported

    def to_representation(self, instance):
        # Use default representation and then add camelCase aliases
        rep = super().to_representation(instance)
        # Add camelCase aliases that frontend sometimes expects
        rep['howToApply'] = rep.get('how_to_apply') or []
        rep['officialWebsite'] = rep.get('official_website') or rep.get('officialWebsite')
        return rep

    def get_howToApply(self, obj):
        try:
            val = getattr(obj, 'how_to_apply')
            if isinstance(val, str):
                return json.loads(val or '[]')
            return val or []
        except Exception:
            return []

    def get_officialWebsite(self, obj):
        return getattr(obj, 'official_website', None)

    def create(self, validated_data):
        # Accept both camelCase and snake_case from frontend
        # Move howToApply to how_to_apply if present
        data = dict(validated_data)
        if 'howToApply' in self.initial_data:
            data['how_to_apply'] = self.initial_data.get('howToApply')
        if 'officialWebsite' in self.initial_data:
            data['official_website'] = self.initial_data.get('officialWebsite')

        # Handle text fallback for JSONField (if model uses TextField)
        from .models import GovScheme
        if hasattr(GovScheme, 'how_to_apply') and isinstance(GovScheme._meta.get_field('how_to_apply'), type(GovScheme._meta.get_field('how_to_apply'))):
            pass

        # Normalize documents/how_to_apply to JSON/list
        docs = data.get('documents', [])
        how = data.get('how_to_apply', [])
        try:
            if isinstance(docs, str):
                data['documents'] = json.loads(docs)
        except Exception:
            data['documents'] = []
        try:
            if isinstance(how, str):
                data['how_to_apply'] = json.loads(how)
        except Exception:
            data['how_to_apply'] = []

        return GovScheme.objects.create(**data)

    def update(self, instance, validated_data):
        # Similar normalization as create
        if 'howToApply' in self.initial_data:
            validated_data['how_to_apply'] = self.initial_data.get('howToApply')
        if 'officialWebsite' in self.initial_data:
            validated_data['official_website'] = self.initial_data.get('officialWebsite')

        docs = validated_data.get('documents', None)
        how = validated_data.get('how_to_apply', None)
        if docs is not None and isinstance(docs, str):
            try:
                validated_data['documents'] = json.loads(docs)
            except Exception:
                validated_data['documents'] = []
        if how is not None and isinstance(how, str):
            try:
                validated_data['how_to_apply'] = json.loads(how)
            except Exception:
                validated_data['how_to_apply'] = []

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


# Late bind model and Meta to avoid circular import problems
try:
    from .models import GovScheme
    GovSchemeSerializer.Meta.model = GovScheme
    GovSchemeSerializer.Meta.fields = ['id', 'name', 'category', 'description', 'eligibility', 'benefits', 'documents', 'how_to_apply', 'howToApply', 'official_website', 'officialWebsite', 'is_active', 'created_at', 'updated_at']
except Exception:
    # If import fails for any reason (shouldn't in normal runtime), skip binding
    pass
