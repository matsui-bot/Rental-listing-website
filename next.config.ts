import type { NextConfig } from "next";

// STORAGE_DRIVER=s3 の場合、画像URLが外部ドメイン(R2/S3等)になるため、
// next/image がそのドメインからの画像最適化を許可するよう remotePatterns に登録する。
const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  // Cloudflare R2 の既定の公開ドメイン(https://pub-xxxx.r2.dev)
  { protocol: "https", hostname: "*.r2.dev" },
];

if (process.env.S3_PUBLIC_BASE_URL) {
  try {
    const url = new URL(process.env.S3_PUBLIC_BASE_URL);
    remotePatterns.push({ protocol: url.protocol.replace(":", "") as "http" | "https", hostname: url.hostname });
  } catch {
    // 無効なURLの場合は無視(ローカル開発時など未設定でも問題ない)
  }
}

const nextConfig: NextConfig = {
  images: { remotePatterns },
};

export default nextConfig;
