from django.db import models
from django.contrib.auth.models import User

# ホーム画面のデータを管理するモデル
# 各ユーザーの日々の営業活動データを記録・集計するために使用
class HomeData(models.Model):
    """
    各日付ごとのホーム画面データを保存するモデル。
    ユーザーごとの営業活動の実績を日単位で管理します。
    
    主な用途:
    - 日々の営業活動の進捗管理
    - 月間目標に対する達成度の把握
    - パフォーマンス分析
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='home_data')  # ユーザーとの紐付け
    date = models.DateField(verbose_name="記録日", null=True, blank=True)  # 基本日付フィールド
    operation_date = models.DateField(verbose_name="営業日", auto_now_add=True, null=True, blank=True)  # 自動設定
    input_name = models.CharField(max_length=150)  # 登録時のユーザー名を保持
    
    # 営業活動の各種カウンター
    call_count = models.PositiveIntegerField(default=0, null=True, blank=True)  # 電話発信数
    catch_count = models.PositiveIntegerField(default=0, null=True, blank=True)  # 電話応対数
    re_call_count = models.PositiveIntegerField(default=0, null=True, blank=True)  # 再コール数
    prospective_count = models.PositiveIntegerField(default=0, null=True, blank=True)  # 見込み客数
    approach_ng_count = models.PositiveIntegerField(default=0, null=True, blank=True)  # アプローチNG数
    product_explanation_ng_count = models.PositiveIntegerField(default=0, null=True, blank=True)  # 商品説明NG数
    acquisition_count = models.IntegerField(default=0, null=True, blank=True)  # 獲得数

    def __str__(self):
        return f"{self.user.username} - {self.operation_date}"

    def save(self, *args, **kwargs):
        # 営業日が未設定の場合、記録日と同じにする
        if not self.operation_date:
            self.operation_date = self.date
        super().save(*args, **kwargs)

class MonthlyTarget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    year_month = models.CharField(max_length=7)  # 形式: YYYY-MM
    target_acquisition = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'year_month')  # ユーザーごとに月ごと1レコード

    def __str__(self):
        return f"{self.user.username} - {self.year_month}"
