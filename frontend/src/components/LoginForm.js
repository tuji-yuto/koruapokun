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
  CircularProgress,
  Link,
  Tooltip
} from '@mui/material';
import { 
  Person as PersonIcon, 
  Lock as LockIcon,
  Login as LoginIcon,
  Visibility,
  VisibilityOff,
  Info as InfoIcon
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

// APIのベースURL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://koruapokun-4.onrender.com';

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'ログインに失敗しました');
      }

      // JWTトークンをローカルストレージに保存
      localStorage.setItem('accessToken', result.access);
      localStorage.setItem('refreshToken', result.refresh);

      // ホームページに遷移
      router.push('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'ログインに失敗しました。ユーザー名とパスワードを確認してください。');
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
          <motion.div
            initial="hidden"
            animate="visible"
            variants={formVariants}
            transition={{ duration: 0.5 }}
          >
            <Box
              sx={{
                p: 4,
                borderRadius: '20px',
                background: '#f5f7fa',
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
                          backgroundColor: '#f5f7fa',
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
                          backgroundColor: '#f5f7fa',
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

                  {/* パスワードセキュリティに関する注意事項 */}
                  <Grid item xs={12}>
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: '#f8f9fa', 
                      borderRadius: '8px', 
                      border: '1px solid #e0e0e0',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1
                    }}>
                      <InfoIcon sx={{ color: '#3B82F6', mt: 0.5 }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                          パスワードセキュリティについて
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          安全なパスワードは、大文字・小文字・数字・特殊文字を含み、一般的なパターンを避けたものです。
                          また、他のサイトで使用したことのないパスワードを使用することをお勧めします。
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Tooltip title="パスワードが安全でないと思われる場合は、新規登録して安全なパスワードを設定することをお勧めします。" arrow>
                            <IconButton size="small" sx={{ ml: 0.5 }}>
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
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
                      ) : (
                        <>
                          <LoginIcon sx={{ mr: 1 }} />
                          ログイン
                        </>
                      )}
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
                    新規会員登録
                  </Button>
                </Typography>
              </Box>
            </Box>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
}

