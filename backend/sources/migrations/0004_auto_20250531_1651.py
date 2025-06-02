from django.db import migrations
import json

def fix_invalid_json(apps, schema_editor):
    Source = apps.get_model('sources', 'Source')
    for obj in Source.objects.all():
        try:
            json.loads(obj.text_content or '')
        except Exception:
            # Replace invalid JSON with null or a default
            obj.text_content = None
            obj.save()

class Migration(migrations.Migration):

    dependencies = [
        ('sources', '0003_alter_source_text_content'),  # Adjust this if your previous file has a different number
    ]

    operations = [
        migrations.RunPython(fix_invalid_json),
    ]
