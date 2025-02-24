"""
ASGI設定ファイル
非同期Webサーバーとの連携を担当し、Djangoアプリケーションを非同期環境で実行するための設定
"""

import os
from django.core.asgi import get_asgi_application

# Django設定モジュールのパスを環境変数に設定
# アプリケーションが正しい設定ファイルを読み込むために必要
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vsproject_backend.settings')

# ASGIアプリケーションオブジェクトを生成
# 非同期Webサーバー（Daphne等）とDjangoアプリケーション間の通信を処理
application = get_asgi_application()
