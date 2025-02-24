# マイグレーションファイル
# データベーススキーマの初期構造を定義するファイル

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    # 初期マイグレーションを示すフラグ
    initial = True

    # 依存関係の定義
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    # データベース操作の定義
    operations = [
        migrations.CreateModel(
            name='HomeData',
            fields=[
                # 主キーとなるID
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                # 日付情報
                ('date', models.DateField()),
                # 入力者名
                ('input_name', models.CharField(max_length=150)),
                
                # 営業活動指標（すべて初期値0）
                ('call_count', models.PositiveIntegerField(default=0)),
                ('catch_count', models.PositiveIntegerField(default=0)),
                ('re_call_count', models.PositiveIntegerField(default=0)),
                ('prospective_count', models.PositiveIntegerField(default=0)),
                ('approach_ng_count', models.PositiveIntegerField(default=0)),
                ('product_explanation_ng_count', models.PositiveIntegerField(default=0)),
                ('acquisition_count', models.PositiveIntegerField(default=0)),
                ('target_acquisition_count', models.PositiveIntegerField(default=0)),
                ('working_days_in_month', models.PositiveIntegerField(default=0)),
                
                # ユーザー参照（削除時はカスケード）
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='home_data', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
