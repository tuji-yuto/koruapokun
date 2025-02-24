from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

@api_view(['POST'])
def register(request):
    """
    ユーザー登録を処理するビュー関数
    """
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response(
            {'message': 'ユーザー名とパスワードは必須です'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.create_user(username=username, password=password)
        return Response(
            {'message': '登録が完了しました'}, 
            status=status.HTTP_201_CREATED
        )
    except IntegrityError:
        return Response(
            {'message': 'このユーザー名は既に使用されています'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'message': f'登録に失敗しました: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def login(request):
    """
    ユーザーログインを処理するビュー関数
    """
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response(
            {'detail': 'ユーザー名とパスワードは必須です'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(username=username, password=password)
    
    if user is not None:
        # ユーザー認証成功
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    else:
        # ユーザー認証失敗
        return Response(
            {'detail': 'ユーザー名またはパスワードが正しくありません'}, 
            status=status.HTTP_401_UNAUTHORIZED
        ) 