# 初期マイグレーションファイル - 2025-02-18作成
# HomeDataモデルの基本構造を定義

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    # 最初のマイグレーションであることを示す
    initial = True

    # このマイグレーションが依存する他のマイグレーション
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    # 実行される操作のリスト
    operations = [
        migrations.CreateModel(
            name='HomeData',
            fields=[
                # 基本フィールド
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('input_name', models.CharField(max_length=150)),
                
                # 営業活動カウント関連フィールド（すべてデフォルト値0）
                ('call_count', models.PositiveIntegerField(default=0)),
                ('catch_count', models.PositiveIntegerField(default=0)),
                ('re_call_count', models.PositiveIntegerField(default=0)),
                ('prospective_count', models.PositiveIntegerField(default=0)),
                ('approach_ng_count', models.PositiveIntegerField(default=0)),
                ('product_explanation_ng_count', models.PositiveIntegerField(default=0)),
                ('acquisition_count', models.PositiveIntegerField(default=0)),
                ('target_acquisition_count', models.PositiveIntegerField(default=0)),
                ('working_days_in_month', models.PositiveIntegerField(default=0)),
                
                # ユーザーとの関連付け
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='home_data', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
