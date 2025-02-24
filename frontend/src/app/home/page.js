"use client";

import dynamic from 'next/dynamic'; // dynamic importを使用するためのインポート

// dynamic importを利用してクライアントコンポーネントとしてHomeDashboardを読み込む
const HomeDashboard = dynamic(() => import("../../components/HomeDashboard"), { ssr: false });

export default function HomePage() {
  return (
    <main>
      <HomeDashboard /> {/* HomeDashboardコンポーネントを表示 */}
    </main>
  );
}
