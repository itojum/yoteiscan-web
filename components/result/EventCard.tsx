import { Calendar, MapPin, ExternalLink } from "lucide-react";
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
          <Calendar className="w-4 h-4 flex-shrink-0 mt-0.5" />
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
            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
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
          <ExternalLink className="w-4 h-4" />
          Googleカレンダーに追加
        </a>
      </div>
    </div>
  );
}
