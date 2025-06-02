from django.contrib import admin
from .models import Question

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'source_link', 'question_text_short', 'correct_answer', 'created_at')
    list_filter = ('source__source_type', 'created_at')
    search_fields = ('question_text', 'source__file__name', 'source__youtube_link')
    raw_id_fields = ('source',)

    def source_link(self, obj):
        from django.urls import reverse
        from django.utils.html import format_html
        link = reverse("admin:sources_source_change", args=[obj.source.id])
        return format_html('<a href="{}">{}</a>', link, obj.source)
    source_link.short_description = 'Source'

    def question_text_short(self, obj):
        return obj.question_text[:75] + '...' if len(obj.question_text) > 75 else obj.question_text
    question_text_short.short_description = 'Question Text'