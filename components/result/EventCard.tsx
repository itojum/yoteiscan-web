import type { Event } from "@/lib/schemas";
import { isEventComplete } from "@/lib/schemas";
import { generateGoogleCalendarUrl } from "@/lib/calendarUrl";

function formatDateTime(isoString: string, allDay: boolean | null): string {
  if (!isoString) return "—";
  try {
    if (allDay) {
      return new Date(isoString).toLocaleDateString("ja-JP", {
        year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Tokyo",
      });
    }
    return new Date(isoString).toLocaleString("ja-JP", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tokyo",
    });
  } catch {
    return isoString;
  }
}

interface Props {
  event: Event;
}

export function EventCard({ event }: Props) {
  const complete = isEventComplete(event);

  return (
    <div className="bg-white rounded-2xl border flex flex-col overflow-hidden shadow-sm" style={{ borderColor: "var(--border)" }}>
      {/* Color bar */}
      <div className="h-1.5" style={{ background: complete ? "var(--primary)" : "#fbbf24" }} />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Title */}
        <h2 className="font-semibold text-base leading-snug" style={{ color: "var(--foreground)" }}>
          {event.title || <span style={{ color: "var(--muted)" }}>（タイトル不明）</span>}
        </h2>

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
              ? <>{formatDateTime(event.startDateTime, event.allDay)}&nbsp;〜&nbsp;{formatDateTime(event.endDateTime, event.allDay)}</>
              : <span style={{ color: "#f59e0b" }}>日時不明</span>}
          </span>
        </div>

        {/* allDay badge */}
        {event.allDay && (
          <span className="self-start text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
            終日
          </span>
        )}

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
          <div className="text-xs rounded-lg p-2.5 leading-relaxed" style={{ background: "var(--primary-light)", color: "var(--foreground)" }}>
            {event.memo}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Calendar button */}
        {!complete && (
          <p className="text-xs mt-1" style={{ color: "#f59e0b" }}>
            ⚠ 日時などが不足しています。カレンダー側で確認・補完してください。
          </p>
        )}
        <a
          href={generateGoogleCalendarUrl(event)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90 mt-1"
          style={{ background: "var(--primary)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Googleカレンダーに追加
        </a>
      </div>
    </div>
  );
}
