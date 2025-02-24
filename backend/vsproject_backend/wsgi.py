"""
WSGI設定ファイル
Webサーバーとアプリケーション間の標準インターフェースを提供
本番環境でのDjangoアプリケーション実行に必要な設定
"""

import os
from django.core.wsgi import get_wsgi_application

# Django設定モジュールのパスを環境変数に設定
# アプリケーションが正しい設定ファイルを読み込むために必要
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vsproject_backend.settings')

# WSGIアプリケーションオブジェクトを生成
# WebサーバーとDjangoアプリケーション間の通信を処理
application = get_wsgi_application()
