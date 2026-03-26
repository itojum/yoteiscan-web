import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Script from "next/script";
import { SwRegister } from "./_sw-register";
import "./globals.css";

const BASE_URL = "https://yoteiscan.itojum.dev";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "YoteiScan — AIでどんな媒体からでも予定を自動抽出",
    template: "%s | YoteiScan",
  },
  description:
    "テキスト・画像・音声・リンク・ファイルから予定をAIで自動抽出し、Googleカレンダーにワンクリックで登録。メールや会議メモ、チラシの予定もスマートに管理。",
  keywords: [
    "Googleカレンダー 自動登録",
    "予定 自動抽出",
    "スケジュール AI 読み取り",
    "チラシ 予定 カレンダー",
    "メール 予定 自動登録",
    "AI スケジュール 抽出",
  ],
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: BASE_URL,
    siteName: "YoteiScan",
    title: "YoteiScan — AIでどんな媒体からでも予定を自動抽出",
    description:
      "テキスト・画像・音声・リンク・ファイルから予定をAIで自動抽出し、Googleカレンダーにワンクリックで登録。",
  },
  twitter: {
    card: "summary_large_image",
    title: "YoteiScan — AIでどんな媒体からでも予定を自動抽出",
    description:
      "テキスト・画像・音声・リンク・ファイルから予定をAIで自動抽出し、Googleカレンダーにワンクリックで登録。",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "YoteiScan",
  },
};

export const viewport: Viewport = {
  themeColor: "#5ab5ab",
  width: "device-width",
  initialScale: 1,
};

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
      <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col" style={{ background: "var(--background)" }}>
        <SwRegister />

        {/* Top navigation */}
        <header className="border-b sticky top-0 z-10 bg-white" style={{ borderColor: "var(--border)" }}>
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg" style={{ color: "var(--primary)" }}>
              <span style={{ color: "var(--primary)" }}><CalendarIcon /></span>
              YoteiScan
            </Link>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
              β
            </span>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 flex flex-col">{children}</div>

        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "5650036191d94f6faf33e4600c7bf1a2"}'
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
