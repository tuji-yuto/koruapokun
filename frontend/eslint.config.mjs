/**
 * ESLint設定ファイル
 * このファイルはフロントエンドコードの品質を保つためのリンターの設定を定義します
 */

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

// ESモジュールでは__dirnameが使えないため、現在のファイルパスから取得
const __dirname = dirname(fileURLToPath(import.meta.url));

// 新しいフラットな設定形式でESLintを構成
const compat = new FlatCompat({ baseDirectory: __dirname });

// Next.jsの推奨設定（コアウェブバイタル対応含む）を適用
export default compat.extends("next/core-web-vitals");
