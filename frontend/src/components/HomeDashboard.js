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
          '& .MuiLinearProgress-root': { backgroundColor: '#fbf8f4' }
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
    
    const response = await fetch('http://localhost:8000/api/token/refresh/', {
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

    const response = await fetch('http://localhost:8000/api/token/verify/', {
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
      formData.call_count > 0 &&
      formData.catch_count > 0 &&
      formData.re_call_count > 0 &&
      formData.prospective_count > 0 &&
      formData.approach_ng_count > 0 &&
      formData.product_explanation_ng_count > 0 &&
      formData.acquisition_count > 0
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'すべての項目に入力してください（0は不可）',
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
          gap: 1.5,  // gap を2から1.5に縮小
          flexWrap: 'nowrap',
          alignItems: 'flex-start',
          width: '100%',
        }}>
          {inputFields.map((field) => (
            <Box key={field.name} sx={{
              flex: 1,
              minWidth: field.type === 'date' ? '170px' : 0,
            }}>
              <Typography variant="caption" sx={{
                fontWeight: 600,
                color: '#333',
                mb: 0.5,
                display: 'block',
                fontSize: '0.9rem',
                textAlign: 'right'  // 右揃えに変更
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
                  height: '36px',
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
                            height: '36px',
                            fontSize: '1rem',
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
                        fontSize: '1rem',
                        fontWeight: 500,
                        height: '36px',
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
            flex: '0 0 auto',
            alignSelf: 'flex-end',
            mb: '1px'
          }}>
            <Button
              variant="contained"
              type="submit"
              disabled={!validateForm() || loading}
              sx={{
                height: '36px',
                backgroundColor: '#3B82F6',
                borderRadius: '8px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                px: 3,
                fontSize: '0.95rem',
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
        `http://localhost:8000/api/monthly-target/?year_month=${getCurrentYearMonth()}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setMonthlyTarget(data);
      }
    } catch (error) {
      console.error('Error fetching monthly target:', error);
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
      // 既存レコードが無い場合は、リソースIDとして「年-月」を利用
      let url = `http://localhost:8000/api/monthly-target/${getCurrentYearMonth()}/`;
      
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
        setSnackbar({
          open: true,
          message: '月次目標を保存しました',
          severity: 'success'
        });
        fetchMonthlyTarget();
        setTargetDialog(false);
      }
    } catch (error) {
      console.error('Error saving monthly target:', error);
      setSnackbar({
        open: true,
        message: 'エラーが発生しました',
        severity: 'error'
      });
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
      const res = await fetch('http://localhost:8000/api/home-data/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setHomeData(data);
      }
    } catch (error) {
      console.error('Data fetch error:', error);
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
      
      let url = 'http://localhost:8000/api/home-data/';
      let method = 'POST';
      
      // 既存データがある場合はPUTリクエストに変更
      if (existingData) {
        url = `http://localhost:8000/api/home-data/${existingData.id}/`;
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
        await fetchDailySummary();
        await fetchMonthlyTarget();  // 月次目標も再取得
        
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
        `http://localhost:8000/api/home-data/?date=${date}`,
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
      const response = await fetch('http://localhost:8000/api/monthly-summary/', {
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
          return;
        }
        console.error('API error');
        return;
      }

      const data = await response.json();
      setMonthlyPerformance(data);
    } catch (error) {
      console.error('Error fetching monthly summary:', error.message);
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
    }
  };

  const fetchDailySummary = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/daily-summary/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        console.error('Daily summary fetch failed');
        return;
      }

      const data = await response.json();
      setDailyPerformance({
        ...data,
        details: data.details || {
          daily_call: 0,
          daily_catch: 0,
          daily_re_call: 0,
          daily_prospective: 0,
          daily_approach_ng: 0,
          daily_product_ng: 0,
          daily_acquisition: 0
        }
      });
    } catch (error) {
      console.error('Error fetching daily summary:', error.message);
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
    fetchDailySummary();
  }, []);

  // ユーザー名取得
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/current-user/', {
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
    fetchDailySummary();
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
        p: 4,
        borderRadius: '20px',
        background: '#fbf8f4',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha('#3B82F6', 0.2)}`,
        boxShadow: '0 4px 30px rgba(59, 130, 246, 0.1)',
      }}>
        <Typography 
          variant="h5" 
          gutterBottom 
          sx={{ 
            mb: 3,
            fontWeight: 600,
            letterSpacing: '0.5px',
            color: '#262724',
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
            borderBottom: `1px solid ${alpha('#3B82F6', 0.15)}`,
            pb: 2
          }}
        >
          {new Date().getMonth() + 1}月の目標
        </Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs>
            <Box sx={{
              ...innerBoxStyle,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#262724' }}>
                目標獲得数: {target}件
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
          <Grid item xs>
            <Box sx={{
              ...innerBoxStyle
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#262724' }}>
                今月の獲得数: {actual}件
              </Typography>
            </Box>
          </Grid>
          <Grid item xs>
            <Box sx={{
              ...innerBoxStyle
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#262724' }}>
                進捗率: {progressRate.toFixed(1)}%
              </Typography>
            </Box>
          </Grid>
          <Grid item xs>
            <Box sx={{
              ...innerBoxStyle
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#262724' }}>
                達成率: {achievementRate}%
              </Typography>
              <Box sx={{ mt: 1 }}>
                <ProgressDisplay 
                  value={achievementRate}
                  sx={{
                    '& .MuiLinearProgress-root': {
                      background: '#fbf8f4',
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
    p: 4,
    borderRadius: '20px',
    background: '#fbf8f4',  // 薄いベージュ系に変更
    backdropFilter: 'blur(10px)',
    border: `1px solid ${alpha('#3B82F6', 0.2)}`,
    boxShadow: '0 4px 30px rgba(59, 130, 246, 0.1)',
  };

  // 内部のカードスタイル
  const innerBoxStyle = {
    p: 3,
    borderRadius: '15px',
    background: '#fbf8f4',  // 薄いベージュ系に変更
    border: `1px solid ${alpha('#3B82F6', 0.15)}`,
  };

  return (
    <Box sx={{ 
      position: 'relative', // オーバーレイを配置するために必要
      flexGrow: 1,
      pb: 4,
      backgroundImage: 'url(/images/haikei.jpg)', // 背景画像を設定
      backgroundSize: 'cover', // 画像をカバーするように設定
      backgroundPosition: 'center', // 画像の位置を中央に設定
      backgroundRepeat: 'no-repeat' // 画像の繰り返しを無効に
    }}>
      {/* 白靄のオーバーレイ */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // 半透明の白
        zIndex: 1 // コンテンツの下に配置
      }} />
      
      {/* コンテンツ */}
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        {/* ヘッダー部分 */}
        <AppBar 
          position="sticky" 
          sx={{ 
            background: alpha('#3B82F6', 0.8),  // 不透明度80%に変更
            backdropFilter: 'blur(10px)',  // 背景ぼかし追加
            boxShadow: '0 2px 15px rgba(59, 130, 246, 0.2)',  // シャドウを軽量化
            mb: 4,
            borderBottom: `1px solid ${alpha('#FFFFFF', 0.3)}`,  // ボーダーを強調
            border: 'none',
            backgroundColor: 'transparent'  // 背景色を透明に
          }}
        >
          <Toolbar sx={{ 
            minHeight: '64px !important',
            justifyContent: 'space-between',
            px: { xs: 2, md: 4 },
            background: 'transparent'  // ツールバー背景も透明に
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <img src="/images/tori.png" alt="Icon" style={{ width: '60px', height: '60px', borderRadius: '50%' }} />
              <Typography 
                variant="h5" 
                component="div" 
                sx={{ 
                  fontFamily: 'Noto Sans JP, sans-serif',
                  fontWeight: 700,
                  color: '#262724',
                  fontSize: '1.3rem'
                }}
              >
                コール管理システム こるあぽくん
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1,
                borderRadius: '8px',
                background: alpha('#FFFFFF', 0.2),
                backdropFilter: 'blur(5px)'
              }}>
                <Person sx={{ 
                  fontSize: '1.4rem', 
                  color: '#262724'
                }}/>
                <Typography sx={{ 
                  fontWeight: 500,
                  color: '#262724'
                }}>
                  {username} さん
                </Typography>
              </Box>
              
              <Button 
                variant="outlined"
                color="inherit"
                sx={{ 
                  borderRadius: '8px',
                  px: 2,
                  py: 0.5,
                  textTransform: 'none',
                  borderColor: alpha('#FFFFFF', 0.3),
                  color: '#262724',
                  background: alpha('#FFFFFF', 0.1),
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
            px: { xs: 1, md: 2 },  // 左右の余白を狭く設定（xs: 8px, md: 16px）
            '& .MuiPaper-root': {
              borderRadius: '20px',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha('#3B82F6', 0.2)}`,
              boxShadow: '0 4px 30px rgba(59, 130, 246, 0.1)',
              background: '#fbf8f4',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 30px rgba(59, 130, 246, 0.15)'
              }
            }
          }}>
            <Box sx={{ 
              mb: 4,
              p: 4,
              borderRadius: '20px',
              background: '#fbf8f4',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha('#3B82F6', 0.2)}`,
              boxShadow: '0 4px 30px rgba(59, 130, 246, 0.1)',
            }}>
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  mb: 3,
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  color: '#262724',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                  borderBottom: `1px solid ${alpha('#3B82F6', 0.15)}`,
                  pb: 2
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
              p: 4,
              borderRadius: '20px',
              background: '#fbf8f4',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha('#3B82F6', 0.2)}`,
              boxShadow: '0 4px 30px rgba(59, 130, 246, 0.1)',
            }}>
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  mb: 3,
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  color: '#262724',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                  borderBottom: `1px solid ${alpha('#3B82F6', 0.15)}`,
                  pb: 2
                }}
              >
                当日データ
              </Typography>
              <Grid container spacing={3}>
                {/* テーブル部分 (左半分) */}
                <Grid item xs={12} md={6}>
                  <TableContainer component={Paper} sx={{
                    backgroundColor: '#fbf8f4',  // テーブル背景色変更
                    '& .MuiTableCell-head': {
                      fontWeight: 600,
                      backgroundColor: alpha('#3B82F6', 0.1),
                      borderBottom: `1px solid ${alpha('#3B82F6', 0.15)}`
                    },
                    '& .MuiTableCell-body': {
                      py: 2,
                      borderBottom: `1px solid ${alpha('#3B82F6', 0.3)}`
                    },
                    '& .MuiTableRow-root:hover': {
                      backgroundColor: alpha('#3B82F6', 0.05)
                    }
                  }}>
                    <Table>
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
                            {isCatchSufficient ? '足りている' : '足りていない'} {dailyPerformance.details.daily_catch || 0}
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
                            {isAcquisitionSufficient ? '足りている' : '足りていない'} {dailyPerformance.details.daily_acquisition || 0}
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
                    background: '#fbf8f4',  // 明示的に指定
                    height: '100%',
                  }}>
                    <Typography variant="subtitle1" align="center" gutterBottom>
                      当日パフォーマンス比率
                    </Typography>
                    <PieChart width={500} height={300}>
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
                          background: '#fbf8f4',
                          border: `1px solid ${alpha('#3B82F6', 0.1)}`,
                          borderRadius: theme.shape.borderRadius,
                          color: '#262724',
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: 20 }}
                        formatter={(value) => (
                          <span style={{ 
                            color: '#262724',
                            fontWeight: 500
                          }}>
                            {value}
                          </span>
                        )}
                      />
                    </PieChart>
                  </Paper>
                </Grid>
              </Grid>
            </Box>

            {/* 月間累計データの表示 */}
            <Box sx={{ 
              mt: 4,
              p: 4,
              borderRadius: '20px',
              background: '#fbf8f4',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha('#3B82F6', 0.2)}`,
              boxShadow: '0 4px 30px rgba(59, 130, 246, 0.1)',
            }}>
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  mb: 3,
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  color: '#262724',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                  borderBottom: `1px solid ${alpha('#3B82F6', 0.15)}`,
                  pb: 2
                }}
              >
                月間累計データ
              </Typography>
              <Grid container spacing={3}>
                {/* テーブル部分 (左半分) */}
                <Grid item xs={12} md={6}>
                  <TableContainer component={Paper} sx={{
                    backgroundColor: '#fbf8f4',
                    '& .MuiTableCell-head': {
                      fontWeight: 600,
                      backgroundColor: alpha('#3B82F6', 0.1),
                      borderBottom: `1px solid ${alpha('#3B82F6', 0.15)}`
                    },
                    '& .MuiTableCell-body': {
                      py: 2,
                      borderBottom: `1px solid ${alpha('#3B82F6', 0.3)}`
                    },
                    '& .MuiTableRow-root:hover': {
                      backgroundColor: alpha('#3B82F6', 0.05)
                    }
                  }}>
                    <Table>
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
                          <TableCell align="right" sx={{ color: '#262724' }}>{monthlyPerformance.details.total_acquisition || 0}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                {/* 円グラフ部分 (右半分) */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ 
                    ...innerBoxStyle,
                    background: '#fbf8f4',  // 明示的に指定
                    height: '100%',
                  }}>
                    <Typography variant="subtitle1" align="center" gutterBottom sx={{
                      fontWeight: 600,
                      color: '#262724',
                      mb: 2
                    }}>
                      月間パフォーマンス比率
                    </Typography>
                    <PieChart width={500} height={300}>
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
                          background: '#fbf8f4',
                          border: `1px solid ${alpha('#3B82F6', 0.1)}`,
                          borderRadius: theme.shape.borderRadius,
                          color: '#262724',
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ 
                          paddingTop: 20,
                        }}
                        formatter={(value) => (
                          <span style={{ 
                            color: '#262724',
                            fontWeight: 500
                          }}>
                            {value}
                          </span>
                        )}
                      />
                    </PieChart>
                  </Paper>
                </Grid>
              </Grid>
            </Box>

            {/* 月間グラフ */}
            <Box sx={{ 
              mt: 4,
              p: 4,
              borderRadius: '20px',
              background: '#fbf8f4',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha('#3B82F6', 0.2)}`,
              boxShadow: '0 4px 30px rgba(59, 130, 246, 0.1)',
            }}>
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  mb: 3,
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  color: '#262724',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                  borderBottom: `1px solid ${alpha('#3B82F6', 0.15)}`,
                  pb: 2
                }}
              >
                月間グラフ
              </Typography>
              <Paper sx={{ 
                p: 3,
                width: '100%',
                height: 500,
                background: '#fbf8f4',  // 明示的に指定
              }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={processChartData(homeData)}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha('#4158D0', 0.05)} />
                    <XAxis 
                      dataKey="date" 
                      label={{ 
                        value: '日付', 
                        position: 'bottom',
                        offset: 0 
                      }}
                      tick={{ fill: '#262724' }}
                      interval="preserveStartEnd"
                      minTickGap={20}
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis
                      label={{ 
                        value: '数値', 
                        angle: -90, 
                        position: 'insideLeft',
                        fill: '#262724'
                      }}
                      tick={{ fill: '#262724' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fbf8f4',
                        border: `1px solid ${alpha('#4158D0', 0.1)}`,
                        borderRadius: '8px',
                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                        color: '#262724',
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ 
                        paddingTop: 20,
                      }}
                      formatter={(value) => (
                        <span style={{ 
                          color: '#262724',
                          fontWeight: 500
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
                          strokeWidth={2}
                          dot={{ 
                            r: 4,
                            fill: lineColors[index],
                            strokeWidth: 0
                          }}
                          activeDot={{ 
                            r: 6,
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
            borderRadius: '14px',
            padding: '24px',
            background: '#fbf8f4',
            width: '300px',  // 幅を300pxに縮小
            minHeight: '260px',  // 高さを縮小
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
            fontSize: '1.2rem',  // フォントサイズを縮小
            px: 0,
            pt: 0,
            pb: 2
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
                  width: '240px',  // 幅を240pxに拡大
                  height: '52px',  // 高さを52pxに調整
                  borderRadius: '12px',
                  backgroundColor: alpha('#3B82F6', 0.1),  // 背景色を少し濃く
                  fontSize: '1.05rem',  // フォントサイズ微調整
                  '& input': {
                    textAlign: 'center',
                    padding: '14px',  // パディングを増加
                    '&::placeholder': {
                      fontSize: '0.92rem',  // プレースホルダーサイズ調整
                      color: alpha('#262724', 0.5)  // 色を少し濃く
                    }
                  }
                }
              }}
            />
          </DialogContent>

          <DialogActions sx={{ 
            width: '100%',
            pt: 2,
            px: 0,
            justifyContent: 'center',  // ボタンを中央揃え
            gap: 2
          }}>
            <Button 
              onClick={() => setTargetDialog(false)}
              sx={{
                color: '#666',
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
              sx={{
                backgroundColor: '#3B82F6',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: alpha('#3B82F6', 0.8)
                }
              }}
            >
              保存
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
