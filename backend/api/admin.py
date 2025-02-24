from django.contrib import admin
from .models import HomeData

# 管理画面にモデルを登録

@admin.register(HomeData)
class HomeDataAdmin(admin.ModelAdmin):
    """HomeDataモデルの管理画面設定"""
    # 一覧表示に表示するフィールド
    list_display = ('user', 'operation_date', 'call_count', 'acquisition_count')
    # 右側に表示するフィルター
    list_filter = ('operation_date',)
