import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "YoteiScan",
  description: "あらゆる媒体から予定を登録できます",
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
      </body>
    </html>
  );
}
