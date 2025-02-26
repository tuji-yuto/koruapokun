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
      <div className="text-center">
        <div className="relative w-[576px] h-[576px] mx-auto">
          <Image
            src="/images/ヘッダー画像.png"
            alt="ヘッダー画像"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 animate-fade-in -mt-4">
          ようこそ！
        </h1>
        <div className="mt-2">
          <button
            onClick={() => router.push('/login')}
            className="transform hover:scale-105 transition-all duration-300 ease-in-out
                     bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold
                     hover:bg-blue-700 hover:shadow-lg
                     active:scale-95 active:shadow-inner
                     mx-3"
          >
            ログイン
          </button>
          <button
            onClick={() => router.push('/register')}
            className="transform hover:scale-105 transition-all duration-300 ease-in-out
                     bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold
                     border-2 border-blue-600 hover:bg-blue-50 hover:shadow-lg
                     active:scale-95 active:shadow-inner
                     mx-3"
          >
            新規会員登録
          </button>
        </div>
      </div>
    </div>
  );
}
