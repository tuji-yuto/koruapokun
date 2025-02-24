# マイグレーションファイル
# HomeDataモデルのフィールド構成変更を管理

from django.db import migrations, models


class Migration(migrations.Migration):

    # 依存関係定義
    dependencies = [
        ('api', '0001_initial'),
    ]

    # データベース操作定義
    operations = [
        # 月間稼働日数フィールドの削除
        migrations.RemoveField(
            model_name='homedata',
            name='working_days_in_month',
        ),
        # 営業日フィールドの追加
        migrations.AddField(
            model_name='homedata',
            name='operation_date',
            field=models.DateField(blank=True, null=True, verbose_name='営業日'),
        ),
    ]
