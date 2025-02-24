from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.db import IntegrityError

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