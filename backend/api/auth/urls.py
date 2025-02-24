# 認証関連のURLルーティング設定
# ユーザー登録とログイン機能へのエンドポイントを定義

from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),  # ユーザー登録エンドポイント
    path('login/', views.login, name='login'),  # ログイン認証エンドポイント
]