import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "トラベルエステート株式会社｜賃貸物件情報",
    template: "%s｜トラベルエステート株式会社",
  },
  description: "トラベルエステート株式会社が管理する賃貸物件の空室情報をご案内します。",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "トラベルエステート株式会社",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
