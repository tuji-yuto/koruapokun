'use client';  // Client Componentとして明示的に宣言

import dynamic from 'next/dynamic'; // dynamic importを使用するためのインポート

// dynamic importを利用してクライアントコンポーネントとしてRegistrationFormを読み込む
const RegistrationForm = dynamic(() => import("../../components/RegistrationForm"), { ssr: false });

export default function RegisterPage() {
  return (
    <main>
      <RegistrationForm /> {/* RegistrationFormコンポーネントを表示 */}
    </main>
  );
}
