<<<<<<< HEAD
'use client';  // Client Componentとして明示的に宣言
=======
"use client";
>>>>>>> backup-branch

import dynamic from 'next/dynamic'; // dynamic importを使用するためのインポート

// dynamic importを利用してクライアントコンポーネントとしてRegistrationFormを読み込む
const RegistrationForm = dynamic(() => import("../../components/RegistrationForm"), { ssr: false });

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            アカウント登録
          </h2>
        </div>
        <RegistrationForm /> {/* RegistrationFormコンポーネントを表示 */}
      </div>
    </div>
  );
}
