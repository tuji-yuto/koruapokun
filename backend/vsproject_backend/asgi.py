# このファイルはASGI（Asynchronous Server Gateway Interface）アプリケーションの設定

import os
from django.core.asgi import get_asgi_application

# 環境変数にDjangoの設定モジュールを指定
# Djangoが使用する設定ファイルのパスを認識するために必要
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vsproject_backend.settings')

# ASGIアプリケーションを初期化
# 非同期Webサーバー（Daphneなど）とDjangoアプリケーション間のインターフェース
application = get_asgi_application()
