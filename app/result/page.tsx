"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ExtractResponse, Event } from "@/lib/schemas";
import { isEventComplete } from "@/lib/schemas";
import { generateGoogleCalendarUrl } from "@/lib/calendarUrl";

function formatDateTime(isoString: string, allDay: boolean | null): string {
  if (!isoString) return "—";
  try {
    if (allDay) {
      const date = new Date(isoString);
      return date.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "Asia/Tokyo",
      });
    }
    const date = new Date(isoString);
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Tokyo",
    });
  } catch {
    return isoString;
  }
}

function EventCard({ event }: { event: Event }) {
  const complete = isEventComplete(event);
  const calendarUrl = complete ? generateGoogleCalendarUrl(event) : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 flex flex-col gap-3" style={{ borderColor: "var(--border)" }}>
      {/* Title */}
      <div>
        <h2 className="font-semibold text-base" style={{ color: "var(--foreground)" }}>
          {event.title || <span style={{ color: "var(--muted)" }}>（タイトル不明）</span>}
        </h2>
      </div>

      {/* DateTime */}
      <div className="flex items-start gap-2 text-sm" style={{ color: "var(--muted)" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0 mt-0.5">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
          <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span>
          {event.startDateTime
            ? `${formatDateTime(event.startDateTime, event.allDay)} 〜 ${formatDateTime(event.endDateTime, event.allDay)}`
            : <span style={{ color: "var(--error)" }}>日時不明</span>}
        </span>
      </div>

      {/* Location */}
      {event.location && (
        <div className="flex items-start gap-2 text-sm" style={{ color: "var(--muted)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0 mt-0.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          <span>{event.location}</span>
        </div>
      )}

      {/* Memo */}
      {event.memo && (
        <div className="text-sm rounded-lg p-2" style={{ background: "var(--primary-light)", color: "var(--foreground)" }}>
          {event.memo}
        </div>
      )}

      {/* Calendar button or review notice */}
      {calendarUrl ? (
        <a
          href={calendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: "var(--primary)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Googleカレンダーに追加
        </a>
      ) : (
        <div
          className="text-xs py-2 px-3 rounded-lg text-center"
          style={{ background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a" }}
        >
          ⚠ 要確認：必須項目が不足しているためカレンダーURLを生成できません
        </div>
      )}
    </div>
  );
}

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<ExtractResponse | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("yoteiscan_result");
    if (!stored) {
      router.replace("/");
      return;
    }
    try {
      setResult(JSON.parse(stored));
    } catch {
      router.replace("/");
    }
  }, [router]);

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

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-sm flex items-center gap-1" style={{ color: "var(--primary)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
            </svg>
            ホーム
          </Link>
          <div className="flex items-center gap-2" style={{ color: "var(--primary)" }}>
            <span className="font-medium">予定整形</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
              <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
        </div>

        <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
          予定をGoogleカレンダーに簡単に追加できます
        </p>

        {/* Warnings */}
        {result.warnings.length > 0 && (
          <div className="mb-4 rounded-xl p-3 text-sm" style={{ background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a" }}>
            <p className="font-medium mb-1">注意事項</p>
            <ul className="list-disc list-inside space-y-0.5">
              {result.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Events */}
        {result.events.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center" style={{ borderColor: "var(--border)" }}>
            <p style={{ color: "var(--muted)" }}>予定が見つかりませんでした。</p>
            <Link href="/" className="mt-3 inline-block text-sm" style={{ color: "var(--primary)" }}>
              もう一度試す
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {result.events.map((event, i) => (
              <EventCard key={i} event={event} />
            ))}
          </div>
        )}

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm py-2 px-6 rounded-xl border inline-block transition-colors"
            style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
          >
            新しく解析する
          </Link>
        </div>
      </div>
    </main>
  );
}
