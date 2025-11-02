from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import User, Service, UserApplication, UserDocument, FinalDocument, Announcement, Payment, RequiredDocument, PaymentSettings
from .models import GopinathApplication
import json

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
        extra_kwargs = {
            'password': {'write_only': True},
            # Provide clear, user-friendly uniqueness error messages
            'username': {
                'validators': [
                    UniqueValidator(queryset=User.objects.all(), message="This username already exists.")
                ]
            },
            'email': {
                'required': False,
                'allow_null': True,
                'allow_blank': True,
                'validators': [
                    UniqueValidator(queryset=User.objects.all(), message="This email is already registered.")
                ]
            },
            'phone_number': {
                'validators': [
                    UniqueValidator(queryset=User.objects.all(), message="This phone number is already registered.")
                ]
            }
        }

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


class GopinathApplicationSerializer(serializers.ModelSerializer):
    # Provide convenient file URL fields so frontend/admin can directly access uploaded files
    passport_photo_url = serializers.SerializerMethodField()
    college_id_card_url = serializers.SerializerMethodField()
    ration_card_file_url = serializers.SerializerMethodField()
    bank_passbook_url = serializers.SerializerMethodField()
    aadhaar_file_url = serializers.SerializerMethodField()
    fee_residence_proof_url = serializers.SerializerMethodField()
    last_marksheet_url = serializers.SerializerMethodField()
    signature_url = serializers.SerializerMethodField()
    class Meta:
        model = GopinathApplication
        fields = [
            'app_id', 'user',
            # Personal
            'full_name', 'dob', 'gender', 'mobile', 'email', 'aadhaar', 'passport_photo',
            # Education
            'college_name', 'college_address', 'course', 'study_year', 'college_id_number', 'college_id_card', 'college_contact',
            # Residence
            'current_address', 'native_place', 'residence_type', 'residence_name_address', 'permanent_address', 'residence_proof_attached',
            # Scheme
            'ration_card_number', 'ration_card_type', 'veg_nonveg', 'ration_card_file',
            # Meal / canteen
            'current_meal_location', 'why_need', 'near_canteen', 'expected_canteen_location',
            # Bank
            'bank_name', 'branch_name', 'account_number', 'ifsc', 'bank_passbook',
            # Other docs
            'aadhaar_file', 'fee_residence_proof', 'last_marksheet',
            # Declaration
            'declaration', 'signature', 'submitted_at', 'status',
            # File URLs
            'passport_photo_url', 'college_id_card_url', 'ration_card_file_url', 'bank_passbook_url', 'aadhaar_file_url', 'fee_residence_proof_url', 'last_marksheet_url', 'signature_url'
        ]
        read_only_fields = ['app_id', 'submitted_at', 'status']

    def create(self, validated_data):
        # Attach the currently authenticated user if available in context
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            validated_data['user'] = request.user
        return super().create(validated_data)

    # File URL getters
    def _file_url(self, obj, field_name):
        try:
            f = getattr(obj, field_name)
            if f:
                return f.url
        except Exception:
            return None
        return None

    def get_passport_photo_url(self, obj):
        return self._file_url(obj, 'passport_photo')

    def get_college_id_card_url(self, obj):
        return self._file_url(obj, 'college_id_card')

    def get_ration_card_file_url(self, obj):
        return self._file_url(obj, 'ration_card_file')

    def get_bank_passbook_url(self, obj):
        return self._file_url(obj, 'bank_passbook')

    def get_aadhaar_file_url(self, obj):
        return self._file_url(obj, 'aadhaar_file')

    def get_fee_residence_proof_url(self, obj):
        return self._file_url(obj, 'fee_residence_proof')

    def get_last_marksheet_url(self, obj):
        return self._file_url(obj, 'last_marksheet')

    def get_signature_url(self, obj):
        return self._file_url(obj, 'signature')
