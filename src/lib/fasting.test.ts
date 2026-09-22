import { describe, expect, it } from "vitest";
import { fastingProgress, formatDuration } from "./fasting";

describe("fastingProgress", () => {
  it("reports partial progress mid-fast", () => {
    const started = new Date("2026-09-22T20:00:00Z");
    const now = new Date("2026-09-23T04:00:00Z"); // 8 hours later
    const result = fastingProgress(started, 16, now);
    expect(result.elapsedHours).toBe(8);
    expect(result.remainingHours).toBe(8);
    expect(result.pct).toBe(0.5);
    expect(result.isComplete).toBe(false);
  });

  it("marks the fast complete once the planned duration has passed", () => {
    const started = new Date("2026-09-22T20:00:00Z");
    const now = new Date("2026-09-23T12:00:00Z"); // 16 hours later
    const result = fastingProgress(started, 16, now);
    expect(result.isComplete).toBe(true);
    expect(result.remainingHours).toBe(0);
  });

  it("gives a negative remaining time once past the goal", () => {
    const started = new Date("2026-09-22T20:00:00Z");
    const now = new Date("2026-09-23T14:00:00Z"); // 18 hours later, planned 16
    const result = fastingProgress(started, 16, now);
    expect(result.remainingHours).toBe(-2);
    expect(result.pct).toBeCloseTo(1.125);
    expect(result.isComplete).toBe(true);
  });
});

describe("formatDuration", () => {
  it("formats whole and partial hours", () => {
    expect(formatDuration(8)).toBe("8h 00m");
    expect(formatDuration(13.5)).toBe("13h 30m");
  });

  it("prefixes negative durations with a minus sign", () => {
    expect(formatDuration(-2.25)).toBe("-2h 15m");
  });

  it("rounds to the nearest minute", () => {
    expect(formatDuration(1.001)).toBe("1h 00m");
  });
});
