"use client";

/**
 * ログインページモジュール
 * 
 * このファイルはユーザー認証のためのログインページを定義します。
 * クライアントサイドでのみ実行されるコンポーネントです。
 */

import dynamic from 'next/dynamic';

// SSRを無効化してLoginFormをクライアントサイドのみでレンダリング
const LoginForm = dynamic(
  () => import("../../components/LoginForm"),
  { ssr: false }
);

export default function LoginPage() {
  return (
    <main>
      <LoginForm />
    </main>
  );
}
