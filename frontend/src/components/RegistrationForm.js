// src/components/RegistrationForm.js
"use client"; // クライアントサイドでのみ実行されるコンポーネントであることを示す
import { useState } from "react"; // 状態管理のためのuseStateフック
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
  CircularProgress
} from '@mui/material';
import { 
  Person as PersonIcon, 
  Lock as LockIcon,
  CheckCircleOutline as CheckIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

// アニメーション設定
const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// バリデーションスキーマ
const schema = z.object({
  username: z.string()
    .min(3, "3文字以上で入力してください")
    .max(30, "30文字以内で入力してください")
    .regex(
      /^[a-zA-Z0-9ぁ-んァ-ン一-龠]+$/, 
      "英数字と日本語（ひらがな、カタカナ、漢字）が使用できます"
    ),
  password: z.string()
    .min(8, "8文字以上24文字以下で入力してください")
    .max(24, "8文字以上24文字以下で入力してください")
    .regex(
      /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+$/,
      "使用可能な文字：アルファベット（大文字/小文字）、数字、特殊文字"
    )
});

// APIのベースURL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://koruapokun-4.onrender.com';

export default function RegistrationForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const theme = useTheme(); // 現在のテーマを取得
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/register/`, data);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || '登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      position: 'relative',
      minHeight: '100vh',
      backgroundImage: 'url(/images/haikei.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* 白いオーバーレイ */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 1
      }} />
      
      <Box sx={{ position: 'relative', zIndex: 2, pt: 8 }}>
        <Container maxWidth="sm">
          <Box
            sx={{
              p: 4,
              borderRadius: '20px',
              background: '#fbf8f4',
              backdropFilter: 'blur(10px)',
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
                        backgroundColor: '#fbf8f4',
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
                        backgroundColor: '#fbf8f4',
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

