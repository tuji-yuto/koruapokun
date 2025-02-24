/**
 * Tailwind CSS設定ファイル
 * このファイルでプロジェクト全体のスタイリングの基本設定を管理します。
 * コンテンツのパス、テーマ拡張、プラグインなどを定義しています。
 * 
 * @type {import('tailwindcss').Config}
 */
import typographyPlugin from '@tailwindcss/typography';
import formsPlugin from '@tailwindcss/forms';

export default {
  // スタイルを適用するファイルパスを指定
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",  // すべてのソースファイルを対象に
  ],
  theme: {
    extend: {
      // カスタムカラーの定義
      colors: {
        background: "var(--background)",  // 背景色のCSS変数
        foreground: "var(--foreground)",  // 前景色のCSS変数
        primary: {
          DEFAULT: '#1976d2',  // 基本のプライマリカラー
          light: '#42a5f5',    // 明るいバリエーション
          dark: '#1565c0'      // 暗いバリエーション
        }
      },
      // カスタムフォントファミリーの設定
      fontFamily: {
        sans: ['var(--font-geist-sans)'],  // サンセリフフォント
        mono: ['var(--font-geist-mono)'],  // 等幅フォント
      },
    },
  },
  // 使用するTailwindプラグイン
  plugins: [formsPlugin, typographyPlugin],
};
