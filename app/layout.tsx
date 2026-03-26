import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YoteiScan",
  description: "あらゆる媒体から予定を登録できます",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col bg-gray-50">{children}</body>
    </html>
  );
}
