import os
from django.core.wsgi import get_wsgi_application

# 環境変数にDjangoの設定モジュールを指定
# これによりDjangoがどの設定ファイルを使用するか認識できる
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vsproject_backend.settings')

# WSGIアプリケーションを初期化
# Webサーバーとアプリケーション間の標準インターフェース
application = get_wsgi_application()
