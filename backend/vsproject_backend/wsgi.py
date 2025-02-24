# このファイルはWSGIアプリケーションの設定を行う

import os
from django.core.wsgi import get_wsgi_application

# 環境変数にDjangoの設定モジュールを指定
# Djangoが使用する設定ファイルのパスを認識するために必要
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vsproject_backend.settings')

# WSGIアプリケーションを初期化
# WebサーバーとDjangoアプリケーション間の標準インターフェース
application = get_wsgi_application()
