# Generated by Django 4.2.21 on 2025-05-31 11:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
    ('sources', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='source',
            name='text_content',
            field=models.TextField(blank=True, null=True),
        ),
    ]
