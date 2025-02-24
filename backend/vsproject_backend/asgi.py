"""
vsproject_backendプロジェクトのASGI設定ファイル。

このファイルは、ASGIプロトコルに対応したWebサーバーとDjangoアプリケーションを
接続するためのエントリーポイントを提供します。

`application`変数がASGIアプリケーションとして公開されており、
本番環境ではこれをASGI対応サーバー（DaphneやUvicornなど）で実行します。

詳細は公式ドキュメントを参照：
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application

# 環境変数にDjangoの設定モジュールを指定
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vsproject_backend.settings')

# ASGIアプリケーションを初期化
application = get_asgi_application()
