'use client';

/**
 * アプリケーションのルートレイアウト
 * 
 * 全体の基本レイアウト定義
 * テーマ設定、フォント読み込み、メタデータなどの共通要素管理
 */

import { ThemeProvider } from '@mui/material/styles';
import { lightTheme } from '../theme';
import CssBaseline from '@mui/material/CssBaseline';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

/**
 * Geistフォントファミリー設定
 * Tailwindで使用するためのCSS変数定義
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * ルートレイアウトコンポーネント
 * アプリケーション全体の共通レイアウト構造提供
 */
export default function RootLayout({ children }) {
  // 常にライトテーマを使用
  const theme = lightTheme;

  return (
    <html lang="ja">
      <head>
        <title>VS Project - KPI管理ダッシュボード</title>
        <meta name="description" content="KPI管理ダッシュボードアプリケーション" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
