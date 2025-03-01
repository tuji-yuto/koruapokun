# APIビュー定義
# クライアントからのリクエストを処理し、適切なレスポンスを返す

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


# ユーザー登録API
class RegistrationAPI(APIView):
    """
    新規ユーザー登録を処理するAPIビュー
    POSTリクエストでユーザー情報を受け取り、バリデーション後にDBに保存
    """
    def post(self, request):
        # パスワードをハッシュ化してからシリアライザに渡す
        request.data['password'] = make_password(request.data['password'])
        
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 営業データ一覧・作成API
class HomeDataListCreateAPIView(generics.ListCreateAPIView):
    """
    営業データの一覧取得と新規作成を行うAPI
    
    GET: ログインユーザーの営業データ一覧を取得（日付フィルタ可能）
    POST: 新規営業データを作成
    
    認証済みユーザーのみアクセス可能で、自分のデータのみ操作可能
    """
    serializer_class = HomeDataSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # 未認証の場合は空のクエリセットを返す
        if not self.request.user.is_authenticated:
            return HomeData.objects.none()
            
        # 日付フィルタの取得
        date = self.request.query_params.get('date', None)
        try:
            # ユーザーに紐づくデータのみ取得
            queryset = HomeData.objects.filter(user=self.request.user)
            # 日付指定があれば絞り込み
            if date:
                queryset = queryset.filter(date=date)
            return queryset
        except Exception as e:
            print(f"データベースエラー: {str(e)}")
            return HomeData.objects.none()

    def perform_create(self, serializer):
        # 作成時にユーザー情報を自動設定
        serializer.save(
            user=self.request.user,
            input_name=self.request.user.username
        )


# 営業データ詳細・更新API
class HomeDataRetrieveUpdateAPIView(generics.RetrieveUpdateAPIView):
    """
    営業データの詳細取得と更新を行うAPI
    認証済みユーザーのみ自分のデータを操作可能
    """
    serializer_class = HomeDataSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return HomeData.objects.filter(user=self.request.user)


# 月間目標管理API
class MonthlyTargetAPIView(generics.RetrieveUpdateAPIView):
    """
    月間目標の取得と更新を行うAPI
    指定された年月の目標がない場合は新規作成
    """
    serializer_class = MonthlyTargetSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """ログインユーザーの月次目標データを取得"""
        return MonthlyTarget.objects.filter(user=self.request.user)

    def get_object(self):
        """指定された年月の目標を取得（なければ作成）"""
        # URLパラメータまたはクエリパラメータから年月を取得
        year_month = self.kwargs.get('year_month') or self.request.query_params.get('year_month')
        
        if not year_month:
            return None
        
        # 該当月の目標を取得または作成
        obj, created = MonthlyTarget.objects.get_or_create(
            user=self.request.user,
            year_month=year_month,
            defaults={'target_acquisition': 0}
        )
        return obj

    def perform_update(self, serializer):
        """更新時にユーザーと年月を自動設定"""
        serializer.save(
            user=self.request.user,
            year_month=self.kwargs.get('year_month')
        )


# トークン検証API
class CustomTokenVerifyView(TokenViewBase):
    """JWTトークンの有効性を検証するAPI"""
    serializer_class = TokenVerifySerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            return Response({}, status=status.HTTP_200_OK)
        except TokenError as e:
            error_message = e.args[0] if e.args else 'トークンが無効です'
            return Response(
                {'error': error_message},
                status=status.HTTP_401_UNAUTHORIZED
            )


# 基本サマリーAPI機能
class BaseSummaryAPI(APIView):
    """
    営業実績サマリーの基本機能を提供する抽象クラス
    各種比率計算のユーティリティメソッドを定義
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def calculate_rate(self, numerator, denominator):
        """比率を計算（ゼロ除算対策あり）"""
        if denominator == 0:
            return 0
        return round((numerator / denominator) * 100, 1)


# 月間実績サマリーAPI
class MonthlySummaryAPI(BaseSummaryAPI):
    """
    月間および日次の営業実績サマリーを集計するAPI
    当月の実績と目標に対する進捗状況、および当日のデータを計算して返す
    """
    def get(self, request):
        try:
            # 現在の年月日を取得
            today = timezone.now()
            year, month = today.year, today.month
            
            # 当月のデータ集計
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
            
            # Noneを0に変換
            monthly_data = {k: (v if v is not None else 0) for k, v in monthly_data.items()}

            # 月の日数と経過日数を取得
            try:
                _, num_days = monthrange(year, month)
                num_days = max(num_days, 30)  # 最低30日を保証
                current_day = max(today.day, 1)  # 最低1日を保証
            except:
                num_days = 30
                current_day = 1

            # 月次目標を取得
            target_acquisition = MonthlyTarget.objects.filter(
                user=request.user,
                year_month=f"{year}-{month:02}"
            ).values_list('target_acquisition', flat=True).first() or 0

            # 各種指標の計算
            # 獲得率
            acquisition_rate = self.calculate_rate(monthly_data['total_acquisition'], monthly_data['total_catch'])
            
            # 一日あたりの必要獲得数
            daily_required_acquisition = target_acquisition / num_days if num_days > 0 else 0
            
            # 一日あたりの必要キャッチ数
            daily_required_catch = (daily_required_acquisition * 100) / acquisition_rate if acquisition_rate > 0 else 0
            
            # 進捗率（時間経過に対する目標達成率）
            time_progress = current_day / num_days if num_days > 0 else 0
            target_progress = monthly_data['total_acquisition'] / target_acquisition if target_acquisition > 0 else 0
            progress_rate = (target_progress / time_progress) * 100 if time_progress > 0 else 0
            
            # 仮想進捗件数（時間経過に応じた理想的な獲得数）
            virtual_progress_count = time_progress * target_acquisition
            
            # 一日あたり平均獲得数
            average_daily_acquisition = monthly_data['total_acquisition'] / current_day if current_day > 0 else 0
            
            # 月末獲得予測
            predicted_month_end_acquisition = average_daily_acquisition * num_days

            # 月間サマリー結果の整形
            monthly_results = {
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

            # 日次データの集計（DailySummaryAPIと同じロジック）
            today_date = timezone.localdate()
            daily_data = HomeData.objects.filter(
                user=request.user,
                date=today_date
            ).aggregate(
                daily_call=Sum('call_count'),
                daily_catch=Sum('catch_count'),
                daily_re_call=Sum('re_call_count'),
                daily_prospective=Sum('prospective_count'),
                daily_approach_ng=Sum('approach_ng_count'),
                daily_product_ng=Sum('product_explanation_ng_count'),
                daily_acquisition=Sum('acquisition_count')
            )

            # Noneを0に変換
            daily_data = {k: (v if v is not None else 0) for k, v in daily_data.items()}
            catch_count = daily_data['daily_catch']
            
            # 日次サマリー結果の整形
            daily_results = {
                're_call_rate': self.calculate_rate(daily_data['daily_re_call'], catch_count),
                'prospective_rate': self.calculate_rate(daily_data['daily_prospective'], catch_count),
                'approach_ng_rate': self.calculate_rate(daily_data['daily_approach_ng'], catch_count),
                'product_ng_rate': self.calculate_rate(daily_data['daily_product_ng'], catch_count),
                'acquisition_rate': self.calculate_rate(daily_data['daily_acquisition'], catch_count),
                'details': daily_data
            }

            # 日毎のデータを取得（グラフ表示用）
            daily_records = HomeData.objects.filter(
                user=request.user,
                date__year=year,
                date__month=month
            ).values('date', 'call_count', 'catch_count', 're_call_count', 
                    'prospective_count', 'approach_ng_count', 
                    'product_explanation_ng_count', 'acquisition_count')

            # 統合結果
            results = {
                'monthly': monthly_results,
                'daily': daily_results,
                'daily_records': list(daily_records)
            }

            return Response(results)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ログインユーザー情報API
class CurrentUserAPI(APIView):
    """
    現在ログイン中のユーザー情報を返すAPI
    認証済みユーザーのみアクセス可能
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user_data = {
            'username': request.user.username,
        }
        return Response(user_data)
