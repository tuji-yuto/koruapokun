// src/components/RegistrationForm.js
"use client"; // クライアントサイドでのみ実行されるコンポーネントであることを示す
import { useState, useEffect } from "react"; // 状態管理のためのuseStateフック
import { useRouter } from "next/navigation"; // ページ遷移のためのuseRouterフック
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  TextField, 
  Button, 
  Container, 
  Box, 
  Typography, 
  InputAdornment, 
  Fade,
  Alert,
  Grid,
  IconButton,
  CircularProgress,
  LinearProgress,
  Tooltip
} from '@mui/material';
import { 
  Person as PersonIcon, 
  Lock as LockIcon,
  CheckCircleOutline as CheckIcon,
  Visibility,
  VisibilityOff,
  Info as InfoIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

// アニメーション設定
const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// 一般的なパスワードパターンのチェック
const commonPasswordPatterns = [
  /^password\d*$/i,
  /^12345\d*$/,
  /^qwerty\d*$/i,
  /^admin\d*$/i,
  /^welcome\d*$/i,
  /^letmein\d*$/i,
  /^abc123\d*$/,
  /^monkey\d*$/i,
  /^1234\d*$/
];

// バリデーションスキーマ
const schema = z.object({
  username: z.string()
    .min(3, "3文字以上で入力してください")
    .max(30, "30文字以内で入力してください")
    .regex(
      /^[a-zA-Z0-9ぁ-んァ-ンヴー一-龠々〆〤]+$/,
      "英数字と日本語（ひらがな、カタカナ、漢字）が使用できます"
    ),
  password: z.string()
    .min(8, "8文字以上24文字以下で入力してください")
    .max(24, "8文字以上24文字以下で入力してください")
    .regex(
      /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+$/,
      "使用可能な文字：アルファベット（大文字/小文字）、数字、特殊文字"
    )
    .refine(
      (password) => {
        // 一般的なパスワードパターンに一致しないことを確認
        return !commonPasswordPatterns.some(pattern => pattern.test(password));
      },
      {
        message: "このパスワードは一般的すぎるため、安全ではありません"
      }
    )
    .refine(
      (password) => {
        // 少なくとも1つの数字を含む
        return /\d/.test(password);
      },
      {
        message: "パスワードには少なくとも1つの数字を含める必要があります"
      }
    )
    .refine(
      (password) => {
        // 少なくとも1つの特殊文字を含む
        return /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
      },
      {
        message: "パスワードには少なくとも1つの特殊文字を含める必要があります"
      }
    )
    .refine(
      (password) => {
        // 少なくとも1つの大文字を含む
        return /[A-Z]/.test(password);
      },
      {
        message: "パスワードには少なくとも1つの大文字を含める必要があります"
      }
    )
});

// APIのベースURL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://koruapokun-4.onrender.com';

// パスワード強度を計算する関数
const calculatePasswordStrength = (password) => {
  if (!password) return 0;
  
  let strength = 0;
  
  // 長さによるスコア
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  
  // 文字種によるスコア
  if (/[A-Z]/.test(password)) strength += 15; // 大文字
  if (/[a-z]/.test(password)) strength += 15; // 小文字
  if (/\d/.test(password)) strength += 15; // 数字
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) strength += 15; // 特殊文字
  
  // 一般的なパターンのチェック
  if (commonPasswordPatterns.some(pattern => pattern.test(password))) {
    strength -= 30;
  }
  
  // 最大100%、最小0%に制限
  return Math.max(0, Math.min(100, strength));
};

// 強度に応じた色を返す関数
const getStrengthColor = (strength) => {
  if (strength < 30) return '#f44336'; // 弱い: 赤
  if (strength < 60) return '#ff9800'; // 中程度: オレンジ
  if (strength < 80) return '#ffeb3b'; // 良い: 黄色
  return '#4caf50'; // 強い: 緑
};

// 強度に応じたテキストを返す関数
const getStrengthText = (strength) => {
  if (strength < 30) return '弱い';
  if (strength < 60) return '中程度';
  if (strength < 80) return '良い';
  return '強い';
};

export default function RegistrationForm() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(schema)
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const theme = useTheme(); // 現在のテーマを取得
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // パスワードの値を監視
  const password = watch('password', '');
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  // パスワードが変更されたときに強度を計算
  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
  }, [password]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '登録に失敗しました');
      }

      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || '登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      position: 'relative',
      minHeight: '100vh',
      backgroundColor: '#FFFFFF', // 白の単色背景に変更
    }}>
      {/* 白の背景のみにするため、オーバーレイを削除 */}
      
      <Box sx={{ position: 'relative', zIndex: 2, pt: 8 }}>
        <Container maxWidth="sm">
          <Box
            sx={{
              p: 4,
              borderRadius: '20px',
              background: '#f5f7fa',
              border: `1px solid ${alpha('#3B82F6', 0.2)}`,
              boxShadow: '0 4px 30px rgba(59, 130, 246, 0.1)',
              '& *': {
                outline: 'none !important',
                boxShadow: 'none !important',
              }
            }}
          >
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{ 
                textAlign: 'center',
                fontWeight: 600,
                color: '#262724',
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2
              }}
            >
              <img src="/images/tori.png" alt="Icon" style={{ width: '50px', height: '50px' }} />
              新規会員登録
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Fade in={true}>
                <Alert 
                  icon={<CheckIcon fontSize="inherit" />} 
                  severity="success"
                  sx={{ mb: 3 }}
                >
                  登録が完了しました！ログイン画面に移動します
                </Alert>
              </Fade>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="ユーザー名"
                    variant="outlined"
                    {...register('username')}
                    error={!!errors.username}
                    helperText={errors.username?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#f5f7fa',
                        borderRadius: '8px',
                        border: `1px solid ${alpha('#3B82F6', 0.2)}`,
                        '&:hover': {
                          borderColor: alpha('#3B82F6', 0.3),
                        },
                        '&.Mui-focused': {
                          borderColor: '#3B82F6',
                        },
                        '& input': {
                          fontSize: '1.2rem',
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: '#666',
                        fontWeight: 500,
                        fontSize: '1.2rem'
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: '#3B82F6' }} />
                        </InputAdornment>
                      ),
                    }}
                    inputProps={{
                      lang: 'ja',
                      style: { 
                        fontSize: '1.2rem',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="パスワード"
                    type={showPassword ? "text" : "password"}
                    {...register('password')}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#f5f7fa',
                        borderRadius: '8px',
                        border: `1px solid ${alpha('#3B82F6', 0.2)}`,
                        '&:hover': {
                          borderColor: alpha('#3B82F6', 0.3),
                        },
                        '&.Mui-focused': {
                          borderColor: '#3B82F6',
                        },
                        '& input': {
                          fontSize: '1.2rem',
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: '#666',
                        fontWeight: 500,
                        fontSize: '1.2rem'
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: '#3B82F6' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: '#3B82F6' }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  
                  {/* パスワード強度インジケーター */}
                  {password && (
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ color: getStrengthColor(passwordStrength) }}>
                          パスワード強度: {getStrengthText(passwordStrength)}
                        </Typography>
                        <Tooltip title="安全なパスワードは、大文字・小文字・数字・特殊文字を含み、一般的なパターンを避けたものです。また、他のサイトで使用したことのないパスワードを使用することをお勧めします。" arrow>
                          <IconButton size="small">
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={passwordStrength} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          backgroundColor: alpha(getStrengthColor(passwordStrength), 0.2),
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getStrengthColor(passwordStrength)
                          }
                        }} 
                      />
                    </Box>
                  )}
                  
                  {/* パスワード要件ガイド */}
                  <Box sx={{ mt: 1, p: 1.5, border: '1px solid #e0e0e0', borderRadius: '8px', bgcolor: '#f5f5f5' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                      安全なパスワードの条件:
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: /[A-Z]/.test(password) ? 'green' : 'text.secondary',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}>
                      {/[A-Z]/.test(password) ? '✓' : '○'} 大文字を含む
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: /\d/.test(password) ? 'green' : 'text.secondary',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}>
                      {/\d/.test(password) ? '✓' : '○'} 数字を含む
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) ? 'green' : 'text.secondary',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}>
                      {/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) ? '✓' : '○'} 特殊文字を含む
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: password.length >= 8 ? 'green' : 'text.secondary',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}>
                      {password.length >= 8 ? '✓' : '○'} 8文字以上
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: !commonPasswordPatterns.some(pattern => pattern.test(password)) ? 'green' : 'text.secondary',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}>
                      {!commonPasswordPatterns.some(pattern => pattern.test(password)) ? '✓' : '○'} 一般的なパターンを避ける
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    type="submit"
                    size="large"
                    disabled={loading}
                    sx={{
                      mt: 2,
                      py: 1.5,
                      borderRadius: '8px',
                      backgroundColor: '#3B82F6',
                      fontSize: '1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: alpha('#3B82F6', 0.8),
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
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
                    ) : '登録する'}
                  </Button>
                </Grid>
              </Grid>
            </form>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                アカウントをお持ちの方は
                <Button 
                  onClick={() => router.push('/login')}
                  sx={{ 
                    ml: 1,
                    color: '#3B82F6',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: alpha('#3B82F6', 0.1)
                    }
                  }}
                >
                  こちらからログイン
                </Button>
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

