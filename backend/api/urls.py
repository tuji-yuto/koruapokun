# APIエンドポイントのルーティング設定
# 各機能へのURLパスとビューを紐付ける

from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from . import views
from .views import (
    RegistrationAPI,
    HomeDataListCreateAPIView,
    HomeDataRetrieveUpdateAPIView,
    MonthlyTargetAPIView,
    MonthlySummaryAPI,
    DailySummaryAPI,
    CurrentUserAPI,
)

# URLパターン定義
urlpatterns = [
    # ユーザー管理関連
    path('register/', RegistrationAPI.as_view(), name='register'),  # 新規ユーザー登録
    path('current-user/', CurrentUserAPI.as_view(), name='current-user'),  # ログイン中ユーザー情報取得
    
    # JWT認証関連
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # ログイン（トークン発行）
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # トークン更新
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),  # トークン検証
    
    # データ管理関連
    path('home-data/', HomeDataListCreateAPIView.as_view(), name='home-data-list'),  # 営業データ一覧・作成
    path('home-data/<int:pk>/', HomeDataRetrieveUpdateAPIView.as_view(), name='home-data-detail'),  # 営業データ詳細・更新
    
    # 目標・集計関連
    path('monthly-target/', MonthlyTargetAPIView.as_view(), name='monthly-target'),  # 月間目標管理
    path('monthly-target/<str:year_month>/', MonthlyTargetAPIView.as_view(), name='monthly-target-detail'),  # 特定月の目標
    path('monthly-summary/', MonthlySummaryAPI.as_view(), name='monthly-summary'),  # 月間実績サマリー
    path('daily-summary/', DailySummaryAPI.as_view(), name='daily-summary'),  # 日次実績サマリー
]
