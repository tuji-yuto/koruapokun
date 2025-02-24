/**
 * PostCSS設定ファイル
 * CSSの変換処理を定義
 * TailwindCSSとAutoprefixerを使用したモダンなCSSワークフロー実現
 * 
 * @type {import('postcss-load-config').Config}
 */
export default {
  plugins: {
    // TailwindCSSプラグイン - ユーティリティクラス生成
    tailwindcss: {},
    // Autoprefixerプラグイン - ベンダープレフィックス自動追加でブラウザ互換性向上
    autoprefixer: {},
  },
};