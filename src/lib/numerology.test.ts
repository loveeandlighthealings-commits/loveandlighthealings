import { describe, expect, it } from "vitest";
import { base, calculateNameNumbers, calculatePersonalNumbers, displayNumber, red } from "./numerology";

describe("red", () => {
  it("reduces to a single digit", () => {
    expect(red(23)).toBe(5);
    expect(red(9)).toBe(9);
  });

  it("stops at the master numbers 11, 22 and 33", () => {
    expect(red(11)).toBe(11);
    expect(red(22)).toBe(22);
    expect(red(33)).toBe(33);
  });

  it("reduces through intermediate master-looking sums that aren't the final result", () => {
    // 29 -> 11 (a master number), stops there rather than reducing to 2
    expect(red(29)).toBe(11);
  });
});

describe("base", () => {
  it("reduces all the way to a single digit, even past a master number", () => {
    expect(base(11)).toBe(2);
    expect(base(22)).toBe(4);
    expect(base(33)).toBe(6);
    expect(base(7)).toBe(7);
  });
});

describe("displayNumber", () => {
  it("shows plain numbers as-is", () => {
    expect(displayNumber(5)).toBe("5");
  });

  it("shows master numbers as 'N/base'", () => {
    expect(displayNumber(11)).toBe("11/2");
    expect(displayNumber(22)).toBe("22/4");
    expect(displayNumber(33)).toBe("33/6");
  });
});

describe("calculatePersonalNumbers", () => {
  // The exact worked example from docs/build-brief.md section 6b.
  it("matches the brief's worked example: 1990-05-14 on 2026-09-21", () => {
    const result = calculatePersonalNumbers("1990-05-14", "2026-09-21");
    expect(result.personalYear).toBe(2);
    expect(result.personalMonth).toBe(11);
    expect(result.personalDay).toBe(5);
    expect(result.lifePath).toBe(11);
    expect(result.universalYear).toBe(1);
  });

  it("computes the birthday number as the reduced birth day", () => {
    const result = calculatePersonalNumbers("1990-05-14", "2026-09-21");
    expect(result.birthdayNumber).toBe(5); // red(14) = 5
  });

  it("computes universal month and day from the calendar alone, no birth date needed for those", () => {
    const a = calculatePersonalNumbers("1990-05-14", "2026-09-21");
    const b = calculatePersonalNumbers("1985-11-02", "2026-09-21");
    expect(a.universalYear).toBe(b.universalYear);
    expect(a.universalMonth).toBe(b.universalMonth);
    expect(a.universalDay).toBe(b.universalDay);
  });
});

describe("calculateNameNumbers", () => {
  it("returns null for a name with no letters", () => {
    expect(calculateNameNumbers("123 !!!")).toBeNull();
    expect(calculateNameNumbers("")).toBeNull();
  });

  it("computes expression, soul urge and personality for a simple name", () => {
    // "Ann": a=1, n=5, n=5 -> all=11 (stays, master), vowels={a}=1, consonants={n,n}=10->1
    const result = calculateNameNumbers("Ann");
    expect(result).not.toBeNull();
    expect(result!.expression).toBe(11);
    expect(result!.soulUrge).toBe(1);
    expect(result!.personality).toBe(1);
  });

  it("strips accents and non-letter characters", () => {
    const withAccent = calculateNameNumbers("Ánn");
    const plain = calculateNameNumbers("Ann");
    expect(withAccent).toEqual(plain);

    const withPunctuation = calculateNameNumbers("Ann-Marie O'Neil");
    expect(withPunctuation).not.toBeNull();
  });
});
