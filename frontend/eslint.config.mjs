/**
 * ESLint設定ファイル
 * フロントエンドコードの品質管理とコーディング規約を統一するためのリンター設定
 */

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

// ESモジュール環境で現在のディレクトリパスを取得
const __dirname = dirname(fileURLToPath(import.meta.url));

// フラット設定形式のESLint構成を初期化
const compat = new FlatCompat({ baseDirectory: __dirname });

// Next.jsの推奨設定とパフォーマンス最適化ルールを適用
export default compat.extends("next/core-web-vitals");
