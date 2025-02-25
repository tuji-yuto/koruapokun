# Djangoプロジェクト設定ファイル
# 環境設定、アプリケーション登録、セキュリティ設定などを管理

from pathlib import Path
import os
from dotenv import load_dotenv
from datetime import timedelta
import dj_database_url

# プロジェクトのベースディレクトリを設定
BASE_DIR = Path(__file__).resolve().parent.parent

# 環境変数の読み込み
load_dotenv(os.path.join(BASE_DIR, '.env'))

# セキュリティ関連の設定
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'default-secret-key')  
DEBUG = os.environ.get('DEBUG', 'False') == 'True'  # 本番環境ではFalse
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '.onrender.com']  # Renderのドメインを追加

# インストール済みアプリケーション
INSTALLED_APPS = [
    # Djangoデフォルトアプリ
    'django.contrib.admin',  # 管理サイト
    'django.contrib.auth',  # 認証システム
    'django.contrib.contenttypes',  # コンテンツタイプフレームワーク
    'django.contrib.sessions',  # セッション管理
    'django.contrib.messages',  # メッセージフレームワーク
    'django.contrib.staticfiles',  # 静的ファイル管理
    
    # サードパーティアプリ
    'rest_framework',  # REST API構築用フレームワーク
    'corsheaders',  # クロスオリジンリソース共有
    'rest_framework_simplejwt',  # JWT認証
    
    # プロジェクトアプリ
    'api.apps.ApiConfig',  # APIアプリケーション
]

# ミドルウェア設定
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # CORS対応
    'django.middleware.security.SecurityMiddleware',  # セキュリティ対策
    'django.contrib.sessions.middleware.SessionMiddleware',  # セッション管理
    'django.middleware.common.CommonMiddleware',  # 共通処理
    'django.middleware.csrf.CsrfViewMiddleware',  # CSRF保護
    'django.contrib.auth.middleware.AuthenticationMiddleware',  # 認証処理
    'django.contrib.messages.middleware.MessageMiddleware',  # メッセージ処理
    'django.middleware.clickjacking.XFrameOptionsMiddleware',  # クリックジャッキング防止
]

# ルートURL設定
ROOT_URLCONF = 'vsproject_backend.urls'

# テンプレート設定
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',  # テンプレートエンジン
        'DIRS': [],  # テンプレート検索ディレクトリ
        'APP_DIRS': True,  # アプリディレクトリ内のテンプレート使用
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',  # デバッグ情報
                'django.template.context_processors.request',  # リクエスト情報
                'django.contrib.auth.context_processors.auth',  # 認証情報
                'django.contrib.messages.context_processors.messages',  # メッセージ情報
            ],
        },
    },
]

# WSGI設定
WSGI_APPLICATION = 'vsproject_backend.wsgi.application'

# データベース設定
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.config(default=DATABASE_URL, conn_max_age=600)
    }
else:
    # ローカル開発用の設定
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',  # PostgreSQL使用
            'NAME': os.getenv('DATABASE_NAME'),  # DB名
            'USER': os.getenv('DATABASE_USER'),  # DBユーザー
            'PASSWORD': os.getenv('DATABASE_PASSWORD'),  # DBパスワード
            'HOST': os.getenv('DATABASE_HOST'),  # DBホスト
            'PORT': os.getenv('DATABASE_PORT'),  # DBポート
        }
    }

# パスワードバリデーション設定
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
        'OPTIONS': {
            'max_similarity': 0.5,  # 類似度閾値を0.7から0.5に下げて厳しくする
        }
    },  # ユーザー情報との類似性チェック
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 10,  # 最小長を8から10に変更
        }
    },  # 最小長チェック
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},  # 一般的なパスワードチェック
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},  # 数字のみのパスワードチェック
]

# 国際化設定
LANGUAGE_CODE = 'ja'  # 日本語
TIME_ZONE = 'Asia/Tokyo'  # 東京タイムゾーン
USE_I18N = True  # 国際化
USE_L10N = True  # ローカライズ
USE_TZ = True  # タイムゾーン対応

# 静的ファイル設定
STATIC_URL = 'static/'  # 静的ファイルURL
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')  # 静的ファイル収集先ディレクトリ

# デフォルトプライマリキー設定
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework設定
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',  # JWT認証使用
    ),
}

# CORS設定
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # フロントエンド開発サーバー
    "https://localhost:3000",
    "https://koruapokun-4.onrender.com",  # Renderのドメイン
    "https://koruapokun100.vercel.app",  # Vercelにデプロイされたフロントエンド
]

# すべてのオリジンを許可する場合は以下を使用
CORS_ALLOW_ALL_ORIGINS = True

# 許可するHTTPメソッドとヘッダー
CORS_ALLOW_METHODS = ["DELETE", "GET", "OPTIONS", "PATCH", "POST", "PUT"]
CORS_ALLOW_HEADERS = [
    "accept", "accept-encoding", "authorization", "content-type", 
    "dnt", "origin", "user-agent", "x-csrftoken", "x-requested-with",
]

# クレデンシャル（Cookie、認証ヘッダーなど）を含むリクエストを許可
CORS_ALLOW_CREDENTIALS = True

# JWT認証設定
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),  # アクセストークン有効期間
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),  # リフレッシュトークン有効期間
    'ROTATE_REFRESH_TOKENS': True,  # トークンローテーション有効
    'BLACKLIST_AFTER_ROTATION': True,  # ローテーション後の古いトークンを無効化
    'AUTH_HEADER_TYPES': ('Bearer',),  # 認証ヘッダータイプ
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),  # トークンクラス
    'TOKEN_USER_CLASS': 'rest_framework_simplejwt.models.TokenUser',  # ユーザークラス
    'SIGNING_KEY': SECRET_KEY,  # 署名キー
}

# ロギング設定
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',  # コンソール出力ハンドラー
        },
    },
    'root': {
        'handlers': ['console'],  # ルートロガーのハンドラー
        'level': 'DEBUG',  # ログレベル
    },
}
