# 3回目のマイグレーション - 2025-02-19作成
# HomeDataモデルの改善と月間目標管理のためのMonthlyTargetモデル追加

from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_remove_homedata_working_days_in_month_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # 目標獲得数フィールドを削除（MonthlyTargetモデルへ移行）
        migrations.RemoveField(
            model_name='homedata',
            name='target_acquisition_count',
        ),
        
        # HomeDataモデルのフィールド改善（null/blank許可、日本語表示名追加）
        migrations.AlterField(
            model_name='homedata',
            name='acquisition_count',
            field=models.IntegerField(blank=True, default=0, null=True),
        ),
        migrations.AlterField(
            model_name='homedata',
            name='approach_ng_count',
            field=models.PositiveIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AlterField(
            model_name='homedata',
            name='call_count',
            field=models.PositiveIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AlterField(
            model_name='homedata',
            name='catch_count',
            field=models.PositiveIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AlterField(
            model_name='homedata',
            name='date',
            field=models.DateField(blank=True, null=True, verbose_name='記録日'),
        ),
        migrations.AlterField(
            model_name='homedata',
            name='operation_date',
            field=models.DateField(auto_now_add=True, null=True, verbose_name='営業日'),
        ),
        migrations.AlterField(
            model_name='homedata',
            name='product_explanation_ng_count',
            field=models.PositiveIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AlterField(
            model_name='homedata',
            name='prospective_count',
            field=models.PositiveIntegerField(blank=True, default=0, null=True),
        ),
        migrations.AlterField(
            model_name='homedata',
            name='re_call_count',
            field=models.PositiveIntegerField(blank=True, default=0, null=True),
        ),
        
        # 月間目標管理用の新モデル作成
        migrations.CreateModel(
            name='MonthlyTarget',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('year_month', models.CharField(max_length=7)),  # YYYY-MM形式
                ('target_acquisition', models.PositiveIntegerField(default=0)),  # 月間獲得目標数
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('user', 'year_month')},  # ユーザーと年月の組み合わせでユニーク制約
            },
        ),
    ]
