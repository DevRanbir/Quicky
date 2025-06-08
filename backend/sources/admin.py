from django.contrib import admin
from .models import Source

@admin.register(Source)
class SourceAdmin(admin.ModelAdmin):
    list_display = ('id', 'source_type', 'file', 'youtube_link', 'uploaded_at')
    list_filter = ('source_type', 'uploaded_at')
    search_fields = ('file__name', 'youtube_link', 'text_content')
    readonly_fields = ('text_content', 'page_count', 'video_duration', 'uploaded_at')