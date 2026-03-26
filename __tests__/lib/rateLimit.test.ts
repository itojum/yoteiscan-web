import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { checkRateLimit, _clearStore } from "@/lib/rateLimit";

beforeEach(() => {
  _clearStore();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("checkRateLimit", () => {
  it("allows the first request", () => {
    const result = checkRateLimit("1.2.3.4");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("counts remaining correctly over multiple requests", () => {
    checkRateLimit("1.2.3.4");
    checkRateLimit("1.2.3.4");
    const result = checkRateLimit("1.2.3.4");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("blocks after 5 requests", () => {
    for (let i = 0; i < 5; i++) checkRateLimit("1.2.3.4");
    const result = checkRateLimit("1.2.3.4");
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("resets after the window expires", () => {
    for (let i = 0; i < 5; i++) checkRateLimit("1.2.3.4");
    vi.advanceTimersByTime(60 * 60 * 1000 + 1);
    const result = checkRateLimit("1.2.3.4");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("tracks different IPs independently", () => {
    for (let i = 0; i < 5; i++) checkRateLimit("1.2.3.4");
    const result = checkRateLimit("5.6.7.8");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("returns a future resetAt timestamp", () => {
    const now = Date.now();
    const result = checkRateLimit("1.2.3.4");
    expect(result.resetAt).toBeGreaterThan(now);
  });
});
