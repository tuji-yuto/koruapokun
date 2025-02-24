"use client";

/**
 * ホームページモジュール
 * 
 * このファイルはアプリケーションのホームページを定義します。
 * ダッシュボード表示のためのメインエントリーポイントとして機能します。
 */

import dynamic from 'next/dynamic';

// クライアントサイドレンダリングのためにHomeDashboardをdynamicインポート
const HomeDashboard = dynamic(
  () => import("../../components/HomeDashboard"),
  { ssr: false } // サーバーサイドレンダリングを無効化
);

export default function HomePage() {
  return (
    <main>
      <HomeDashboard />
    </main>
  );
}
