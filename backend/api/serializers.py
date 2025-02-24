# Django REST frameworkのシリアライザー定義
# モデルとJSONデータの相互変換、バリデーション、データ処理を担当

import re
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from rest_framework_simplejwt.tokens import UntypedToken
from .models import HomeData, MonthlyTarget

# ユーザー登録用シリアライザー
class RegistrationSerializer(serializers.ModelSerializer):
    """
    ユーザー登録処理を担当するシリアライザー
    ユーザー名とパスワードの検証と新規ユーザー作成を処理
    """
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)  # 確認用パスワード

    class Meta:
        model = User
        fields = ['username', 'password', 'password2']

    def validate_username(self, value):
        """ユーザー名の形式と重複をチェック"""
        # 3～30文字の英数字または日本語文字のみ許可
        if not re.match(r'^[a-zA-Z0-9ぁ-んァ-ン一-龠]{3,30}$', value):
            raise serializers.ValidationError(
                "ユーザー名は3～30文字の英数字または日本語で入力してください"
            )
        # 既存ユーザー名との重複チェック
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("このユーザー名は既に使用されています")
        return value

    def validate_password(self, value):
        """パスワードの形式と文字種をチェック"""
        # 長さ制限チェック
        if len(value) < 8 or len(value) > 24:
            raise serializers.ValidationError("パスワードは8～24文字で入力してください")
        # スペース含有チェック
        if ' ' in value:
            raise serializers.ValidationError("パスワードにスペースを含めることはできません")
        # 使用可能文字チェック
        if not re.match(r'^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>/?]+$', value):
            raise serializers.ValidationError("使用可能な文字：アルファベット（大文字/小文字）、数字、特殊文字")
        return value

    def validate(self, data):
        """パスワードと確認用パスワードの一致を検証"""
        if data.get('password') != data.get('password2'):
            raise serializers.ValidationError({"password": "パスワードが一致しません"})
        return data

    def create(self, validated_data):
        """検証済みデータからユーザーを作成"""
        # 確認用パスワードを削除
        validated_data.pop('password2')
        # パスワードをハッシュ化
        validated_data['password'] = make_password(validated_data['password'])
        return User.objects.create(**validated_data)


# ホーム画面データ用シリアライザー
class HomeDataSerializer(serializers.ModelSerializer):
    """
    営業活動データの処理を担当するシリアライザー
    日々の営業実績データの変換と検証を処理
    """
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    input_name = serializers.CharField(read_only=True)
    date = serializers.DateField(required=False, allow_null=True)
    operation_date = serializers.DateField(read_only=True)
    
    class Meta:
        model = HomeData
        fields = '__all__'
        extra_kwargs = {
            'call_count': {'allow_null': True},
            'catch_count': {'allow_null': True},
            'date': {'required': False},
            'operation_date': {'read_only': True}
        }


# ユーザー情報シリアライザー
class UserSerializer(serializers.ModelSerializer):
    """
    ユーザー情報の処理を担当するシリアライザー
    ユーザーIDとユーザー名の取得、パスワード処理を管理
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }


# 月間目標管理用シリアライザー
class MonthlyTargetSerializer(serializers.ModelSerializer):
    """
    月間目標データの処理を担当するシリアライザー
    ユーザーごとの月間目標設定と取得を処理
    """
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    year_month = serializers.CharField(read_only=True)

    class Meta:
        model = MonthlyTarget
        fields = ['id', 'user', 'year_month', 'target_acquisition']


# トークン検証用シリアライザー
class TokenVerifySerializer(serializers.Serializer):
    """
    認証トークンの検証を担当するシリアライザー
    JWTトークンの有効性を確認
    """
    token = serializers.CharField(required=True)

    def validate(self, attrs):
        """トークンの有効性を検証"""
        try:
            UntypedToken(attrs['token'])
            return attrs  # 検証済みデータを返す
        except Exception as e:
            raise serializers.ValidationError({'token': str(e)})
