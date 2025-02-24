# Django REST frameworkのシリアライザー定義
# ユーザー登録、認証、データ処理を担当

import re
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from rest_framework_simplejwt.tokens import UntypedToken
from .models import HomeData, MonthlyTarget

# ユーザー登録用シリアライザー
class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)  # 確認用

    class Meta:
        model = User
        fields = ['username', 'password', 'password2']

    def validate_username(self, value):
        """ユーザー名のバリデーション"""
        # 3～30文字の英数字または日本語
        if not re.match(r'^[a-zA-Z0-9ぁ-んァ-ン一-龠]{3,30}$', value):
            raise serializers.ValidationError(
                "ユーザー名は3～30文字の英数字または日本語で入力してください"
            )
        # 重複チェック
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("このユーザー名は既に使用されています")
        return value

    def validate_password(self, value):
        """パスワードのバリデーション"""
        # 長さチェック
        if len(value) < 8 or len(value) > 24:
            raise serializers.ValidationError("パスワードは8～24文字で入力してください")
        # スペースチェック
        if ' ' in value:
            raise serializers.ValidationError("パスワードにスペースを含めることはできません")
        # 文字種チェック
        if not re.match(r'^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>/?]+$', value):
            raise serializers.ValidationError("使用可能な文字：アルファベット（大文字/小文字）、数字、特殊文字")
        return value

    def validate(self, data):
        """パスワード一致確認"""
        if data.get('password') != data.get('password2'):
            raise serializers.ValidationError({"password": "パスワードが一致しません"})
        return data

    def create(self, validated_data):
        """ユーザー作成処理"""
        validated_data.pop('password2')  # 確認用フィールドを削除
        validated_data['password'] = make_password(validated_data['password'])  # ハッシュ化
        return User.objects.create(**validated_data)


# ホーム画面データ用シリアライザー
class HomeDataSerializer(serializers.ModelSerializer):
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
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }


# 月間目標管理用シリアライザー
class MonthlyTargetSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    year_month = serializers.CharField(read_only=True)

    class Meta:
        model = MonthlyTarget
        fields = ['id', 'user', 'year_month', 'target_acquisition']


# トークン検証用シリアライザー
class TokenVerifySerializer(serializers.Serializer):
    token = serializers.CharField(required=True)

    def validate(self, attrs):
        """トークンの有効性を検証"""
        try:
            UntypedToken(attrs['token'])
            return attrs  # 検証済みデータを返す
        except Exception as e:
            raise serializers.ValidationError({'token': str(e)})
