import os
from django.core.asgi import get_asgi_application

# 環境変数にDjangoの設定モジュールを指定
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vsproject_backend.settings')

# ASGIアプリケーションを初期化
application = get_asgi_application()
