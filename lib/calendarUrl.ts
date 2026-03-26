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
    // fix timezone: +09:00 → +0900
    .replace(/([+-])(\d{2}):(\d{2})$/, "$1$2$3");
}

export function generateGoogleCalendarUrl(event: Event): string | null {
  if (
    !event.title ||
    !event.startDateTime ||
    !event.endDateTime ||
    event.allDay === null ||
    event.allDay === undefined
  ) {
    return null;
  }

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
  });

  const startFormatted = toGoogleCalendarDate(event.startDateTime, event.allDay);
  const endFormatted = toGoogleCalendarDate(event.endDateTime, event.allDay);
  params.set("dates", `${startFormatted}/${endFormatted}`);

  if (event.location) params.set("location", event.location);
  if (event.memo) params.set("details", event.memo);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
