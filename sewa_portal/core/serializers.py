from rest_framework import serializers
from .models import User, Service, UserApplication, UserDocument, FinalDocument

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'

class UserDocumentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    class Meta:
        model = UserDocument
        fields = ['document_id', 'application', 'file_path', 'file_url', 'uploaded_at']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file_path and request:
            return request.build_absolute_uri(obj.file_path.url)
        return None

class FinalDocumentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    class Meta:
        model = FinalDocument
        fields = ['final_doc_id', 'application', 'file_path', 'file_url', 'uploaded_at']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file_path and request:
            return request.build_absolute_uri(obj.file_path.url)
        return None

class UserApplicationSerializer(serializers.ModelSerializer):
    documents = UserDocumentSerializer(many=True, read_only=True, source='userdocument_set')
    final_document = FinalDocumentSerializer(many=True, read_only=True, source='finaldocument_set')
    class Meta:
        model = UserApplication
        fields = ['application_id', 'user', 'service', 'status', 'reject_reason', 'submitted_at', 'updated_at', 'documents', 'final_document']
