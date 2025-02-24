# プロジェクト全体のURLルーティング設定
# 各アプリケーションへのパスマッピングとエンドポイント定義

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # Django管理画面
    path('admin/', admin.site.urls),
    
    # APIエンドポイント
    path('api/', include([
        # メインAPIエンドポイント - api.urlsで定義された全てのAPIパス
        path('', include('api.urls')),
        
        # JWT認証エンドポイント 
        # 認証関連エンドポイント
        path('auth/', include('api.auth.urls')),
    ])),
]
