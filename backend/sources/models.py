from django.db import models 
import json
from django.core.exceptions import ValidationError


class Source(models.Model):
    SOURCE_TYPES = (
        ('PDF', 'PDF'),
        ('DOCX', 'DOCX'),
        ('PPTX', 'PPTX'),
        ('TXT', 'TXT'),
        ('YOUTUBE', 'YOUTUBE'),
    )

    source_type = models.CharField(max_length=10, choices=SOURCE_TYPES)
    file = models.FileField(upload_to='uploads/', blank=True, null=True)
    youtube_link = models.URLField(blank=True, null=True)
    # For PDFs: list of strings (text per page). For others: list containing a single string (full text).
    text_content = models.JSONField(null=True, blank=True)
    page_count = models.IntegerField(blank=True, null=True) # For PDF files
    video_duration = models.CharField(max_length=20, blank=True, null=True) # For YouTube videos (e.g., "10:35")
    # To store any specific metadata used for generation, e.g., page ranges, time ranges.
    source_metadata = models.JSONField(blank=True, null=True) 
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.file:
            return f"{self.get_source_type_display()}: {self.file.name}"
        elif self.youtube_link:
            return f"{self.get_source_type_display()}: {self.youtube_link}"
        return f"{self.get_source_type_display()} - Unknown"

    def clean(self):
        if self.text_content:
            try:
                json.loads(self.text_content)
            except json.JSONDecodeError:
                raise ValidationError("text_content must be valid JSON.")