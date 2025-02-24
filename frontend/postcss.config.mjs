/**
 * PostCSS設定ファイル
 * このファイルはCSSの変換処理を定義します。
 * TailwindCSSとAutoprefixerを使用して、モダンなCSSワークフローを実現します。
 * 
 * @type {import('postcss-load-config').Config}
 */
export default {
  plugins: {
    // TailwindCSSを適用してユーティリティクラスを生成
    tailwindcss: {},
    // ベンダープレフィックスを自動追加してブラウザ互換性を向上
    autoprefixer: {},
  },
};