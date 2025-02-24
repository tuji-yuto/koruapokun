"use client"; // クライアントサイドでのみ実行されるコンポーネントであることを示す
import { useState } from "react"; // 状態管理のためのuseStateフックをインポート
import { useRouter } from "next/navigation"; // ページ遷移のためのuseRouterフックをインポート
import { 
  TextField, 
  Button, 
  Container, 
  Box, 
  Typography, 
  InputAdornment,
  Alert,
  Grid,
  IconButton,
  CircularProgress
} from '@mui/material';
import { 
  Person as PersonIcon, 
  Lock as LockIcon,
  Login as LoginIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
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
      /^[a-zA-Z0-9ぁ-んァ-ン一-龠]+$/,  // 日本語文字を許可する正規表現に変更
      "英数字と日本語（ひらがな、カタカナ、漢字）が使用できます"  // エラーメッセージ修正
    ),
  password: z.string()
    .min(8, "8文字以上必要です")
});

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });
  const [error, setError] = useState(null);
  const router = useRouter();
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);  // ローディング開始
    try {
      const res = await fetch('http://localhost:8000/api/auth/login/', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const { access, refresh } = await res.json();
        localStorage.setItem("accessToken", access);
        localStorage.setItem("refreshToken", refresh);
        router.push("/home");
      } else {
        const errorData = await res.json();
        setError(errorData.detail || "認証に失敗しました");
      }
    } catch (err) {
      setError("サーバー接続エラーが発生しました");
    } finally {
      setLoading(false);  // ローディング終了
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
              ログイン
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
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
                        fontSize: '1.2rem',
                        '&:hover': {
                          borderColor: alpha('#3B82F6', 0.3),
                        },
                        '&.Mui-focused': {
                          borderColor: '#3B82F6',
                        },
                        '& *': {
                          outline: 'none !important',
                          boxShadow: 'none !important'
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
                        fontSize: '1.2rem',
                        '&:hover': {
                          borderColor: alpha('#3B82F6', 0.3),
                        },
                        '&.Mui-focused': {
                          borderColor: '#3B82F6',
                        },
                        '& *': {
                          outline: 'none !important',
                          boxShadow: 'none !important'
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
                    ) : 'ログイン'}
                  </Button>
                </Grid>
              </Grid>
            </form>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                アカウントをお持ちでない方は
                <Button 
                  onClick={() => router.push('/register')}
                  sx={{ 
                    ml: 1,
                    color: '#3B82F6',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: alpha('#3B82F6', 0.1)
                    }
                  }}
                >
                  こちらから登録
                </Button>
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

