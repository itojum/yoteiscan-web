import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ExtractResponse } from "@/lib/schemas";

// ── Mocks ──────────────────────────────────────────────────────────────────────

const mockCheckRateLimit = vi.fn();
vi.mock("@/lib/rateLimit", () => ({ checkRateLimit: mockCheckRateLimit }));

const mockExtractEvents = vi.fn();
vi.mock("@/lib/gemini", () => ({ extractEvents: mockExtractEvents }));

// Import after mocks
const { POST } = await import("@/app/api/extract/route");

// ── Helpers ────────────────────────────────────────────────────────────────────

const ALLOWED = { allowed: true, remaining: 4, resetAt: Date.now() + 3600_000 };
const BLOCKED = { allowed: false, remaining: 0, resetAt: Date.now() + 3600_000 };

const EXTRACT_OK: ExtractResponse = {
  events: [
    {
      title: "テスト会議",
      startDateTime: "2026-04-01T10:00:00+09:00",
      endDateTime: "2026-04-01T11:00:00+09:00",
      allDay: false,
    },
  ],
  warnings: [],
};

function makeJsonRequest(body: unknown, headers?: Record<string, string>) {
  return new Request("http://localhost/api/extract", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  }) as unknown as Parameters<typeof POST>[0];
}

beforeEach(() => {
  vi.clearAllMocks();
  mockCheckRateLimit.mockReturnValue(ALLOWED);
  mockExtractEvents.mockResolvedValue(EXTRACT_OK);
});

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("POST /api/extract — rate limiting", () => {
  it("returns 429 when rate limit exceeded", async () => {
    mockCheckRateLimit.mockReturnValue(BLOCKED);
    const res = await POST(makeJsonRequest({ sourceType: "text", content: "test" }));
    expect(res.status).toBe(429);
    const json = await res.json();
    expect(json.error).toContain("制限");
  });
});

describe("POST /api/extract — text / audio", () => {
  it("extracts events from text", async () => {
    const res = await POST(makeJsonRequest({ sourceType: "text", content: "4月1日に花見" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.events).toHaveLength(1);
    expect(mockExtractEvents).toHaveBeenCalledWith("4月1日に花見");
  });

  it("extracts events from audio transcription", async () => {
    const res = await POST(makeJsonRequest({ sourceType: "audio", content: "明日の会議" }));
    expect(res.status).toBe(200);
    expect(mockExtractEvents).toHaveBeenCalledWith("明日の会議");
  });

  it("returns 400 for empty text", async () => {
    const res = await POST(makeJsonRequest({ sourceType: "text", content: "   " }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when content is missing", async () => {
    const res = await POST(makeJsonRequest({ sourceType: "text" }));
    expect(res.status).toBe(400);
  });
});

describe("POST /api/extract — link", () => {
  it("fetches URL, strips HTML and extracts events", async () => {
    const html = "<html><body><p>4月1日に花見イベント</p></body></html>";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({
      ok: true,
      text: async () => html,
    }));

    const res = await POST(makeJsonRequest({ sourceType: "link", url: "https://example.com" }));
    expect(res.status).toBe(200);
    expect(mockExtractEvents).toHaveBeenCalledWith(expect.stringContaining("花見イベント"));
    vi.unstubAllGlobals();
  });

  it("returns 400 when URL fetch fails with non-OK status", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({ ok: false, status: 404 }));
    const res = await POST(makeJsonRequest({ sourceType: "link", url: "https://example.com" }));
    expect(res.status).toBe(400);
    vi.unstubAllGlobals();
  });

  it("returns 400 when URL is missing", async () => {
    const res = await POST(makeJsonRequest({ sourceType: "link" }));
    expect(res.status).toBe(400);
  });
});

describe("POST /api/extract — unknown sourceType", () => {
  it("returns 400 for unknown sourceType", async () => {
    const res = await POST(makeJsonRequest({ sourceType: "unknown" }));
    expect(res.status).toBe(400);
  });
});

describe("POST /api/extract — Gemini error", () => {
  it("returns 500 when extractEvents throws", async () => {
    mockExtractEvents.mockRejectedValueOnce(new Error("Gemini unavailable"));
    const res = await POST(makeJsonRequest({ sourceType: "text", content: "4月1日に花見" }));
    expect(res.status).toBe(500);
  });
});
