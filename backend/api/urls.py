# APIエンドポイントのルーティング設定
# 各機能へのURLパスとビューを紐付け

from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from .views import (
    RegistrationAPI,
    HomeDataListCreateAPIView,
    HomeDataRetrieveUpdateAPIView,
    MonthlyTargetAPIView,
    MonthlySummaryAPI,
    CurrentUserAPI,
)

# URLパターン定義
urlpatterns = [
    # ユーザー認証関連
    path('register/', RegistrationAPI.as_view(), name='register'),  # 新規ユーザー登録処理
    path('current-user/', CurrentUserAPI.as_view(), name='current-user'),  # ログイン中ユーザー情報取得
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # JWT認証トークン発行
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # JWT認証トークン更新
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),  # JWT認証トークン検証
    
    # 営業データ管理
    path('home-data/', HomeDataListCreateAPIView.as_view(), name='home-data-list'),  # 営業データ一覧表示・新規作成
    path('home-data/<int:pk>/', HomeDataRetrieveUpdateAPIView.as_view(), name='home-data-detail'),  # 営業データ詳細表示・更新
    
    # 目標・分析関連
    path('monthly-target/', MonthlyTargetAPIView.as_view(), name='monthly-target'),  # 月間目標設定・取得
    path('monthly-target/<str:year_month>/', MonthlyTargetAPIView.as_view(), name='monthly-target-detail'),  # 特定月の目標管理
    path('monthly-summary/', MonthlySummaryAPI.as_view(), name='monthly-summary'),  # 月間・日次実績集計・分析（統合API）
]
