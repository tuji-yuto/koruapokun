'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Button, 
  Container, 
  CircularProgress,
  alpha
} from '@mui/material';
import { motion } from 'framer-motion';

// アニメーション設定
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // クライアントサイドでのみ実行されるようにする
    if (typeof window !== 'undefined') {
      // ログイン済みかどうかを確認
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        // ログイン済みの場合はホームダッシュボードへ
        router.push('/home');
      } else {
        // 未ログインの場合はランディングページのコンテンツを表示
        setIsLoading(false);
      }
    }
  }, [router]);
  
  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #EBF5FF 100%)'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // 未ログインユーザー向けのランディングページ
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #EBF5FF 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        py: { xs: 4, md: 8 }
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Box
            sx={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4
            }}
          >
            <Box
              component="img"
              src="/images/ヘッダー画像コメント付き.png"
              sx={{
                width: '100%',
                height: 'auto',
                maxWidth: '1100px',
                maxHeight: '300px',
                objectFit: 'contain',
                mb: { xs: 3, md: 4 }
              }}
            />
            
            <Box
              sx={{
                display: 'flex',
                gap: { xs: 2, md: 3 },
                flexDirection: { xs: 'column', sm: 'row' },
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              <Button
                variant="contained"
                onClick={() => router.push('/login')}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: '8px',
                  backgroundColor: '#3B82F6',
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  fontWeight: 600,
                  textTransform: 'none',
                  minWidth: { xs: '100%', sm: '200px' },
                  '&:hover': {
                    backgroundColor: alpha('#3B82F6', 0.8),
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                  }
                }}
              >
                ログイン
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => router.push('/register')}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: '8px',
                  borderColor: '#3B82F6',
                  color: '#3B82F6',
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  fontWeight: 600,
                  textTransform: 'none',
                  minWidth: { xs: '100%', sm: '200px' },
                  '&:hover': {
                    borderColor: '#3B82F6',
                    backgroundColor: alpha('#3B82F6', 0.05),
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.1)'
                  }
                }}
              >
                新規会員登録
              </Button>
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
