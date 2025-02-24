from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),  # 管理画面へのアクセスパス
    # APIエンドポイント設定
    # api.urlsをインクルードすることで、APIアプリケーションのルーティングを統合
    path('api/', include('api.urls')),  
    # JWT認証用エンドポイント
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # トークン取得
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # トークン更新
    # 認証関連のエンドポイントを追加
    path('api/auth/', include('api.auth.urls')),  # 認証関連のURLをインクルード
]
