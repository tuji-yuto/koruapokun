# 2回目のマイグレーション - 2025-02-19作成
# HomeDataモデルから月間稼働日数を削除し、営業日フィールドを追加

from django.db import migrations, models


class Migration(migrations.Migration):

    # 前回のマイグレーションへの依存関係
    dependencies = [
        ('api', '0001_initial'),
    ]

    # 実行される操作
    operations = [
        # working_days_in_monthフィールドの削除
        migrations.RemoveField(
            model_name='homedata',
            name='working_days_in_month',
        ),
        # 新しい営業日フィールドの追加（空白・NULL許可）
        migrations.AddField(
            model_name='homedata',
            name='operation_date',
            field=models.DateField(blank=True, null=True, verbose_name='営業日'),
        ),
    ]
