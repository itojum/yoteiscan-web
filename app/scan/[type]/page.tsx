"use client";

import { use } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { TextInput } from "@/components/scan/TextInput";
import { ImageInput } from "@/components/scan/ImageInput";
import { AudioInput } from "@/components/scan/AudioInput";
import { LinkInput } from "@/components/scan/LinkInput";
import { FileInput } from "@/components/scan/FileInput";

type ScanType = "text" | "image" | "audio" | "link" | "file";

const VALID_TYPES: ScanType[] = ["text", "image", "audio", "link", "file"];

const TYPE_META: Record<ScanType, { label: string; description: string; hint: string; icon: React.ReactNode }> = {
  text: {
    label: "テキスト入力",
    description: "メール・チャット・メモなどのテキストを貼り付けて解析します。複数の予定が含まれていても一括抽出できます。",
    hint: "コピペしたメール本文や、スケジュール情報を含むテキストをそのまま貼り付けてください。",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-12 h-12">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10" />
      </svg>
    ),
  },
  image: {
    label: "画像入力",
    description: "スクリーンショット・チラシ・ポスターなどの画像から予定を自動認識します。",
    hint: "予定情報が写っている画像（PNG・JPG・WEBP等）をアップロードしてください。",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-12 h-12">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
      </svg>
    ),
  },
  audio: {
    label: "音声入力",
    description: "マイクで音声を録音してリアルタイムに文字起こし。テキストを確認してから解析します。",
    hint: "録音ボタンをクリックして話しかけてください。文字起こし結果は解析前に編集できます。",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-12 h-12">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
      </svg>
    ),
  },
  link: {
    label: "リンク入力",
    description: "WebページのURLを入力するとページ内のテキストを取得し、予定情報を抽出します。",
    hint: "イベントページ・告知ページ・スケジュールが掲載されているURLを入力してください。",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-12 h-12">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  file: {
    label: "ファイル入力",
    description: "PDF・TXT・MDファイルをアップロード。ドキュメント内から予定情報を抽出します。",
    hint: "対応形式：PDF・TXT・MD。ファイルはサーバーに保存されません。",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-12 h-12">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
};

const inputComponents: Record<ScanType, React.ReactNode> = {
  text: <TextInput />,
  image: <ImageInput />,
  audio: <AudioInput />,
  link: <LinkInput />,
  file: <FileInput />,
};

export default function ScanPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = use(params);

  if (!VALID_TYPES.includes(type as ScanType)) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <p className="text-lg font-medium mb-3" style={{ color: "var(--error)" }}>無効な入力タイプです。</p>
        <Link href="/" className="text-sm" style={{ color: "var(--primary)" }}>← ホームに戻る</Link>
      </main>
    );
  }

  const scanType = type as ScanType;
  const meta = TYPE_META[scanType];

  return (
    <main className="flex-1">
      {/* Breadcrumb bar */}
      <div className="border-b" style={{ borderColor: "var(--border)", background: "#fff" }}>
        <div className="max-w-6xl mx-auto px-6 h-10 flex items-center">
          <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: meta.label }]} />
        </div>
      </div>

      {/* Two-column layout */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Left: description panel */}
          <aside className="lg:col-span-2">
            <div
              className="rounded-2xl p-6 flex flex-col gap-4 sticky top-24"
              style={{ background: "var(--primary-light)" }}
            >
              <span style={{ color: "var(--primary)" }}>{meta.icon}</span>
              <div>
                <h1 className="text-xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
                  {meta.label}
                </h1>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  {meta.description}
                </p>
              </div>
              <div className="rounded-xl p-3 text-xs leading-relaxed" style={{ background: "rgba(255,255,255,0.7)", color: "var(--muted)" }}>
                <p className="font-semibold mb-1" style={{ color: "var(--foreground)" }}>ヒント</p>
                {meta.hint}
              </div>
            </div>
          </aside>

          {/* Right: form panel */}
          <section className="lg:col-span-3">
            <div className="bg-white rounded-2xl border p-6 shadow-sm" style={{ borderColor: "var(--border)" }}>
              {inputComponents[scanType]}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
