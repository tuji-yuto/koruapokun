"use client";

/**
 * ホームページコンポーネント
 * 
 * アプリケーションのホームページを定義
 * ダッシュボード表示のメインエントリーポイント
 */

import dynamic from 'next/dynamic';

// パフォーマンス最適化のためHomeDashboardをクライアントサイドのみでレンダリング
const HomeDashboard = dynamic(
  () => import("../../components/HomeDashboard"),
  { ssr: false }
);

/**
 * ホームページコンポーネント
 * ダッシュボードを表示するメインコンテナ
 */
export default function HomePage() {
  return (
    <main>
      <HomeDashboard />
    </main>
  );
}
