# データモデル定義
# アプリケーションのデータ構造とデータベーススキーマを定義

from django.db import models
from django.contrib.auth.models import User

class HomeData(models.Model):
    """
    日々の営業活動データを記録するモデル
    各ユーザーの営業実績を日単位で管理し、分析に活用
    """
    # 基本情報
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='home_data')  # ユーザー参照（削除時連動）
    date = models.DateField(verbose_name="記録日", null=True, blank=True)  # データ記録日
    operation_date = models.DateField(verbose_name="営業日", auto_now_add=True, null=True, blank=True)  # 実際の営業日
    input_name = models.CharField(max_length=150)  # 入力時のユーザー名
    
    # 営業活動指標（共通設定: null/blank許可、デフォルト0）
    call_count = models.PositiveIntegerField(default=0, null=True, blank=True)  # 電話発信数
    catch_count = models.PositiveIntegerField(default=0, null=True, blank=True)  # 電話応対数
    re_call_count = models.PositiveIntegerField(default=0, null=True, blank=True)  # 再コール数
    prospective_count = models.PositiveIntegerField(default=0, null=True, blank=True)  # 見込み客数
    approach_ng_count = models.PositiveIntegerField(default=0, null=True, blank=True)  # アプローチNG数
    product_explanation_ng_count = models.PositiveIntegerField(default=0, null=True, blank=True)  # 商品説明NG数
    acquisition_count = models.IntegerField(default=0, null=True, blank=True)  # 獲得数

    def __str__(self):
        return f"{self.user.username} - {self.operation_date}"  # 管理画面等での表示名

    def save(self, *args, **kwargs):
        # 営業日未設定時は記録日を使用
        if not self.operation_date:
            self.operation_date = self.date
        super().save(*args, **kwargs)


class MonthlyTarget(models.Model):
    """
    月間目標を管理するモデル
    ユーザーごとに月単位で目標獲得数を設定
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # ユーザー参照
    year_month = models.CharField(max_length=7)  # YYYY-MM形式で年月を保存
    target_acquisition = models.PositiveIntegerField(default=0)  # 月間目標獲得数
    created_at = models.DateTimeField(auto_now_add=True)  # 作成日時
    updated_at = models.DateTimeField(auto_now=True)  # 更新日時

    class Meta:
        unique_together = ('user', 'year_month')  # ユーザーと年月の組み合わせで一意

    def __str__(self):
        return f"{self.user.username} - {self.year_month}"  # 管理画面等での表示名
