import { describe, expect, it } from "vitest";
import {
  base,
  calculateChallenges,
  calculateMaturity,
  calculateNameNumbers,
  calculatePersonalNumbers,
  calculatePinnacles,
  displayNumber,
  red,
} from "./numerology";

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

  it("flags a Karmic Debt on the birthday number for days 13, 14, 16 or 19", () => {
    const born16th = calculatePersonalNumbers("1985-03-16", "2026-09-21");
    expect(born16th.birthdayNumber).toBe(7); // red(16) = 7
    expect(born16th.birthdayKarmicDebt).toBe(16);

    const born10th = calculatePersonalNumbers("1985-03-10", "2026-09-21");
    expect(born10th.birthdayKarmicDebt).toBeNull();
  });

  it("flags a Karmic Debt on the life path when its pre-reduction sum is 13, 14, 16 or 19", () => {
    // red(9) + red(9) + red(1990) = 9 + 9 + 1 = 19 -> a Karmic Debt, reducing on to 1
    const result = calculatePersonalNumbers("1990-09-09", "2026-09-21");
    expect(result.lifePath).toBe(1);
    expect(result.lifePathKarmicDebt).toBe(19);
  });
});

describe("calculateMaturity", () => {
  it("sums life path and expression, keeping a resulting master number", () => {
    expect(calculateMaturity(11, 11)).toBe(22);
    expect(calculateMaturity(3, 4)).toBe(7);
  });
});

describe("calculateChallenges", () => {
  it("computes the four challenges for the brief's worked birth date", () => {
    const result = calculateChallenges("1990-05-14");
    expect(result.first).toBe(0); // |base(5) - base(14)| = |5-5| = 0
    expect(result.second).toBe(4); // |base(14) - base(1990)| = |5-1| = 4
    expect(result.third).toBe(4); // |0 - 4| = 4
    expect(result.fourth).toBe(4); // |base(5) - base(1990)| = |5-1| = 4
  });

  it("never returns a master number", () => {
    const result = calculateChallenges("1988-11-29");
    for (const value of Object.values(result)) {
      expect(value).toBeLessThanOrEqual(8);
    }
  });
});

describe("calculatePinnacles", () => {
  it("computes the four pinnacles and their age ranges for the brief's worked birth date", () => {
    const result = calculatePinnacles("1990-05-14", 11);
    expect(result.first.number).toBe(1); // red(base(5) + base(14)) = red(5+5) = 1
    expect(result.second.number).toBe(6); // red(base(14) + base(1990)) = red(5+1) = 6
    expect(result.third.number).toBe(7); // red(1 + 6) = 7
    expect(result.fourth.number).toBe(6); // red(base(5) + base(1990)) = red(5+1) = 6

    expect(result.first.fromAge).toBe(0);
    expect(result.first.toAge).toBe(34); // 36 - base(11) = 36 - 2
    expect(result.second.toAge).toBe(43);
    expect(result.third.toAge).toBe(52);
    expect(result.fourth.toAge).toBeNull();
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

  it("finds the most frequent letter value as the Hidden Passion", () => {
    // "Ann": a=1 (x1), n=5 (x2) -> 5 is the clear majority
    expect(calculateNameNumbers("Ann")!.hiddenPassion).toEqual([5]);
  });

  it("returns every tied value when there's no single most-frequent letter", () => {
    // "AB": a=1 (x1), b=2 (x1) -> tied
    expect(calculateNameNumbers("AB")!.hiddenPassion).toEqual([1, 2]);
  });
});
