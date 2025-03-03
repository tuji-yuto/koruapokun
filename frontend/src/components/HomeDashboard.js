"use client"; // クライアントサイドでのみ実行されるコンポーネントであることを示す
import { useState, useEffect } from "react"; // 状態管理と副作用処理のためのフックをインポート
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Paper,
  useTheme,
  Alert,
  Button,
  TextField,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  AppBar,
  Toolbar,
  LinearProgress,
  IconButton,
  CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import React from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ja } from 'date-fns/locale';
import { styled } from '@mui/system';
import { PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ResponsiveContainer } from 'recharts';
import { Person, Edit } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

// APIのベースURL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://koruapokun-4.onrender.com';

// アニメーション設定
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

// 主要KPI計算関数
const calculateKPIs = (data = {}) => {
  const base = data.catches || 1; // ゼロ除算防止のため1をデフォルト値
  return {
    recallRate: ((data.recall / base) * 100).toFixed(1),
    prospectRate: ((data.prospect / base) * 100).toFixed(1),
    approachNGRate: ((data.approachNG / base) * 100).toFixed(1),
    explanationNGRate: ((data.explanationNG / base) * 100).toFixed(1),
    acquisitionRate: ((data.acquisition / base) * 100).toFixed(1),
  };
};

// 目標達成計算関数
const calculateTargets = (target, current, days) => {
  const dailyRequired = (target - current) / days;
  return {
    dailyCatch: ((dailyRequired * 100) / acquisitionRate).toFixed(0),
    dailyCall: (dailyCatch * 3).toFixed(0) // 仮定: 1キャッチに3コール必要
  };
};

// 安全な進捗率計算関数
const calculateSafeProgress = (acquisition, target) => {
  if (!acquisition || !target || target <= 0) return 0;
  const rawValue = (acquisition / target) * 100;
  return Math.min(Math.max(Number(rawValue.toFixed(2)), 0), 100);
};

// 進捗率表示コンポーネント（安全な値計算付き）
const ProgressDisplay = ({ value = 0, isLoading = false }) => {
  const safeValue = Math.min(Math.max(Number(value), 0), 100);
  
  return (
    <Box sx={{ width: '100%' }}>
      <LinearProgress 
        variant="determinate" 
        value={safeValue} 
        sx={{ 
          height: 20, 
          borderRadius: 2,
          '& .MuiLinearProgress-bar': { backgroundColor: '#3B82F6' },
          '& .MuiLinearProgress-root': { backgroundColor: '#f5f7fa' }
        }}
      />
    </Box>
  );
};

// ユーザー名取得関数の追加
const getUsernameFromToken = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return 'ゲストユーザー';
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.username || 'ユーザー';
  } catch (error) {
    console.error('トークン解析エラー:', error);
    return 'ユーザー';
  }
};

// データ有無チェック関数
const hasValidData = (data) => {
  return data && 
    data.catches > 0 &&
    data.acquisition > 0 &&
    data.day > 0;
};

const refreshToken = async () => {
  try {
    const refresh = localStorage.getItem('refreshToken');
    if (!refresh) {
      router.push('/login');
      return false;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh })
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('accessToken', data.access);
      return true;
    }
    return false;
  } catch (error) {
    console.error('トークンリフレッシュ失敗:', error);
    return false;
  }
};

// 日付変換関数の追加
const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const verifyToken = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;

    const response = await fetch(`${API_BASE_URL}/api/token/verify/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    });

    if (!response.ok) {
      console.error('Token verification failed');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Network error:', error.message);
    return false;
  }
};

// API呼び出し前にトークンを検証
const fetchData = async () => {
  const isValid = await verifyToken();
  if (!isValid) {
    const refreshed = await refreshToken();
    if (!refreshed) router.push('/login');
  }
  // データ取得処理...
};

const PerformanceIndicator = ({ label, value }) => (
  <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, textAlign: 'center' }}>
    <Typography variant="subtitle2" gutterBottom>
      {label}
    </Typography>
    <Typography variant="h4" color="primary.main">
      {value}%
    </Typography>
  </Box>
);

// HomeDashboardコンポーネント内のuseEffectの後にグラフ用データ加工処理を追加
const processChartData = (data) => {
  return data
    .map(item => ({
      date: new Date(item.date).getDate() + '日',
      電話対応数: item.catch_count,
      再コール数: item.re_call_count,
      見込客数: item.prospective_count,
      アプローチNG数: item.approach_ng_count,
      商品説明後NG数: item.product_explanation_ng_count,
      獲得数: item.acquisition_count
    }))
    .sort((a, b) => {
      const aDay = parseInt(a.date.replace('日', ''));
      const bDay = parseInt(b.date.replace('日', ''));
      return aDay - bDay;
    });
};

// グラフ用色設定を更新
const lineColors = [
  '#4158D0',  // メインの青
  '#3B82F6',  // 明るい青
  '#14B8A6',  // ティール
  '#8B5CF6',  // パープル
  '#EC4899',  // ピンク
  '#F59E0B'   // オレンジ
];

// 円グラフ用の色も更新
const COLORS = [
  '#4158D0',  // メインの青
  '#14B8A6',  // ティール
  '#8B5CF6',  // パープル
  '#EC4899',  // ピンク
  '#F59E0B'   // オレンジ
];

// InputFormコンポーネントを修正
const InputForm = React.memo(({ onSubmit, formData, setFormData, loading }) => {
  const validateForm = () => {
    return (
      formData.date &&
      formData.call_count !== '' &&
      formData.catch_count !== '' &&
      formData.re_call_count !== '' &&
      formData.prospective_count !== '' &&
      formData.approach_ng_count !== '' &&
      formData.product_explanation_ng_count !== '' &&
      formData.acquisition_count !== ''
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'すべての項目を入力してください',
        severity: 'error'
      });
      return;
    }
    onSubmit(e);
  };

  // 入力フィールドの定義
  const inputFields = [
    { label: '営業日', name: 'date', type: 'date' },
    { label: '電話発信数', name: 'call_count', type: 'number' },
    { label: '電話対応数', name: 'catch_count', type: 'number' },
    { label: '再コール数', name: 're_call_count', type: 'number' },
    { label: '見込客数', name: 'prospective_count', type: 'number' },
    { label: 'アプローチNG', name: 'approach_ng_count', type: 'number' },
    { label: '商品説明NG', name: 'product_explanation_ng_count', type: 'number' },
    { label: '獲得数', name: 'acquisition_count', type: 'number' },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
      <form onSubmit={handleSubmit}>
        <Box sx={{
          display: 'flex',
          gap: { xs: 1, sm: 1.5 },  // モバイルではギャップを小さく
          flexWrap: { xs: 'wrap', md: 'nowrap' },  // モバイルでは折り返し
          alignItems: 'flex-start',
          width: '100%',
        }}>
          {inputFields.map((field) => (
            <Box key={field.name} sx={{
              flex: { xs: '0 0 calc(50% - 8px)', sm: '0 0 calc(33.333% - 8px)', md: 1 },  // モバイルでは2列、タブレットでは3列
              minWidth: field.type === 'date' ? { xs: '100%', sm: '170px' } : 0,  // 日付フィールドはモバイルでは全幅
              mb: { xs: 1, md: 0 },  // モバイルでは下マージンを追加
            }}>
              <Typography variant="caption" sx={{
                fontWeight: 600,
                color: '#333',
                mb: 0.5,
                display: 'block',
                fontSize: { xs: '0.8rem', sm: '0.9rem' },  // モバイルではフォントサイズを小さく
                textAlign: { xs: 'left', md: 'right' }  // モバイルでは左揃え
              }}>
                {field.label}
              </Typography>
              <Box sx={{
                backgroundColor: '#fbf8f4',
                borderRadius: '8px',
                border: `1px solid ${alpha('#3B82F6', 0.2)}`,
                overflow: 'hidden',
                '&:hover': {
                  border: `1px solid ${alpha('#3B82F6', 0.3)}`,
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    border: 'none'
                  },
                  '&.Mui-focused': {
                    outline: 'none',
                    '& fieldset': {
                      border: 'none'
                    }
                  },
                  '&:focus, &:focus-within': {
                    outline: 'none',
                    boxShadow: 'none'
                  }
                },
                '& .MuiInputBase-root': {
                  width: '100%',
                  height: { xs: '40px', md: '36px' },  // モバイルでは高さを調整
                  '&:focus, &:focus-within': {
                    outline: 'none',
                    boxShadow: 'none'
                  },
                  '&.Mui-focused': {
                    outline: 'none',
                    boxShadow: 'none'
                  }
                },
                '& .MuiIconButton-root': {
                  '&:focus': {
                    outline: 'none',
                    boxShadow: 'none'
                  }
                },
                '& *': {
                  outline: 'none !important',
                  boxShadow: 'none !important'
                }
              }}>
                {field.type === 'date' ? (
                  <DatePicker
                    value={formData.date}
                    onChange={(newValue) => setFormData(prev => ({ ...prev, date: newValue }))}
                    format="yyyy/MM/dd"
                    sx={{ width: '100%' }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        sx: { 
                          '& .MuiOutlinedInput-root': {
                            border: 'none',
                            backgroundColor: 'transparent',
                            height: { xs: '40px', md: '36px' },  // モバイルでは高さを調整
                            fontSize: { xs: '0.9rem', md: '1rem' },  // モバイルではフォントサイズを小さく
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: 'none'
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              border: 'none'
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              border: 'none'
                            }
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <TextField
                    fullWidth
                    variant="standard"
                    InputProps={{
                      disableUnderline: true,
                      sx: { 
                        fontSize: { xs: '0.9rem', md: '1rem' },  // モバイルではフォントサイズを小さく
                        fontWeight: 500,
                        height: { xs: '40px', md: '36px' },  // モバイルでは高さを調整
                        px: 1,
                        '&:focus, &:focus-within': {
                          outline: 'none',
                          boxShadow: 'none'
                        }
                      }
                    }}
                    value={formData[field.name] || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d+$/.test(value)) {
                        setFormData(prev => ({
                          ...prev,
                          [field.name]: value
                        }));
                      }
                    }}
                    inputProps={{
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                      style: { textAlign: 'right' }
                    }}
                  />
                )}
              </Box>
            </Box>
          ))}

          {/* 送信ボタン */}
          <Box sx={{
            flex: { xs: '0 0 100%', md: '0 0 auto' },  // モバイルでは全幅
            alignSelf: { xs: 'center', md: 'flex-end' },  // モバイルでは中央揃え
            mt: { xs: 2, md: 0 },  // モバイルでは上マージンを追加
            mb: { xs: 0, md: '1px' }
          }}>
            <Button
              variant="contained"
              type="submit"
              disabled={!validateForm() || loading}
              sx={{
                height: { xs: '44px', md: '36px' },  // モバイルでは高さを大きく
                width: { xs: '100%', md: 'auto' },  // モバイルでは全幅
                backgroundColor: '#3B82F6',
                borderRadius: '8px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                px: 3,
                fontSize: { xs: '1rem', md: '0.95rem' },  // モバイルではフォントサイズを大きく
                '&:hover': {
                  backgroundColor: alpha('#3B82F6', 0.8)
                },
                position: 'relative'
              }}
            >
              {loading ? (
                <CircularProgress 
                  size={24} 
                  sx={{
                    color: '#fff',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-12px',
                    marginLeft: '-12px',
                  }}
                />
              ) : '登録'}
            </Button>
          </Box>
        </Box>
      </form>
    </LocalizationProvider>
  );
});

export default function HomeDashboard() {
  const [homeData, setHomeData] = useState([{
    catches: 0,
    recall: 0,
    prospect: 0,
    approachNG: 0,
    explanationNG: 0,
    acquisition: 0,
    day: 1
  }]); // ホームデータを管理するための状態
  const [error, setError] = useState(null); // エラーメッセージを管理するための状態
  const theme = useTheme();
  const router = useRouter();
  
  // ユーザー名状態の追加
  const [username, setUsername] = useState('');
  
  // Snackbar の状態管理
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'  // 'success' | 'error' | 'warning' | 'info'
  });

  // Snackbar を閉じる関数
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const [monthlyTarget, setMonthlyTarget] = useState(null);
  const [targetDialog, setTargetDialog] = useState(false);
  const [newTarget, setNewTarget] = useState('');
  
  // 現在の年月を取得
  const getCurrentYearMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };
  
  // 月次目標を取得
  const fetchMonthlyTarget = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/monthly-target/?year_month=${getCurrentYearMonth()}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setMonthlyTarget(data);
      } else {
        console.error('月次目標取得エラー:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('月次目標取得エラー:', error);
      setSnackbar({
        open: true,
        message: `月次目標取得中にエラーが発生しました: ${error.message || '不明なエラー'}`,
        severity: 'error'
      });
    }
  };
  
  // 目標設定ダイアログを開く
  const handleOpenTargetDialog = () => {
    setNewTarget(monthlyTarget?.target_acquisition || '');
    setTargetDialog(true);
  };
  
  // 目標設定を保存
  const handleSaveTarget = async () => {
    try {
      // ローディング開始
      setLoading(true);
      
      let url = `${API_BASE_URL}/api/monthly-target/${getCurrentYearMonth()}/`;
      
      const response = await fetch(
        url,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify({
            target_acquisition: parseInt(newTarget)
          })
        }
      );
      
      if (response.ok) {
        // MonthlyTargetAPIの保存が成功した後に実行
        await fetchMonthlyTarget();  // 目標値を再取得
        await fetchMonthlySummary(); // サマリーデータを再計算・取得
        
        setSnackbar({
          open: true,
          message: '月次目標を保存しました',
          severity: 'success'
        });
        setTargetDialog(false);
      } else {
        throw new Error('目標の保存に失敗しました');
      }
    } catch (error) {
      console.error('Error saving monthly target:', error);
      setSnackbar({
        open: true,
        message: 'エラーが発生しました',
        severity: 'error'
      });
    } finally {
      // ローディング終了
      setLoading(false);
    }
  };

  useEffect(() => {
    // コンポーネントマウント時にユーザー名取得
    const name = getUsernameFromToken();
    setUsername(name);
  }, []);

  const fetchHomeData = async () => {
    try {
      console.log('Verifying token...');
      const isValid = await verifyToken();
      console.log('Token validation result:', isValid);
      
      if (!isValid) {
        const refreshed = await refreshToken();
        if (!refreshed) {
          router.push('/login');
          return;
        }
      }
      
      // データ取得処理を続行
      const res = await fetch(`${API_BASE_URL}/api/daily-record/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setHomeData(data);
      } else {
        console.error('ホームデータ取得エラー:', res.status, res.statusText);
      }
    } catch (error) {
      console.error('データ取得エラー:', error);
      setSnackbar({
        open: true,
        message: `データ取得中にエラーが発生しました: ${error.message || '不明なエラー'}`,
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    fetchHomeData();
    fetchMonthlyTarget();
  }, [router]);

  // サンプルデータ
  const sampleData = homeData.length > 0 ? homeData : [
    { name: "獲得率", value: 70 },
    { name: "NG率", value: 30 },
  ];

  // 目標入力ハンドラー
  const handleTargetChange = (name, value) => {
    const sanitizedValue = Math.max(Number(value), 1);
    setTargets(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
  };

  const [formData, setFormData] = useState({
    date: null,
    call_count: '',
    catch_count: '',
    re_call_count: '',
    prospective_count: '',
    approach_ng_count: '',
    product_explanation_ng_count: '',
    acquisition_count: '',
  });

  const [monthlyPerformance, setMonthlyPerformance] = useState({
    details: {
      total_call: 0,
      total_catch: 0,
      total_re_call: 0,
      total_prospective: 0,
      total_approach_ng: 0,
      total_product_ng: 0,
      total_acquisition: 0,
    },
    acquisition_rate: 0,
    progress_rate: 0,
  });

  const [dailyPerformance, setDailyPerformance] = useState({
    details: {
      daily_call: 0,
      daily_catch: 0,
      daily_re_call: 0,
      daily_prospective: 0,
      daily_approach_ng: 0,
      daily_product_ng: 0,
      daily_acquisition: 0,
    },
  });

  // 必要獲得数の計算
  const calculateRequiredAcquisition = () => {
    const targetAcquisition = monthlyTarget?.target_acquisition || 0;
    const numDaysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    return targetAcquisition / numDaysInMonth;
  };

  const requiredAcquisition = calculateRequiredAcquisition();
  const isAcquisitionSufficient = dailyPerformance.details.daily_acquisition >= requiredAcquisition;

  // 必要対応数の計算
  const calculateRequiredCatch = () => {
    const targetAcquisition = monthlyTarget?.target_acquisition || 0;
    const numDaysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const dailyRequiredAcquisition = targetAcquisition / numDaysInMonth;
    const acquisitionRate = monthlyPerformance.acquisition_rate || 0;
    return acquisitionRate > 0 ? (dailyRequiredAcquisition * 100) / acquisitionRate : 0;
  };

  const requiredCatch = calculateRequiredCatch();
  const isCatchSufficient = dailyPerformance.details.daily_catch >= requiredCatch;

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);  // ローディング開始
    
    try {
      // 選択された日付で既存データをチェック
      // 日本時間で日付を取得
      const date = new Date(formData.date);
      const selectedDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
        .toISOString()
        .split('T')[0];

      const existingData = await checkExistingData(selectedDate);
      
      let url = `${API_BASE_URL}/api/daily-record/`;
      let method = 'POST';
      
      // 既存データがある場合はPUTリクエストに変更
      if (existingData) {
        url = `${API_BASE_URL}/api/daily-record/${existingData.id}/`;
        method = 'PUT';
      }

      // 送信データの準備
      const submitData = {
        ...formData,
        date: selectedDate
      };
      
      const response = await fetch(
        url,
        {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify(submitData)
        }
      );

      if (response.ok) {
        // 保存成功後に全てのデータを再取得
        await fetchHomeData();
        await fetchMonthlySummary();
        
        setSnackbar({
          open: true,
          message: 'データを保存しました',
          severity: 'success'
        });
        setFormData({
          // 日本時間で現在の日付を設定
          date: new Date(new Date().getTime() + (9 * 60 * 60 * 1000)),
          call_count: '',
          catch_count: '',
          re_call_count: '',
          prospective_count: '',
          approach_ng_count: '',
          product_explanation_ng_count: '',
          acquisition_count: ''
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setSnackbar({
        open: true,
        message: 'エラーが発生しました',
        severity: 'error'
      });
    } finally {
      setLoading(false);  // ローディング終了
    }
  };

  // 既存データチェック関数
  const checkExistingData = async (date) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/daily-record/?date=${date}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.length > 0 ? data[0] : null;
      }
      return null;
    } catch (error) {
      console.error('Error checking existing data:', error);
      return null;
    }
  };

  const fetchMonthlySummary = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/monthly-summary/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        // データが存在しない場合は空のデータをセット
        if (response.status === 404) {
          setMonthlyPerformance({
            details: {
              total_call: 0,
              total_catch: 0,
              total_re_call: 0,
              total_prospective: 0,
              total_approach_ng: 0,
              total_product_ng: 0,
              total_acquisition: 0,
            },
            acquisition_rate: 0,
            progress_rate: 0,
          });
          setDailyPerformance({
            details: {
              daily_call: 0,
              daily_catch: 0,
              daily_re_call: 0,
              daily_prospective: 0,
              daily_approach_ng: 0,
              daily_product_ng: 0,
              daily_acquisition: 0
            }
          });
          // グラフデータも空にセット
          setHomeData([]);
          return;
        }
        console.error('API error');
        return;
      }

      const data = await response.json();
      
      // 月間データをセット
      setMonthlyPerformance(data.monthly);
      
      // 日次データをセット
      setDailyPerformance(data.daily);
      
      // グラフ用データをセット
      if (data.daily_records && data.daily_records.length > 0) {
        setHomeData(data.daily_records);
      }
    } catch (error) {
      console.error('Error fetching summary data:', error.message);
      // エラー時も空データをセット
      setMonthlyPerformance({
        details: {
          total_call: 0,
          total_catch: 0,
          total_re_call: 0,
          total_prospective: 0,
          total_approach_ng: 0,
          total_product_ng: 0,
          total_acquisition: 0,
        },
        acquisition_rate: 0,
        progress_rate: 0,
      });
      setDailyPerformance({
        details: {
          daily_call: 0,
          daily_catch: 0,
          daily_re_call: 0,
          daily_prospective: 0,
          daily_approach_ng: 0,
          daily_product_ng: 0,
          daily_acquisition: 0
        }
      });
    }
  };

  useEffect(() => {
    fetchMonthlySummary();
  }, []);

  // ユーザー名取得
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/current-user/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await response.json();
      setUsername(data.username);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchMonthlySummary();
  }, []);

  // 月次目標の表示部分を修正
  const MonthlyTargetDisplay = () => {
    const progressRate = monthlyPerformance?.progress_rate || 0;
    const target = monthlyTarget?.target_acquisition || 1;
    const actual = monthlyPerformance?.details?.total_acquisition || 0;
    
    const achievementRate = target > 0 
      ? Math.min((actual / target) * 100, 100).toFixed(1)
      : 0;

    return (
      <Box sx={{ 
        mb: 4,
        p: { xs: 2, md: 4 },  // モバイルではパディングを小さく
        borderRadius: { xs: '12px', md: '20px' },  // モバイルでは角丸を小さく
        background: '#f5f7fa',
        border: `1px solid ${alpha('#3B82F6', 0.2)}`,
        boxShadow: '0 4px 30px rgba(59, 130, 246, 0.1)',
      }}>
        <Typography 
          variant="h5" 
          gutterBottom 
          sx={{ 
            mb: { xs: 2, md: 3 },  // モバイルでは下マージンを小さく
            fontWeight: 600,
            letterSpacing: '0.5px',
            color: '#262724',
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
            borderBottom: `1px solid ${alpha('#3B82F6', 0.15)}`,
            pb: { xs: 1, md: 2 },  // モバイルではパディングを小さく
            fontSize: { xs: '1.2rem', md: '1.5rem' }  // モバイルではフォントサイズを小さく
          }}
        >
          {new Date().getMonth() + 1}月の目標
        </Typography>
        <Grid container spacing={{ xs: 2, md: 3 }} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
            <Box sx={{
              ...innerBoxStyle,
              p: { xs: 2, md: 3 },
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                color: '#262724',
                fontSize: { xs: '0.825rem', md: '0.95rem' }  // フォントサイズを小さく調整
              }}>
                目標獲得数<br />{target}件
              </Typography>
              <IconButton 
                size="small"
                onClick={handleOpenTargetDialog}
                sx={{
                  color: '#3B82F6',
                  '&:hover': {
                    backgroundColor: alpha('#3B82F6', 0.1)
                  }
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Box sx={{
              ...innerBoxStyle,
              p: { xs: 2, md: 3 }
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                color: '#262724',
                fontSize: { xs: '0.825rem', md: '0.95rem' }  // フォントサイズを統一
              }}>
                今月の獲得数<br />{actual}件
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Box sx={{
              ...innerBoxStyle,
              p: { xs: 2, md: 3 }
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                color: '#262724',
                fontSize: { xs: '0.825rem', md: '0.95rem' }  // フォントサイズを統一
              }}>
                必要獲得数 日<br />{calculateRequiredAcquisition().toFixed(1)}件
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Box sx={{
              ...innerBoxStyle,
              p: { xs: 2, md: 3 }
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                color: '#262724',
                fontSize: { xs: '0.825rem', md: '0.95rem' }  // フォントサイズを統一
              }}>
                必要対応数 日<br />{calculateRequiredCatch().toFixed(1)}件
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Box sx={{
              ...innerBoxStyle,
              p: { xs: 2, md: 3 }
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                color: '#262724',
                fontSize: { xs: '0.825rem', md: '0.95rem' }  // フォントサイズを統一
              }}>
                進捗率<br />{progressRate.toFixed(1)}%
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Box sx={{
              ...innerBoxStyle,
              p: { xs: 2, md: 3 }
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                color: '#262724',
                fontSize: { xs: '0.825rem', md: '0.95rem' }  // フォントサイズを統一
              }}>
                達成率：{achievementRate}%
              </Typography>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                color: '#262724',
                fontSize: { xs: '0.825rem', md: '0.95rem' }  // フォントサイズを統一
              }}>
              </Typography>
              <Box sx={{ mt: 1 }}>
                <ProgressDisplay 
                  value={achievementRate}
                  sx={{
                    '& .MuiLinearProgress-root': {
                      background: '#f5f7fa',
                    },
                    '& .MuiLinearProgress-bar': {
                      background: '#3B82F6'
                    }
                  }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

  function handleInputChange(event) {
    const { name, value } = event.target;
    // 入力が数字のみであることを確認
    if (!isNaN(value)) {
        setFormData({
            ...formData,
            [name]: value
        });
    }
  }

  // ログアウト処理関数
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/login');
  };

  // 共通のボックススタイル
  const commonBoxStyle = {
    p: { xs: 2, md: 4 },  // モバイルではパディングを小さく
    borderRadius: { xs: '12px', md: '20px' },  // モバイルでは角丸を小さく
    background: '#f5f7fa',
    border: `1px solid ${alpha('#3B82F6', 0.2)}`,
    boxShadow: '0 4px 30px rgba(59, 130, 246, 0.1)',
  };

  // 内部のカードスタイル
  const innerBoxStyle = {
    p: { xs: 2, md: 3 },  // モバイルではパディングを小さく
    borderRadius: { xs: '10px', md: '15px' },  // モバイルでは角丸を小さく
    background: '#f5f7fa',
    border: `1px solid ${alpha('#3B82F6', 0.15)}`,
  };

  return (
    <Box sx={{ 
      position: 'relative',
      flexGrow: 1,
      pb: 4,
      backgroundColor: '#FFFFFF', // 白の単色背景に変更
    }}>
      {/* 白の背景のみにするため、オーバーレイを削除 */}
      
      {/* コンテンツ */}
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        {/* ヘッダー部分 */}
        <AppBar 
          position="sticky" 
          sx={{ 
            background: alpha('#3B82F6', 0.8),
            boxShadow: '0 2px 15px rgba(59, 130, 246, 0.2)',
            mb: 4,
            borderBottom: `1px solid ${alpha('#FFFFFF', 0.3)}`,
            border: 'none',
            backgroundColor: 'transparent'
          }}
        >
          <Toolbar sx={{ 
            minHeight: { xs: '56px !important', md: '64px !important' },  // モバイルでは高さを小さく
            justifyContent: 'space-between',
            px: { xs: 1, sm: 2, md: 4 },  // モバイルでは左右パディングを小さく
            background: 'transparent'  // ツールバー背景も透明に
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {/* ヘッダー画像 */}
              <Box
                component="img"
                src="/images/ヘッダー画像.png" 
                alt="ヘッダー画像"
                sx={{
                  height: { xs: '40px', sm: '48px', md: '56px' },
                  width: 'auto',
                  borderRadius: '4px'
                }}
              />
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: { xs: 1, md: 2 }  // モバイルではギャップを小さく
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1,
                px: { xs: 1, md: 2 },  // モバイルではパディングを小さく
                py: 1,
                borderRadius: '8px',
                background: alpha('#FFFFFF', 0.2),
              }}>
                <Person sx={{ 
                  fontSize: { xs: '1.2rem', md: '1.4rem' },  // モバイルではアイコンを小さく
                  color: '#262724'
                }}/>
                <Typography sx={{ 
                  fontWeight: 500,
                  color: '#262724',
                  fontSize: { xs: '0.8rem', md: '1rem' },  // モバイルではフォントサイズを小さく
                  display: { xs: 'none', sm: 'block' }  // モバイルでは非表示
                }}>
                  {username} さん
                </Typography>
                <Typography sx={{ 
                  fontWeight: 500,
                  color: '#262724',
                  fontSize: '0.8rem',
                  display: { xs: 'block', sm: 'none' }  // モバイルのみ表示
                }}>
                  {username}
                </Typography>
              </Box>
              
              <Button 
                variant="outlined"
                color="inherit"
                sx={{ 
                  borderRadius: '8px',
                  px: { xs: 1, md: 2 },  // モバイルではパディングを小さく
                  py: 0.5,
                  textTransform: 'none',
                  borderColor: alpha('#FFFFFF', 0.3),
                  color: '#262724',
                  background: alpha('#FFFFFF', 0.1),
                  fontSize: { xs: '0.75rem', md: '0.875rem' },  // モバイルではフォントサイズを小さく
                  '&:hover': {
                    borderColor: '#FFFFFF',
                    backgroundColor: alpha('#FFFFFF', 0.2)
                  }
                }}
                onClick={handleLogout}
              >
                ログアウト
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Container maxWidth="lg" sx={{ 
            px: { xs: 1, sm: 1, md: 2 },  // 左右の余白を狭く設定（xs: 8px, md: 16px）
            '& .MuiPaper-root': {
              borderRadius: { xs: '12px', md: '20px' },  // モバイルでは角丸を小さく
              border: `1px solid ${alpha('#3B82F6', 0.2)}`,
              boxShadow: '0 4px 30px rgba(59, 130, 246, 0.1)',
              background: '#f5f7fa',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 30px rgba(59, 130, 246, 0.15)'
              }
            }
          }}>
            <Box sx={{ 
              mb: 4,
              p: { xs: 2, md: 4 },  // モバイルではパディングを小さく
              borderRadius: { xs: '12px', md: '20px' },  // モバイルでは角丸を小さく
              background: '#f5f7fa',
              border: `1px solid ${alpha('#3B82F6', 0.2)}`,
              boxShadow: '0 4px 30px rgba(59, 130, 246, 0.1)',
            }}>
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  mb: { xs: 2, md: 3 },  // モバイルでは下マージンを小さく
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  color: '#262724',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                  borderBottom: `1px solid ${alpha('#3B82F6', 0.15)}`,
                  pb: { xs: 1, md: 2 },  // モバイルではパディングを小さく
                  fontSize: { xs: '1.2rem', md: '1.5rem' }  // モバイルではフォントサイズを小さく
                }}
              >
                日次データ入力
              </Typography>
              <InputForm 
                onSubmit={handleSubmit}
                formData={formData}
                setFormData={setFormData}
                loading={loading}
              />
            </Box>
            <MonthlyTargetDisplay />

            {/* 当日データの表示 */}
            <Box sx={{ 
              mt: 4,
              p: { xs: 2, md: 4 },  // モバイルではパディングを小さく
              borderRadius: { xs: '12px', md: '20px' },  // モバイルでは角丸を小さく
              background: '#f5f7fa',
              border: `1px solid ${alpha('#3B82F6', 0.2)}`,
              boxShadow: '0 4px 30px rgba(59, 130, 246, 0.1)',
            }}>
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  mb: { xs: 2, md: 3 },  // モバイルでは下マージンを小さく
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  color: '#262724',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                  borderBottom: `1px solid ${alpha('#3B82F6', 0.15)}`,
                  pb: { xs: 1, md: 2 },  // モバイルではパディングを小さく
                  fontSize: { xs: '1.2rem', md: '1.5rem' }  // モバイルではフォントサイズを小さく
                }}
              >
                当日データ
              </Typography>
              <Grid container spacing={{ xs: 2, md: 3 }}>  {/* モバイルではグリッド間隔を小さく */}
                {/* テーブル部分 (左半分) */}
                <Grid item xs={12} md={6}>
                  <TableContainer component={Paper} sx={{
                    backgroundColor: '#f5f7fa',  // テーブル背景色変更
                    '& .MuiTableCell-head': {
                      fontWeight: 600,
                      backgroundColor: alpha('#3B82F6', 0.1),
                      borderBottom: `1px solid ${alpha('#3B82F6', 0.15)}`,
                      fontSize: { xs: '0.8rem', md: '0.875rem' },  // モバイルではフォントサイズを小さく
                      padding: { xs: '8px 6px', md: '16px' }  // モバイルではパディングを小さく
                    },
                    '& .MuiTableCell-body': {
                      py: { xs: 1, md: 2 },  // モバイルではパディングを小さく
                      px: { xs: '6px', md: '16px' },  // モバイルではパディングを小さく
                      fontSize: { xs: '0.8rem', md: '0.875rem' },  // モバイルではフォントサイズを小さく
                      borderBottom: `1px solid ${alpha('#3B82F6', 0.3)}`
                    },
                    '& .MuiTableRow-root:hover': {
                      backgroundColor: alpha('#3B82F6', 0.05)
                    }
                  }}>
                    <Table size="small">  {/* モバイルではテーブルサイズを小さく */}
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: '#262724' }}>項目</TableCell>
                          <TableCell align="right" sx={{ color: '#262724' }}>数値</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ color: '#262724' }}>電話発信数</TableCell>
                          <TableCell align="right" sx={{ color: '#262724' }}>{dailyPerformance.details.daily_call || 0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: '#262724' }}>電話対応数</TableCell>
                          <TableCell align="right" sx={{ color: '#262724' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                              {isCatchSufficient ? (
                                <img 
                                  src="/images/太陽アイコン.png" 
                                  alt="足りている" 
                                  style={{ 
                                    width: '1.2rem', 
                                    height: '1.2rem',
                                    marginRight: '4px'
                                  }} 
                                />
                              ) : (
                                <img 
                                  src="/images/雨アイコン.png" 
                                  alt="足りていない" 
                                  style={{ 
                                    width: '1.2rem', 
                                    height: '1.2rem',
                                    marginRight: '4px'
                                  }} 
                                />
                              )}
                              {isCatchSufficient ? '足りている' : '足りていない'} {dailyPerformance.details.daily_catch || 0}
                            </span>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: '#262724' }}>再コール数</TableCell>
                          <TableCell align="right" sx={{ color: '#262724' }}>{dailyPerformance.details.daily_re_call || 0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: '#262724' }}>見込客数</TableCell>
                          <TableCell align="right" sx={{ color: '#262724' }}>{dailyPerformance.details.daily_prospective || 0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: '#262724' }}>アプローチNG</TableCell>
                          <TableCell align="right" sx={{ color: '#262724' }}>{dailyPerformance.details.daily_approach_ng || 0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: '#262724' }}>商品説明NG</TableCell>
                          <TableCell align="right" sx={{ color: '#262724' }}>{dailyPerformance.details.daily_product_ng || 0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: '#262724' }}>獲得数</TableCell>
                          <TableCell align="right" sx={{ color: '#262724' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                              {isAcquisitionSufficient ? (
                                <img 
                                  src="/images/太陽アイコン.png" 
                                  alt="足りている" 
                                  style={{ 
                                    width: '1.2rem', 
                                    height: '1.2rem',
                                    marginRight: '4px'
                                  }} 
                                />
                              ) : (
                                <img 
                                  src="/images/雨アイコン.png" 
                                  alt="足りていない" 
                                  style={{ 
                                    width: '1.2rem', 
                                    height: '1.2rem',
                                    marginRight: '4px'
                                  }} 
                                />
                              )}
                              {isAcquisitionSufficient ? '足りている' : '足りていない'} {dailyPerformance.details.daily_acquisition || 0}
                            </span>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                {/* 円グラフ部分 (右半分) */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ 
                    ...innerBoxStyle,
                    background: '#f5f7fa',  // 明示的に指定
                    height: '100%',
                    p: { xs: 1, md: 3 },  // モバイルではパディングを小さく
                  }}>
                    <Typography variant="subtitle1" align="center" gutterBottom sx={{
                      fontWeight: 600,
                      color: '#262724',
                      mb: 2,
                      fontSize: { xs: '0.9rem', md: '1rem' }  // モバイルではフォントサイズを小さく
                    }}>
                      当日パフォーマンス比率
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>  {/* ResponsiveContainerを使用 */}
                      <PieChart>
                        <Pie
                          data={[
                            { name: '再コール率', value: dailyPerformance.re_call_rate || 0 },
                            { name: '見込率', value: dailyPerformance.prospective_rate || 0 },
                            { name: 'アプローチNG率', value: dailyPerformance.approach_ng_rate || 0 },
                            { name: '商品説明NG率', value: dailyPerformance.product_ng_rate || 0 },
                            { name: '獲得率', value: dailyPerformance.acquisition_rate || 0 },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {[
                            '再コール率',
                            '見込率',
                            'アプローチNG率',
                            '商品説明NG率',
                            '獲得率',
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => `${value.toFixed(1)}%`}
                          contentStyle={{
                            background: '#f5f7fa',
                            border: `1px solid ${alpha('#3B82F6', 0.1)}`,
                            borderRadius: theme.shape.borderRadius,
                            color: '#262724',
                            fontSize: { xs: '0.8rem', md: '0.875rem' }  // モバイルではフォントサイズを小さく
                          }}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: 20 }}
                          formatter={(value) => (
                            <span style={{ 
                              color: '#262724',
                              fontWeight: 500,
                              fontSize: '0.7rem'  // 静的な値に変更
                            }}>
                              {value}
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>
            </Box>

            {/* 月間累計データの表示 */}
            <Box sx={{ 
              mt: 4,
              p: { xs: 2, md: 4 },  // モバイルではパディングを小さく
              borderRadius: { xs: '12px', md: '20px' },  // モバイルでは角丸を小さく
              background: '#f5f7fa',
              border: `1px solid ${alpha('#3B82F6', 0.2)}`,
              boxShadow: '0 4px 30px rgba(59, 130, 246, 0.1)',
            }}>
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  mb: { xs: 2, md: 3 },  // モバイルでは下マージンを小さく
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  color: '#262724',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                  borderBottom: `1px solid ${alpha('#3B82F6', 0.15)}`,
                  pb: { xs: 1, md: 2 },  // モバイルではパディングを小さく
                  fontSize: { xs: '1.2rem', md: '1.5rem' }  // モバイルではフォントサイズを小さく
                }}
              >
                月間累計データ
              </Typography>
              <Grid container spacing={{ xs: 2, md: 3 }}>  {/* モバイルではグリッド間隔を小さく */}
                {/* テーブル部分 (左半分) */}
                <Grid item xs={12} md={6}>
                  <TableContainer component={Paper} sx={{
                    backgroundColor: '#f5f7fa',
                    '& .MuiTableCell-head': {
                      fontWeight: 600,
                      backgroundColor: alpha('#3B82F6', 0.1),
                      borderBottom: `1px solid ${alpha('#3B82F6', 0.15)}`,
                      fontSize: { xs: '0.8rem', md: '0.875rem' },  // モバイルではフォントサイズを小さく
                      padding: { xs: '8px 6px', md: '16px' }  // モバイルではパディングを小さく
                    },
                    '& .MuiTableCell-body': {
                      py: { xs: 1, md: 2 },  // モバイルではパディングを小さく
                      px: { xs: '6px', md: '16px' },  // モバイルではパディングを小さく
                      fontSize: { xs: '0.8rem', md: '0.875rem' },  // モバイルではフォントサイズを小さく
                      borderBottom: `1px solid ${alpha('#3B82F6', 0.3)}`
                    },
                    '& .MuiTableRow-root:hover': {
                      backgroundColor: alpha('#3B82F6', 0.05)
                    }
                  }}>
                    <Table size="small">  {/* モバイルではテーブルサイズを小さく */}
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: '#262724' }}>項目</TableCell>
                          <TableCell align="right" sx={{ color: '#262724' }}>数値</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ color: '#262724' }}>電話発信数</TableCell>
                          <TableCell align="right" sx={{ color: '#262724' }}>{monthlyPerformance.details.total_call || 0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: '#262724' }}>電話対応数</TableCell>
                          <TableCell align="right" sx={{ color: '#262724' }}>{monthlyPerformance.details.total_catch || 0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: '#262724' }}>再コール数</TableCell>
                          <TableCell align="right" sx={{ color: '#262724' }}>{monthlyPerformance.details.total_re_call || 0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: '#262724' }}>見込客数</TableCell>
                          <TableCell align="right" sx={{ color: '#262724' }}>{monthlyPerformance.details.total_prospective || 0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: '#262724' }}>アプローチNG</TableCell>
                          <TableCell align="right" sx={{ color: '#262724' }}>{monthlyPerformance.details.total_approach_ng || 0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: '#262724' }}>商品説明NG</TableCell>
                          <TableCell align="right" sx={{ color: '#262724' }}>{monthlyPerformance.details.total_product_ng || 0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: '#262724' }}>獲得数</TableCell>
                          <TableCell align="right" sx={{ color: '#262724' }}>
                            {monthlyPerformance.details.total_acquisition || 0}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                {/* 円グラフ部分 (右半分) */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ 
                    ...innerBoxStyle,
                    background: '#f5f7fa',  // 明示的に指定
                    height: '100%',
                    p: { xs: 1, md: 3 },  // モバイルではパディングを小さく
                  }}>
                    <Typography variant="subtitle1" align="center" gutterBottom sx={{
                      fontWeight: 600,
                      color: '#262724',
                      mb: 2,
                      fontSize: { xs: '0.9rem', md: '1rem' }  // モバイルではフォントサイズを小さく
                    }}>
                      月間パフォーマンス比率
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>  {/* ResponsiveContainerを使用 */}
                      <PieChart>
                        <Pie
                          data={[
                            { name: '再コール率', value: monthlyPerformance.re_call_rate || 0 },
                            { name: '見込率', value: monthlyPerformance.prospective_rate || 0 },
                            { name: 'アプローチNG率', value: monthlyPerformance.approach_ng_rate || 0 },
                            { name: '商品説明NG率', value: monthlyPerformance.product_ng_rate || 0 },
                            { name: '獲得率', value: monthlyPerformance.acquisition_rate || 0 },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {[
                            '再コール率',
                            '見込率',
                            'アプローチNG率',
                            '商品説明NG率',
                            '獲得率',
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => `${value.toFixed(1)}%`}
                          contentStyle={{
                            background: '#f5f7fa',
                            border: `1px solid ${alpha('#3B82F6', 0.1)}`,
                            borderRadius: theme.shape.borderRadius,
                            color: '#262724',
                            fontSize: { xs: '0.8rem', md: '0.875rem' }  // モバイルではフォントサイズを小さく
                          }}
                        />
                        <Legend 
                          wrapperStyle={{ 
                            paddingTop: 20,
                          }}
                          formatter={(value) => (
                            <span style={{ 
                              color: '#262724',
                              fontWeight: 500,
                              fontSize: '0.7rem'  // 静的な値に変更
                            }}>
                              {value}
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>
            </Box>

            {/* 月間グラフ */}
            <Box sx={{ 
              mt: 4,
              p: { xs: 2, md: 4 },  // モバイルではパディングを小さく
              borderRadius: { xs: '12px', md: '20px' },  // モバイルでは角丸を小さく
              background: '#f5f7fa',
              border: `1px solid ${alpha('#3B82F6', 0.2)}`,
              boxShadow: '0 4px 30px rgba(59, 130, 246, 0.1)',
            }}>
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  mb: { xs: 2, md: 3 },  // モバイルでは下マージンを小さく
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  color: '#262724',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                  borderBottom: `1px solid ${alpha('#3B82F6', 0.15)}`,
                  pb: { xs: 1, md: 2 },  // モバイルではパディングを小さく
                  fontSize: { xs: '1.2rem', md: '1.5rem' }  // モバイルではフォントサイズを小さく
                }}
              >
                月間グラフ
              </Typography>
              <Paper sx={{ 
                p: { xs: 1, md: 3 },  // モバイルではパディングを小さく
                width: '100%',
                height: { xs: 400, md: 500 },  // モバイルでは高さを小さく
                background: '#f5f7fa',  // 明示的に指定
              }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={processChartData(homeData)}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}  // モバイルではマージンを小さく
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha('#4158D0', 0.05)} />
                    <XAxis 
                      dataKey="date" 
                      label={{ 
                        value: '日付', 
                        position: 'bottom',
                        offset: 0,
                        style: { fontSize: '0.8rem' }  // 静的な値に変更
                      }}
                      tick={{ fill: '#262724', fontSize: '0.8rem' }}  // 静的な値に変更
                      interval="preserveStartEnd"
                      minTickGap={10}  // モバイルではギャップを小さく
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis
                      label={{ 
                        value: '数値', 
                        angle: -90, 
                        position: 'insideLeft',
                        fill: '#262724',
                        style: { fontSize: '0.8rem' }  // 静的な値に変更
                      }}
                      tick={{ fill: '#262724', fontSize: '0.8rem' }}  // 静的な値に変更
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#f5f7fa',
                        border: `1px solid ${alpha('#4158D0', 0.1)}`,
                        borderRadius: '8px',
                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                        color: '#262724',
                        fontSize: '0.8rem'  // 静的な値に変更
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ 
                        paddingTop: 20,
                        fontSize: '0.8rem'  // 静的な値に変更
                      }}
                      formatter={(value) => (
                        <span style={{ 
                          color: '#262724',
                          fontWeight: 500,
                          fontSize: '0.8rem'  // 静的な値に変更
                        }}>
                          {value}
                        </span>
                      )}
                    />
                    
                    {Object.keys(lineColors).map((_, index) => {
                      const dataKeys = [
                        '電話対応数',
                        '再コール数',
                        '見込客数',
                        'アプローチNG数',
                        '商品説明後NG数',
                        '獲得数'
                      ];
                      return (
                        <Line
                          key={dataKeys[index]}
                          type="monotone"
                          dataKey={dataKeys[index]}
                          stroke={lineColors[index]}
                          strokeWidth={1.5}  // 静的な値に変更
                          dot={{ 
                            r: 3,  // 静的な値に変更
                            fill: lineColors[index],
                            strokeWidth: 0
                          }}
                          activeDot={{ 
                            r: 5,  // 静的な値に変更
                            fill: lineColors[index],
                            strokeWidth: 0
                          }}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Box>
          </Container>
        </motion.div>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>

      {/* 追加するダイアログコンポーネント */}
      <Dialog 
        open={targetDialog} 
        onClose={() => setTargetDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: { xs: '10px', md: '14px' },  // モバイルでは角丸を小さく
            padding: { xs: '16px', md: '24px' },  // モバイルではパディングを小さく
            background: '#f5f7fa',
            width: { xs: '280px', md: '300px' },  // モバイルでは幅を小さく
            minHeight: { xs: '220px', md: '260px' },  // モバイルでは高さを小さく
            maxWidth: '90vw',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }
        }}
      >
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'  // 全体を中央揃え
        }}>
          <DialogTitle sx={{ 
            fontWeight: 600,  // フォントウェイトを調整
            color: '#262724',
            textAlign: 'center',
            fontSize: { xs: '1.1rem', md: '1.2rem' },  // モバイルではフォントサイズを小さく
            px: 0,
            pt: 0,
            pb: { xs: 1, md: 2 }  // モバイルではパディングを小さく
          }}>
            目標獲得数設定
          </DialogTitle>

          <DialogContent sx={{ 
            width: '100%',  // 幅を親要素に合わせる
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 0,
            py: 0
          }}>
            <TextField
              autoFocus
              fullWidth
              variant="outlined"
              type="number"
              placeholder="数値を入力"
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
              InputProps={{
                sx: {
                  width: { xs: '220px', md: '240px' },  // モバイルでは幅を小さく
                  height: { xs: '46px', md: '52px' },  // モバイルでは高さを小さく
                  borderRadius: { xs: '10px', md: '12px' },  // モバイルでは角丸を小さく
                  backgroundColor: alpha('#3B82F6', 0.1),  // 背景色を少し濃く
                  fontSize: { xs: '1rem', md: '1.05rem' },  // モバイルではフォントサイズを小さく
                  '& input': {
                    textAlign: 'center',
                    padding: { xs: '10px', md: '14px' },  // モバイルではパディングを小さく
                    '&::placeholder': {
                      fontSize: { xs: '0.85rem', md: '0.92rem' },  // モバイルではプレースホルダーサイズを小さく
                      color: alpha('#262724', 0.5)  // 色を少し濃く
                    }
                  }
                }
              }}
            />
          </DialogContent>

          <DialogActions sx={{ 
            width: '100%',
            pt: { xs: 1, md: 2 },
            px: 0,
            justifyContent: 'center',
            gap: { xs: 1, md: 2 }
          }}>
            <Button 
              onClick={() => setTargetDialog(false)}
              disabled={loading}
              sx={{
                color: '#666',
                fontSize: { xs: '0.85rem', md: '0.875rem' },
                '&:hover': {
                  backgroundColor: alpha('#3B82F6', 0.1)
                }
              }}
            >
              キャンセル
            </Button>
            <Button 
              onClick={handleSaveTarget}
              variant="contained"
              disabled={loading}
              sx={{
                backgroundColor: '#3B82F6',
                borderRadius: '8px',
                fontSize: { xs: '0.85rem', md: '0.875rem' },
                minWidth: '80px',
                position: 'relative',
                '&:hover': {
                  backgroundColor: alpha('#3B82F6', 0.8)
                }
              }}
            >
              {loading ? (
                <CircularProgress 
                  size={24} 
                  sx={{
                    color: '#fff',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-12px',
                    marginLeft: '-12px',
                  }}
                />
              ) : '保存'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
