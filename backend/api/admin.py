from django.contrib import admin
from .models import HomeData, MonthlyTarget

# Django管理画面の設定
# モデルの表示方法や検索・フィルタリング機能を定義

@admin.register(HomeData)
class HomeDataAdmin(admin.ModelAdmin):
    """営業データの管理画面設定"""
    list_display = ('user', 'operation_date', 'call_count', 'acquisition_count')
    list_filter = ('operation_date', 'user')
    search_fields = ('user__username',)
    date_hierarchy = 'operation_date'

@admin.register(MonthlyTarget)
class MonthlyTargetAdmin(admin.ModelAdmin):
    """月間目標の管理画面設定"""
    list_display = ('user', 'year_month', 'target_acquisition')
    list_filter = ('year_month', 'user')
    search_fields = ('user__username',)
