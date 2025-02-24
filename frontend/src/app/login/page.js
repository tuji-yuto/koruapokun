"use client";

import dynamic from 'next/dynamic'; // dynamic importを使用するためのインポート

// dynamic importを利用してクライアントコンポーネントとしてLoginFormを読み込む
const LoginForm = dynamic(() => import("../../components/LoginForm"), { ssr: false });

export default function LoginPage() {
  return (
    <main>
      <LoginForm /> {/* LoginFormコンポーネントを表示 */}
    </main>
  );
}
