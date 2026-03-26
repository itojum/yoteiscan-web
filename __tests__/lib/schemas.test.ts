import { describe, it, expect } from "vitest";
import { EventSchema, ExtractResponseSchema, isEventComplete } from "@/lib/schemas";

const completeEvent = {
  title: "ミーティング",
  startDateTime: "2026-04-01T10:00:00+09:00",
  endDateTime: "2026-04-01T11:00:00+09:00",
  allDay: false,
  location: "渋谷オフィス",
  memo: "アジェンダを確認してください",
};

describe("EventSchema", () => {
  it("parses a complete event", () => {
    const result = EventSchema.safeParse(completeEvent);
    expect(result.success).toBe(true);
  });

  it("accepts null for allDay", () => {
    const result = EventSchema.safeParse({ ...completeEvent, allDay: null });
    expect(result.success).toBe(true);
  });

  it("accepts optional nullable location and memo", () => {
    const { location: _l, memo: _m, ...minimal } = completeEvent;
    const result = EventSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });

  it("rejects missing title", () => {
    const { title: _t, ...noTitle } = completeEvent;
    expect(EventSchema.safeParse(noTitle).success).toBe(false);
  });

  it("rejects non-boolean/null allDay", () => {
    const result = EventSchema.safeParse({ ...completeEvent, allDay: "yes" });
    expect(result.success).toBe(false);
  });
});

describe("ExtractResponseSchema", () => {
  it("parses a valid response", () => {
    const result = ExtractResponseSchema.safeParse({
      events: [completeEvent],
      warnings: ["日時を推定しました。"],
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty events and warnings", () => {
    const result = ExtractResponseSchema.safeParse({ events: [], warnings: [] });
    expect(result.success).toBe(true);
  });

  it("rejects missing events field", () => {
    const result = ExtractResponseSchema.safeParse({ warnings: [] });
    expect(result.success).toBe(false);
  });

  it("rejects missing warnings field", () => {
    const result = ExtractResponseSchema.safeParse({ events: [] });
    expect(result.success).toBe(false);
  });
});

describe("isEventComplete", () => {
  it("returns true for a fully complete event", () => {
    expect(isEventComplete(completeEvent)).toBe(true);
  });

  it("returns true when allDay is true", () => {
    expect(isEventComplete({ ...completeEvent, allDay: true })).toBe(true);
  });

  it("returns false when title is empty", () => {
    expect(isEventComplete({ ...completeEvent, title: "" })).toBe(false);
  });

  it("returns false when startDateTime is empty", () => {
    expect(isEventComplete({ ...completeEvent, startDateTime: "" })).toBe(false);
  });

  it("returns false when endDateTime is empty", () => {
    expect(isEventComplete({ ...completeEvent, endDateTime: "" })).toBe(false);
  });

  it("returns false when allDay is null", () => {
    expect(isEventComplete({ ...completeEvent, allDay: null })).toBe(false);
  });
});
