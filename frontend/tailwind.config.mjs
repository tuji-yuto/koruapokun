/**
 * Tailwind CSS設定ファイル
 * プロジェクト全体のスタイリング基本設定を管理
 * 
 * @type {import('tailwindcss').Config}
 */
import typographyPlugin from '@tailwindcss/typography';
import formsPlugin from '@tailwindcss/forms';

export default {
  // スタイル適用対象のファイルパスを指定
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",  // 全ソースファイルを対象
  ],
  theme: {
    extend: {
      colors: {
        // グローバルカラー変数
        background: "var(--background)",  // 背景色
        foreground: "var(--foreground)",  // 前景色
        // プライマリカラーとバリエーション
        primary: {
          DEFAULT: '#1976d2',  // 基本色
          light: '#42a5f5',    // 明色
          dark: '#1565c0'      // 暗色
        }
      },
      fontFamily: {
        // カスタムフォント定義
        sans: ['var(--font-geist-sans)'],  // サンセリフ
        mono: ['var(--font-geist-mono)'],  // 等幅
      },
    },
  },
  // 拡張プラグイン
  plugins: [formsPlugin, typographyPlugin],
};
