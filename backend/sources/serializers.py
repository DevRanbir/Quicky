from rest_framework import serializers
from .models import Source
from django.conf import settings
from django.urls import reverse

class FileUploadSerializer(serializers.ModelSerializer):
    file = serializers.FileField()

    class Meta:
        model = Source
        fields = ('file',) # source_type will be determined in the view

    def validate_file(self, value):
        # Validate file size
        if value.size > settings.MAX_UPLOAD_SIZE:
            raise serializers.ValidationError(f"File size cannot exceed {settings.MAX_UPLOAD_SIZE // (1024 * 1024)} MB.")
        
        # Validate file type (extension)
        ext = value.name.split('.')[-1].lower()
        if ext not in ['pdf', 'docx', 'pptx', 'txt']:
            raise serializers.ValidationError("Unsupported file type. Allowed types: PDF, DOCX, PPTX, TXT.")
        return value

class YouTubeLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Source
        fields = ('youtube_link',)

    def validate_youtube_link(self, value):
        if not value.startswith('https://www.youtube.com/watch?v=') and not value.startswith('https://youtu.be/'):
            raise serializers.ValidationError("Invalid YouTube video URL.")
        return value

class SourceSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Source
        fields = '__all__'

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None