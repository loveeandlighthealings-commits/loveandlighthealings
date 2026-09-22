import { describe, expect, it } from "vitest";
import { formatDayMonth, weekdayIndex } from "./date";

describe("weekdayIndex", () => {
  it("returns 0 for Monday", () => {
    expect(weekdayIndex("2026-09-21")).toBe(0); // a Monday
  });

  it("returns 6 for Sunday", () => {
    expect(weekdayIndex("2026-09-27")).toBe(6); // the following Sunday
  });

  it("returns 3 for Thursday", () => {
    expect(weekdayIndex("2026-09-24")).toBe(3);
  });
});

describe("formatDayMonth", () => {
  it("formats as 'D Mon'", () => {
    expect(formatDayMonth("2026-09-21")).toBe("21 Sep");
    expect(formatDayMonth("2026-01-05")).toBe("5 Jan");
  });
});
