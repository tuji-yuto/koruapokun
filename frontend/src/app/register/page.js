/**
 * ユーザー登録ページ
 * 新規ユーザーの登録フォームを表示
 */
'use client';

import dynamic from 'next/dynamic';

// クライアントサイドのみで実行される登録フォームコンポーネント
const RegistrationForm = dynamic(
  () => import("../../components/RegistrationForm"),
  { ssr: false }
);

export default function RegisterPage() {
  return (
    <main className="container mx-auto py-8">
      <RegistrationForm />
    </main>
  );
}
