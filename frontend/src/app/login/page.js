"use client";

/**
 * ログインページモジュール
 * 
 * ユーザー認証のためのログインページを定義
 * クライアントサイドでのみ実行されるコンポーネント
 */

import dynamic from 'next/dynamic';

// LoginFormコンポーネントをクライアントサイドのみでレンダリングするための動的インポート
// SSRを無効化することでサーバーサイドでの実行を防止
const LoginForm = dynamic(
  () => import("../../components/LoginForm"),
  { ssr: false }
);

/**
 * ログインページコンポーネント
 * LoginFormコンポーネントをメインコンテンツとして表示
 */
export default function LoginPage() {
  return (
    <main>
      <LoginForm />
    </main>
  );
}
