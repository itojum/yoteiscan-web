import { describe, it, expect } from "vitest";
import { generateGoogleCalendarUrl } from "@/lib/calendarUrl";
import type { Event } from "@/lib/schemas";

const base: Event = {
  title: "花見",
  startDateTime: "2026-04-01T10:00:00+09:00",
  endDateTime: "2026-04-01T12:00:00+09:00",
  allDay: false,
};

function parseParams(url: string): URLSearchParams {
  return new URLSearchParams(url.split("?")[1]);
}

describe("generateGoogleCalendarUrl", () => {
  it("always returns a string starting with the Google Calendar base URL", () => {
    const url = generateGoogleCalendarUrl(base);
    expect(url).toMatch(/^https:\/\/calendar\.google\.com\/calendar\/render\?/);
  });

  it("sets action=TEMPLATE", () => {
    const p = parseParams(generateGoogleCalendarUrl(base));
    expect(p.get("action")).toBe("TEMPLATE");
  });

  it("encodes the event title", () => {
    const p = parseParams(generateGoogleCalendarUrl(base));
    expect(p.get("text")).toBe("花見");
  });

  it("uses default title when title is empty", () => {
    const p = parseParams(generateGoogleCalendarUrl({ ...base, title: "" }));
    expect(p.get("text")).toBe("（タイトル未設定）");
  });

  it("formats timed event dates correctly", () => {
    const p = parseParams(generateGoogleCalendarUrl(base));
    expect(p.get("dates")).toBe("20260401T100000+0900/20260401T120000+0900");
  });

  it("formats all-day event dates correctly", () => {
    const event: Event = {
      ...base,
      startDateTime: "2026-04-01",
      endDateTime: "2026-04-01",
      allDay: true,
    };
    const p = parseParams(generateGoogleCalendarUrl(event));
    expect(p.get("dates")).toBe("20260401/20260401");
  });

  it("uses start/start when only startDateTime is provided", () => {
    const p = parseParams(
      generateGoogleCalendarUrl({ ...base, endDateTime: "" })
    );
    expect(p.get("dates")).toBe("20260401T100000+0900/20260401T100000+0900");
  });

  it("omits dates param when both start and end are empty", () => {
    const p = parseParams(
      generateGoogleCalendarUrl({ ...base, startDateTime: "", endDateTime: "" })
    );
    expect(p.has("dates")).toBe(false);
  });

  it("includes location when provided", () => {
    const p = parseParams(
      generateGoogleCalendarUrl({ ...base, location: "上野公園" })
    );
    expect(p.get("location")).toBe("上野公園");
  });

  it("omits location when not provided", () => {
    const p = parseParams(generateGoogleCalendarUrl(base));
    expect(p.has("location")).toBe(false);
  });

  it("includes memo as details when provided", () => {
    const p = parseParams(
      generateGoogleCalendarUrl({ ...base, memo: "シートを持参" })
    );
    expect(p.get("details")).toBe("シートを持参");
  });

  it("works when allDay is null (treats as false)", () => {
    const url = generateGoogleCalendarUrl({ ...base, allDay: null });
    expect(url).toContain("dates=");
  });
});
