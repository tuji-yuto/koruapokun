from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics
from django.contrib.auth.hashers import make_password
from .serializers import RegistrationSerializer, HomeDataSerializer, UserSerializer, MonthlyTargetSerializer, TokenVerifySerializer
from .models import HomeData, User, MonthlyTarget
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.views import TokenViewBase
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.utils import timezone
from django.db.models import Sum
from calendar import monthrange
from django.http import JsonResponse

# ユーザー登録用のAPIビュー
# 新規ユーザーの登録処理を担当し、バリデーション済みのデータを保存
class RegistrationAPI(APIView):
    """
    ユーザー登録用の API ビュー。
    POSTメソッドで新規ユーザーを登録します。
    
    処理内容:
    - リクエストデータのバリデーション
    - ユーザー情報の保存
    - 登録成功/失敗のレスポンス返却
    """
    def post(self, request):
        # パスワードのハッシュ化
        request.data['password'] = make_password(request.data['password'])
        
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ホーム画面データの一覧取得・作成用APIビュー
# 認証済みユーザーのみアクセス可能
class HomeDataListCreateAPIView(generics.ListCreateAPIView):
    """
    認証済みユーザーのホームデータ一覧の取得と、新規作成を行う API ビュー。
    
    主な機能:
    - GETメソッド: ログインユーザーのホームデータ一覧を取得
    - POSTメソッド: 新規ホームデータの作成
    
    セキュリティ:
    - 認証済みユーザーのみアクセス可能
    - ユーザーは自身のデータのみ参照/作成可能
    """
    serializer_class = HomeDataSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return HomeData.objects.none()
            
        date = self.request.query_params.get('date', None)
        try:
            queryset = HomeData.objects.filter(user=self.request.user)
        except Exception as e:
            print(f"Database error: {str(e)}")
            return HomeData.objects.none()
        
        if date:
            queryset = queryset.filter(date=date)
        return queryset

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user,
            input_name=self.request.user.username
        )

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

# 更新用ビュー追加
class HomeDataRetrieveUpdateAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = HomeDataSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return HomeData.objects.filter(user=self.request.user)

class MonthlyTargetAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = MonthlyTargetSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """ユーザーの月次目標データを取得"""
        return MonthlyTarget.objects.filter(user=self.request.user)

    def get_object(self):
        """指定された年月の月次目標を取得または作成"""
        year_month = self.kwargs.get('year_month')
        if not year_month:
            year_month = self.request.query_params.get('year_month')
        
        if not year_month:
            return None
        
        obj, created = MonthlyTarget.objects.get_or_create(
            user=self.request.user,
            year_month=year_month,
            defaults={'target_acquisition': 0}
        )
        return obj

    def update(self, request, *args, **kwargs):
        """月次目標の更新"""
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def perform_update(self, serializer):
        """更新時にユーザーと年月を自動設定"""
        serializer.save(
            user=self.request.user,
            year_month=self.kwargs.get('year_month')
        )

class CustomTokenVerifyView(TokenViewBase):
    serializer_class = TokenVerifySerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            return Response({}, status=status.HTTP_200_OK)
        except TokenError as e:
            error_message = e.args[0] if e.args else 'Invalid token'
            return Response(
                {'error': error_message},
                status=status.HTTP_401_UNAUTHORIZED
            )

class MonthlySummaryAPI(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            today = timezone.now()
            year, month = today.year, today.month
            
            # デフォルト値設定
            default_values = {
                'total_call': 0,
                'total_catch': 0,
                'total_re_call': 0,
                'total_prospective': 0,
                'total_approach_ng': 0,
                'total_product_ng': 0,
                'total_acquisition': 0
            }
            
            # 集計結果にデフォルト値をマージ
            monthly_data = HomeData.objects.filter(
                user=request.user,
                date__year=year,
                date__month=month
            ).aggregate(
                total_call=Sum('call_count'),
                total_catch=Sum('catch_count'),
                total_re_call=Sum('re_call_count'),
                total_prospective=Sum('prospective_count'),
                total_approach_ng=Sum('approach_ng_count'),
                total_product_ng=Sum('product_explanation_ng_count'),
                total_acquisition=Sum('acquisition_count')
            )
            monthly_data = {k: (v if v is not None else 0) for k, v in monthly_data.items()}

            # 月の日数取得（ゼロ除算防止）
            try:
                _, num_days = monthrange(year, month)
                num_days = num_days if num_days > 0 else 30  # 最低30日を保証
            except:
                num_days = 30

            # 経過日数（最低1日を保証）
            current_day = today.day if today.day > 0 else 1

            # 月次目標取得（存在しない場合は0）
            target_acquisition = MonthlyTarget.objects.filter(
                user=request.user,
                year_month=f"{year}-{month:02}"
            ).values_list('target_acquisition', flat=True).first() or 0

            # 一日に必要な獲得数計算（ゼロ除算防止）
            try:
                daily_required_acquisition = target_acquisition / num_days
            except ZeroDivisionError:
                daily_required_acquisition = 0

            # 獲得率計算（ゼロ除算防止）
            try:
                acquisition_rate = (monthly_data['total_acquisition'] / monthly_data['total_catch']) * 100
            except ZeroDivisionError:
                acquisition_rate = 0

            # 一日に必要なキャッチ数計算
            try:
                daily_required_catch = (daily_required_acquisition * 100) / acquisition_rate
            except ZeroDivisionError:
                daily_required_catch = 0

            # 進捗率計算（ゼロ除算防止）
            try:
                progress_rate = ((monthly_data['total_acquisition'] / target_acquisition) /
                                (current_day / num_days)) * 100
            except ZeroDivisionError:
                progress_rate = 0

            # 仮想進捗件数
            try:
                virtual_progress_count = (current_day / num_days) * target_acquisition
            except ZeroDivisionError:
                virtual_progress_count = 0

            # 一日当たり平均獲得数（ゼロ除算防止）
            try:
                average_daily_acquisition = monthly_data['total_acquisition'] / current_day
            except ZeroDivisionError:
                average_daily_acquisition = 0

            # 月末獲得予測
            predicted_month_end_acquisition = average_daily_acquisition * num_days

            results = {
                're_call_rate': self.calculate_rate(monthly_data['total_re_call'], monthly_data['total_catch']),
                'prospective_rate': self.calculate_rate(monthly_data['total_prospective'], monthly_data['total_catch']),
                'approach_ng_rate': self.calculate_rate(monthly_data['total_approach_ng'], monthly_data['total_catch']),
                'product_ng_rate': self.calculate_rate(monthly_data['total_product_ng'], monthly_data['total_catch']),
                'acquisition_rate': acquisition_rate,
                'details': monthly_data,
                'daily_required_acquisition': round(daily_required_acquisition, 1),
                'daily_required_catch': round(daily_required_catch, 1),
                'progress_rate': round(progress_rate, 1),
                'virtual_progress_count': round(virtual_progress_count, 1),
                'average_daily_acquisition': round(average_daily_acquisition, 1),
                'predicted_month_end_acquisition': round(predicted_month_end_acquisition, 1)
            }

            return Response(results)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def calculate_rate(self, numerator, denominator):
        if denominator == 0:
            return 0
        return round((numerator / denominator) * 100, 1)

class DailySummaryAPI(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = timezone.localdate()
        daily_data = HomeData.objects.filter(
            user=request.user,
            date=today
        ).aggregate(
            daily_call=Sum('call_count'),
            daily_catch=Sum('catch_count'),
            daily_re_call=Sum('re_call_count'),
            daily_prospective=Sum('prospective_count'),
            daily_approach_ng=Sum('approach_ng_count'),
            daily_product_ng=Sum('product_explanation_ng_count'),
            daily_acquisition=Sum('acquisition_count')
        )

        catch_count = daily_data['daily_catch'] or 0
        results = {
            're_call_rate': self.calculate_rate(daily_data['daily_re_call'], catch_count),
            'prospective_rate': self.calculate_rate(daily_data['daily_prospective'], catch_count),
            'approach_ng_rate': self.calculate_rate(daily_data['daily_approach_ng'], catch_count),
            'product_ng_rate': self.calculate_rate(daily_data['daily_product_ng'], catch_count),
            'acquisition_rate': self.calculate_rate(daily_data['daily_acquisition'], catch_count),
            'details': daily_data
        }

        return Response(results)

    def calculate_rate(self, numerator, denominator):
        if denominator == 0:
            return 0
        return round((numerator / denominator) * 100, 1)

class CurrentUserAPI(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user_data = {
            'username': request.user.username,
        }
        return Response(user_data)
