import type { Event } from "./schemas";

function toGoogleCalendarDate(isoString: string, allDay: boolean): string {
  if (allDay) {
    return isoString.substring(0, 10).replace(/-/g, "");
  }
  // Convert "2026-04-01T10:00:00+09:00" → "20260401T100000+0900"
  return isoString
    .replace(/-/g, "")
    .replace(/:/g, "")
    .replace(/\.\d+/, "")
    .replace(/([+-])(\d{2}):(\d{2})$/, "$1$2$3");
}

export function generateGoogleCalendarUrl(event: Event): string {
  const allDay = event.allDay ?? false;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title || "（タイトル未設定）",
  });

  if (event.startDateTime && event.endDateTime) {
    const start = toGoogleCalendarDate(event.startDateTime, allDay);
    const end = toGoogleCalendarDate(event.endDateTime, allDay);
    params.set("dates", `${start}/${end}`);
  } else if (event.startDateTime) {
    const start = toGoogleCalendarDate(event.startDateTime, allDay);
    params.set("dates", `${start}/${start}`);
  }
  // If both dates are missing, omit "dates" — Google Calendar opens with no date pre-filled

  if (event.location) params.set("location", event.location);
  if (event.memo) params.set("details", event.memo);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
