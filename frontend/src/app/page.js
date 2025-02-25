'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";

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
        // 未ログインの場合はログインページへ
        router.push('/login');
      }
    }
    setIsLoading(false);
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>リダイレクト中...</p>
    </div>
  );
}
