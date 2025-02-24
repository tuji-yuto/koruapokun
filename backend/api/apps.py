from django.apps import AppConfig


class ApiConfig(AppConfig):
    """
    APIアプリケーションの設定クラス
    
    このクラスはDjangoのアプリケーション設定を定義します。
    主要な設定として自動フィールドの種類とアプリ名を指定しています。
    """
    # デフォルトの主キーフィールドタイプ（BigAutoField使用）
    default_auto_field = 'django.db.models.BigAutoField'
    # アプリケーション名
    name = 'api'
