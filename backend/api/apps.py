# APIアプリケーションの設定ファイル
# Djangoアプリケーションの基本設定を定義

from django.apps import AppConfig


class ApiConfig(AppConfig):
    """
    APIアプリケーションの設定クラス
    
    Djangoアプリケーション設定を定義
    自動フィールドの種類とアプリ名を指定
    """
    # デフォルトの主キーフィールドタイプ
    default_auto_field = 'django.db.models.BigAutoField'
    # アプリケーション名
    name = 'api'
