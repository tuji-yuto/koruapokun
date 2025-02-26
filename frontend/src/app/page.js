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
        // 未ログインの場合はランディングページのコンテンツを表示
        setIsLoading(false);
      }
    }
  }, [router]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>読み込み中...</p>
      </div>
    );
  }

  // 未ログインユーザー向けのランディングページ
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="text-center space-y-8 p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          営業活動管理アプリへようこそ
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          効率的な営業活動の管理と分析をサポートします
        </p>
        <div className="space-x-4">
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            ログイン
          </button>
          <button
            onClick={() => router.push('/register')}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors"
          >
            新規会員登録
          </button>
        </div>
      </div>
    </div>
  );
}
