import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGenerateContent = vi.fn();

vi.mock("@google/generative-ai", () => {
  class GoogleGenerativeAI {
    getGenerativeModel() {
      return { generateContent: mockGenerateContent };
    }
  }
  return { GoogleGenerativeAI };
});

// Import after mock is set up
const { extractEvents } = await import("@/lib/gemini");

function makeResponse(data: unknown) {
  return {
    response: {
      text: () => JSON.stringify(data),
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("extractEvents", () => {
  it("returns parsed events and warnings", async () => {
    const payload = {
      events: [
        {
          title: "花見",
          startDateTime: "2026-04-01T10:00:00+09:00",
          endDateTime: "2026-04-01T12:00:00+09:00",
          allDay: false,
        },
      ],
      warnings: [],
    };
    mockGenerateContent.mockResolvedValueOnce(makeResponse(payload));

    const result = await extractEvents("花見は4月1日10時から");
    expect(result.events).toHaveLength(1);
    expect(result.events[0].title).toBe("花見");
    expect(result.warnings).toEqual([]);
  });

  it("returns empty events when none found", async () => {
    mockGenerateContent.mockResolvedValueOnce(
      makeResponse({ events: [], warnings: ["予定が見つかりませんでした。"] })
    );

    const result = await extractEvents("特に予定はありません");
    expect(result.events).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
  });

  it("passes image parts to the model when provided", async () => {
    mockGenerateContent.mockResolvedValueOnce(
      makeResponse({ events: [], warnings: [] })
    );

    const imagePart = { inlineData: { data: "base64data", mimeType: "image/jpeg" } };
    await extractEvents("", [imagePart]);

    const call = mockGenerateContent.mock.calls[0][0];
    const parts = call.contents[0].parts;
    expect(parts[0]).toEqual(imagePart);
    expect(parts[1].text).toContain("画像");
  });

  it("throws when Gemini returns invalid JSON structure", async () => {
    mockGenerateContent.mockResolvedValueOnce(
      makeResponse({ unexpected: "shape" })
    );

    await expect(extractEvents("test")).rejects.toThrow();
  });

  it("throws when Gemini call rejects", async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error("API error"));
    await expect(extractEvents("test")).rejects.toThrow("API error");
  });
});
