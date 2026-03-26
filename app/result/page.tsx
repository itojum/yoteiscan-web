"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ExtractResponse } from "@/lib/schemas";
import { isEventComplete } from "@/lib/schemas";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EventCard } from "@/components/result/EventCard";

export default function ResultPage() {
  const router = useRouter();
  const [result] = useState<ExtractResponse | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = sessionStorage.getItem("yoteiscan_result");
    if (!stored) return null;
    try {
      return JSON.parse(stored) as ExtractResponse;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!result) router.replace("/");
  }, [result, router]);

  if (!result) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none" style={{ color: "var(--primary)" }}>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </main>
    );
  }

  const completeCount = result.events.filter(isEventComplete).length;

  return (
    <main className="flex-1">
      {/* Page header */}
      <div className="border-b bg-white" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="mb-1">
              <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "解析結果" }]} />
            </div>
            <h1 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>解析結果</h1>
            {result.events.length > 0 && (
              <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
                {result.events.length}件の予定を検出
                {completeCount < result.events.length && (
                  <span style={{ color: "#f59e0b" }}>（うち {result.events.length - completeCount}件は要確認）</span>
                )}
              </p>
            )}
          </div>
          <Link
            href="/"
            className="text-sm py-2 px-5 rounded-xl border font-medium transition-colors hover:bg-gray-50"
            style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
          >
            新しく解析する
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Warnings */}
        {result.warnings.length > 0 && (
          <div className="mb-6 rounded-xl p-4 text-sm flex gap-3" style={{ background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 flex-shrink-0 mt-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-semibold mb-1">注意事項</p>
              <ul className="space-y-0.5 list-disc list-inside">
                {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          </div>
        )}

        {/* Events grid */}
        {result.events.length === 0 ? (
          <div className="bg-white rounded-2xl border p-12 text-center" style={{ borderColor: "var(--border)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--muted)" }}>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
              <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <p className="font-medium mb-1" style={{ color: "var(--foreground)" }}>予定が見つかりませんでした</p>
            <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>入力内容に予定情報が含まれているか確認してください</p>
            <Link href="/" className="text-sm font-medium" style={{ color: "var(--primary)" }}>
              ← もう一度試す
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {result.events.map((event, i) => (
              <EventCard key={i} event={event} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
