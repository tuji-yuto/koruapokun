# Django REST frameworkのURL設定
# APIエンドポイントのルーティングを定義

from django.urls import path
from .views import RegistrationAPI, HomeDataListCreateAPIView, HomeDataRetrieveUpdateAPIView, MonthlyTargetAPIView, MonthlySummaryAPI, DailySummaryAPI, CurrentUserAPI
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from . import views

# URLパターンの定義
# 各エンドポイントとビューを紐付け、名前を付与
urlpatterns = [
    # ユーザー登録用エンドポイント
    path('register/', RegistrationAPI.as_view(), name='register'),
    
    # JWTトークンを使用したログイン認証用エンドポイント
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # JWTトークンのリフレッシュ用エンドポイント
    # アクセストークンの期限切れ時に使用
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # JWTトークンの検証用エンドポイント
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # ホーム画面データのCRUD操作用エンドポイント
    path('home-data/', HomeDataListCreateAPIView.as_view(), name='home-data-list'),
    path('home-data/<int:pk>/', HomeDataRetrieveUpdateAPIView.as_view(), name='home-data-detail'),
    path('monthly-target/', MonthlyTargetAPIView.as_view(), name='monthly-target'),
    path('monthly-target/<str:year_month>/', views.MonthlyTargetAPIView.as_view(), name='monthly-target-detail'),
    path('monthly-summary/', MonthlySummaryAPI.as_view(), name='monthly-summary'),
    path('daily-summary/', DailySummaryAPI.as_view(), name='daily-summary'),
    path('current-user/', CurrentUserAPI.as_view(), name='current-user'),
]
