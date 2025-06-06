# Generated by Django 4.2.21 on 2025-05-31 09:17

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Source',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('source_type', models.CharField(choices=[('PDF', 'PDF'), ('DOCX', 'DOCX'), ('PPTX', 'PPTX'), ('TXT', 'TXT'), ('YOUTUBE', 'YOUTUBE')], max_length=10)),
                ('file', models.FileField(blank=True, null=True, upload_to='sources/')),
                ('youtube_link', models.URLField(blank=True, null=True)),
                ('text_content', models.TextField(blank=True)),
                ('page_count', models.IntegerField(blank=True, null=True)),
                ('video_duration', models.CharField(blank=True, max_length=20, null=True)),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
