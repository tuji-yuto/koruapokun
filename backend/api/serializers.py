# Django REST frameworkのシリアライザーを定義
# ユーザー登録とホーム画面データの処理を担当

import re
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from .models import HomeData, MonthlyTarget

# ユーザー登録用シリアライザー
# 新規ユーザーの登録処理とバリデーションを行う
class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)  # パスワードフィールド（書き込みのみ）
    password2 = serializers.CharField(write_only=True)  # パスワード確認用フィールド

    class Meta:
        model = User
        fields = ['username', 'password', 'password2']

    def validate_username(self, value):
        """
        ユーザー名は3～30文字の英数字または日本語で入力してください。
        """
        if not re.match(r'^[a-zA-Z0-9ぁ-んァ-ン一-龠]{3,30}$', value):
            raise serializers.ValidationError(
                "ユーザー名は3～30文字の英数字または日本語で入力してください"
            )
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def validate_password(self, value):
        """
        パスワード要件：
        - 8～24文字
        - アルファベット（大文字/小文字）、数字、特殊文字の組み合わせ
        - スペース不可
        """
        if len(value) < 8 or len(value) > 24:
            raise serializers.ValidationError("パスワードは8～24文字で入力してください")
        if ' ' in value:
            raise serializers.ValidationError("パスワードにスペースを含めることはできません")
        if not re.match(r'^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>/?]+$', value):
            raise serializers.ValidationError("使用可能な文字：アルファベット（大文字/小文字）、数字、特殊文字")
        return value

    def validate(self, data):
        # パスワードと確認用パスワードが一致するか確認
        if data.get('password') != data.get('password2'):
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        # パスワード確認フィールドを削除
        validated_data.pop('password2')
        # パスワードをハッシュ化して保存
        validated_data['password'] = make_password(validated_data['password'])
        user = User.objects.create(**validated_data)
        return user


# ホーム画面データ用シリアライザー
# HomeDataモデルのCRUD操作を処理する
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

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

class MonthlyTargetSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    year_month = serializers.CharField(read_only=True)

    class Meta:
        model = MonthlyTarget
        fields = ['id', 'user', 'year_month', 'target_acquisition']

class TokenVerifySerializer(serializers.Serializer):
    token = serializers.CharField(required=True)  # 明示的に必須設定

    def validate(self, attrs):
        from rest_framework_simplejwt.tokens import UntypedToken
        try:
            UntypedToken(attrs['token'])
        except Exception as e:
            raise serializers.ValidationError({'token': str(e)})
        return attrs  # 空オブジェクトではなく検証済みデータを返す
