# このファイルはプロジェクト全体のURLルーティングを定義

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # 管理画面へのアクセスパス
    path('admin/', admin.site.urls),
    
    # APIエンドポイント
    path('api/', include([
        # メインAPIルート
        path('', include('api.urls')),
        
        # JWT認証関連
        path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # JWTトークン発行
        path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # JWTトークン更新
        
        # ユーザー認証関連
        path('auth/', include('api.auth.urls')),  # ログイン・登録などの認証機能
    ])),
]
