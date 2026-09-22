import { describe, expect, it } from "vitest";
import {
  calculateBmi,
  calorieGoalOptions,
  dayScore,
  dayVerdict,
  foodPct,
  goalProgress,
  sleepHours,
} from "./formulas";

describe("sleepHours", () => {
  it("returns null when either time is missing", () => {
    expect(sleepHours(null, "06:00")).toBeNull();
    expect(sleepHours("22:00", undefined)).toBeNull();
    expect(sleepHours(null, null)).toBeNull();
  });

  it("calculates a same-day span", () => {
    expect(sleepHours("13:00", "14:30")).toBe(1.5);
  });

  it("wraps past midnight", () => {
    expect(sleepHours("22:00", "06:00")).toBe(8);
    expect(sleepHours("23:30", "07:15")).toBeCloseTo(7.75);
  });

  it("wraps when wake time equals bed time (full 24h)", () => {
    expect(sleepHours("07:00", "07:00")).toBe(24);
  });
});

describe("foodPct", () => {
  it("returns 0 with no calories or no goal", () => {
    expect(foodPct(0, 2000)).toBe(0);
    expect(foodPct(1500, 0)).toBe(0);
  });

  it("scales up below 80% of goal", () => {
    expect(foodPct(800, 2000)).toBeCloseTo(0.5); // 40% eaten / 80% threshold
  });

  it("counts 80-110% of goal as fully met", () => {
    expect(foodPct(1600, 2000)).toBe(1); // exactly 80%
    expect(foodPct(2000, 2000)).toBe(1); // exactly 100%
    expect(foodPct(2200, 2000)).toBe(1); // exactly 110%
  });

  it("falls off quickly above 110% of goal", () => {
    expect(foodPct(2400, 2000)).toBeCloseTo(0.75); // 120% -> 1 - (0.1 * 2.5)
    expect(foodPct(3000, 2000)).toBeCloseTo(0); // way over, clamped at 0
  });
});

describe("dayScore", () => {
  it("returns 0 when nothing applies", () => {
    expect(dayScore({ water: { pct: null }, steps: { pct: null } })).toBe(0);
  });

  it("averages only the applicable components", () => {
    const score = dayScore({
      water: { pct: 1 },
      steps: { pct: 0.5 },
      sleep: { pct: null }, // doesn't apply, excluded from the average
    });
    expect(score).toBe(75); // (100 + 50) / 2
  });

  it("caps each component at 100% before averaging", () => {
    const score = dayScore({
      water: { pct: 2 }, // 200% of goal, capped to 100%
      steps: { pct: 0 },
    });
    expect(score).toBe(50);
  });
});

describe("dayVerdict", () => {
  it("shows a fresh-page message when nothing has been logged", () => {
    const verdict = dayVerdict(0, {}, false);
    expect(verdict.headline).toBe("A fresh page");
  });

  it("scales the headline with the score once something is logged", () => {
    expect(dayVerdict(95, { water: { pct: 1 } }, true).headline).toBe("Strong day");
    expect(dayVerdict(70, { water: { pct: 1 } }, true).headline).toBe("Good day");
    expect(dayVerdict(40, { water: { pct: 1 } }, true).headline).toBe("Halfway there");
    expect(dayVerdict(10, { water: { pct: 1 } }, true).headline).toBe("Just getting started");
  });

  it("calls out the lowest component that isn't fully met", () => {
    const verdict = dayVerdict(75, { water: { pct: 1 }, steps: { pct: 0.4 } }, true);
    expect(verdict.subtext).toContain("Steps");
    expect(verdict.subtext).toContain("40%");
  });

  it("never calls out calories as the thing to catch up on", () => {
    const verdict = dayVerdict(50, { food: { pct: 0.1 }, steps: { pct: 1 } }, true);
    expect(verdict.subtext).not.toContain("Calories");
    expect(verdict.subtext).toContain("Every target is covered");
  });

  it("says every target is covered when nothing (other than food) is below 100%", () => {
    const verdict = dayVerdict(100, { water: { pct: 1 }, steps: { pct: 1 } }, true);
    expect(verdict.subtext).toContain("Every target is covered");
  });
});

describe("calculateBmi", () => {
  it("uses WHO cut-offs (18.5 / 25 / 30) by default", () => {
    // 70kg at 175cm = 22.86
    const result = calculateBmi(175, 70, "who");
    expect(result.bmi).toBeCloseTo(22.86, 1);
    expect(result.category).toBe("Healthy range");
  });

  it("categorizes underweight, overweight and obese on the WHO scale", () => {
    expect(calculateBmi(170, 45, "who").category).toBe("Underweight");
    expect(calculateBmi(170, 78, "who").category).toBe("Overweight"); // BMI ~27
    expect(calculateBmi(170, 95, "who").category).toBe("Obese"); // BMI ~32.9
  });

  it("uses tighter Asian cut-offs (18.5 / 23 / 25)", () => {
    // 70kg at 175cm = 22.86 -> healthy on WHO, still healthy just under 23 on Asian
    expect(calculateBmi(175, 70, "asian").category).toBe("Healthy range");
    // 72kg at 175cm = 23.5 -> overweight on Asian scale, healthy on WHO
    expect(calculateBmi(175, 72, "asian").category).toBe("Overweight");
    expect(calculateBmi(175, 72, "who").category).toBe("Healthy range");
  });

  it("gives a healthy weight range for the height", () => {
    const { healthyRangeKg } = calculateBmi(160, 60, "who");
    expect(healthyRangeKg[0]).toBeCloseTo(47.36, 1);
    expect(healthyRangeKg[1]).toBeCloseTo(63.7, 1);
  });
});

describe("calorieGoalOptions", () => {
  it("never suggests below 1200 kcal for a woman", () => {
    // Small, older, sedentary woman -> TDEE naturally low
    const options = calorieGoalOptions(45, 150, 65, "f", "sedentary");
    for (const option of options) {
      expect(option.kcal).toBeGreaterThanOrEqual(1200);
    }
    // The aggressive deficit option should hit the floor
    expect(options[2].atFloor).toBe(true);
  });

  it("never suggests below 1500 kcal for a man", () => {
    const options = calorieGoalOptions(55, 160, 70, "m", "sedentary");
    for (const option of options) {
      expect(option.kcal).toBeGreaterThanOrEqual(1500);
    }
  });

  it("rounds to the nearest 50 kcal", () => {
    const options = calorieGoalOptions(80, 180, 30, "m", "active");
    for (const option of options) {
      expect(option.kcal % 50).toBe(0);
    }
  });

  it("orders maintain > -0.25kg/week > -0.5kg/week when not floored", () => {
    const [maintain, quarter, half] = calorieGoalOptions(90, 185, 28, "m", "moderate");
    expect(maintain.kcal).toBeGreaterThan(quarter.kcal);
    expect(quarter.kcal).toBeGreaterThan(half.kcal);
  });
});

describe("goalProgress", () => {
  it("clamps to 0-1 for a weight-loss goal", () => {
    expect(goalProgress(80, 80, 70)).toBe(0); // at start
    expect(goalProgress(75, 80, 70)).toBe(0.5); // halfway
    expect(goalProgress(70, 80, 70)).toBe(1); // reached
    expect(goalProgress(65, 80, 70)).toBe(1); // past target, still clamped to 1
    expect(goalProgress(85, 80, 70)).toBe(0); // moved the wrong way, clamped to 0
  });

  it("works the same way for a weight-gain goal", () => {
    expect(goalProgress(60, 60, 70)).toBe(0);
    expect(goalProgress(65, 60, 70)).toBe(0.5);
    expect(goalProgress(70, 60, 70)).toBe(1);
  });

  it("treats reaching within 0.05kg of an already-met target as complete", () => {
    // start === target is the "no distance to travel" case; being within
    // 0.05kg of it still counts as reached rather than needing an exact match.
    expect(goalProgress(70.03, 70, 70)).toBe(1);
  });

  it("returns 1 if there's no distance to travel and target is met exactly", () => {
    expect(goalProgress(70, 70, 70)).toBe(1);
  });

  it("returns 0 with no starting weight and target not yet met", () => {
    expect(goalProgress(75, null, 70)).toBe(0);
  });
});
