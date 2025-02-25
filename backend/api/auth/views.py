"""
認証関連のビュー
ユーザー登録とログイン機能を提供
"""

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

@api_view(['POST'])
def register(request):
    """
    ユーザー登録処理
    """
    # リクエストからユーザー情報を取得
    username = request.data.get('username')
    password = request.data.get('password')
    
    # 入力検証
    if not username or not password:
        return Response(
            {'message': 'ユーザー名とパスワードは必須です'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # パスワードの検証
        validate_password(password)
        
        # ユーザー作成
        User.objects.create_user(username=username, password=password)
        return Response(
            {'message': '登録が完了しました'}, 
            status=status.HTTP_201_CREATED
        )
    except ValidationError as e:
        # パスワード検証エラー
        return Response(
            {'message': f'パスワードが要件を満たしていません: {", ".join(e.messages)}'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except IntegrityError:
        # ユーザー名重複エラー
        return Response(
            {'message': 'このユーザー名は既に使用されています'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        # その他のエラー
        return Response(
            {'message': f'登録に失敗しました: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def login(request):
    """
    ユーザーログイン処理
    """
    # リクエストからユーザー情報を取得
    username = request.data.get('username')
    password = request.data.get('password')
    
    # 入力検証
    if not username or not password:
        return Response(
            {'detail': 'ユーザー名とパスワードは必須です'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # ユーザー認証
    user = authenticate(username=username, password=password)
    
    if user is not None:
        # 認証成功時、JWTトークン生成
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    else:
        # 認証失敗
        return Response(
            {'detail': 'ユーザー名またはパスワードが正しくありません'}, 
            status=status.HTTP_401_UNAUTHORIZED
        ) 