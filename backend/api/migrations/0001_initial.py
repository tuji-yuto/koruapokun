# Generated by Django 5.1.6 on 2025-02-18 04:44

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='HomeData',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('input_name', models.CharField(max_length=150)),
                ('call_count', models.PositiveIntegerField(default=0)),
                ('catch_count', models.PositiveIntegerField(default=0)),
                ('re_call_count', models.PositiveIntegerField(default=0)),
                ('prospective_count', models.PositiveIntegerField(default=0)),
                ('approach_ng_count', models.PositiveIntegerField(default=0)),
                ('product_explanation_ng_count', models.PositiveIntegerField(default=0)),
                ('acquisition_count', models.PositiveIntegerField(default=0)),
                ('target_acquisition_count', models.PositiveIntegerField(default=0)),
                ('working_days_in_month', models.PositiveIntegerField(default=0)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='home_data', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
