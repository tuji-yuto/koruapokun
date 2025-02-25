/**
 * Next.js設定ファイル
 * アプリケーションの基本設定を管理
 * 環境変数、ビルド設定、APIルート、画像最適化などの設定が可能
 * 
 * @type {import('next').NextConfig}
 */

// 環境変数とCORS設定を追加
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://koruapokun-4.onrender.com',
  },
  async headers() {
    return [
      {
        // すべてのルートに適用
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};

export default nextConfig;
