from django.contrib import admin
from .models import HomeData

# Register your models here.

@admin.register(HomeData)
class HomeDataAdmin(admin.ModelAdmin):
    list_display = ('user', 'operation_date', 'call_count', 'acquisition_count')
    list_filter = ('operation_date',)  # 日付でのフィルタリング追加
