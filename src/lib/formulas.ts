/**
 * Core wellness formulas, ported exactly from reference/prototype.html per
 * docs/build-brief.md section 6. Pure functions, no I/O -- see
 * formulas.test.ts for coverage against the prototype's own behavior.
 */

// ---------------------------------------------------------------------
// Sleep hours: bed time to wake time, wrapping past midnight.
// ---------------------------------------------------------------------

/** Parses "HH:MM" into total minutes since midnight. */
function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Hours slept, given "HH:MM" bed and wake times. Wraps past midnight: if
 * wake time is not later than bed time, a day is added. Returns null if
 * either time is missing.
 */
export function sleepHours(bedTime: string | null | undefined, wakeTime: string | null | undefined): number | null {
  if (!bedTime || !wakeTime) return null;
  let diff = toMinutes(wakeTime) - toMinutes(bedTime);
  if (diff <= 0) diff += 24 * 60;
  return diff / 60;
}

// ---------------------------------------------------------------------
// Day score
// ---------------------------------------------------------------------

/**
 * How much of a calorie goal counts toward the day score. Below 80% of
 * goal it scales up; 80-110% counts as fully met; above 110% it falls off
 * quickly (never counting less than 0).
 */
export function foodPct(kcal: number, goal: number): number {
  if (!kcal || !goal) return 0;
  const ratio = kcal / goal;
  if (ratio < 0.8) return ratio / 0.8;
  if (ratio <= 1.1) return 1;
  return Math.max(0, 1 - (ratio - 1.1) * 2.5);
}

export interface ScoreComponent {
  /** Fraction of goal met, 0-1+ (over 100% is allowed and gets capped), or null if this component doesn't apply today. */
  pct: number | null;
}

/**
 * The day score: the average of whichever goal components apply today
 * (water, steps, sleep, calories/planned meals, routine, workout), each
 * capped at 100%. Returns 0 if no components apply.
 */
export function dayScore(components: Record<string, ScoreComponent>): number {
  const applicable = Object.values(components).filter((c) => c.pct != null);
  if (!applicable.length) return 0;
  const sum = applicable.reduce((total, c) => total + Math.min(1, c.pct as number), 0);
  return Math.round((100 * sum) / applicable.length);
}

const METRIC_LABELS: Record<string, string> = {
  water: "Water",
  steps: "Steps",
  sleep: "Sleep",
  food: "Calories",
  routine: "Routine",
  workout: "Workout",
};

export interface DayVerdict {
  headline: string;
  subtext: string;
}

/**
 * The Today screen's headline and one-line summary under the hero score.
 * `hasActivity` is whether anything at all has been logged today -- with
 * nothing logged, the score is trivially 0 but the copy shouldn't scold.
 */
export function dayVerdict(
  score: number,
  components: Record<string, ScoreComponent>,
  hasActivity: boolean
): DayVerdict {
  if (!hasActivity) {
    return {
      headline: "A fresh page",
      subtext: "Start with a glass of water or tick off your first routine item.",
    };
  }

  const headline =
    score >= 90 ? "Strong day" : score >= 65 ? "Good day" : score >= 35 ? "Halfway there" : "Just getting started";

  const lowest = Object.entries(components)
    .filter(([key, c]) => key !== "food" && c.pct != null && (c.pct as number) < 1)
    .sort((a, b) => (a[1].pct as number) - (b[1].pct as number))[0];

  const subtext = lowest
    ? `${score}% of your goals met. ${METRIC_LABELS[lowest[0]] ?? lowest[0]} has the furthest to go (${Math.round((lowest[1].pct as number) * 100)}%).`
    : `${score}% of your goals met. Every target is covered.`;

  return { headline, subtext };
}

// ---------------------------------------------------------------------
// BMI
// ---------------------------------------------------------------------

export type BmiScale = "who" | "asian";
export type BmiCategory = "Underweight" | "Healthy range" | "Overweight" | "Obese";

export interface BmiResult {
  bmi: number;
  category: BmiCategory;
  /** [low, high] kg for a healthy BMI at this height, on the chosen scale. */
  healthyRangeKg: [number, number];
}

/** BMI cut-offs and category, using WHO (18.5/25/30) or Asian (18.5/23/25) scales. */
export function calculateBmi(heightCm: number, weightKg: number, scale: BmiScale): BmiResult {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const overweightCutoff = scale === "asian" ? 23 : 25;
  const obeseCutoff = scale === "asian" ? 25 : 30;

  const category: BmiCategory =
    bmi < 18.5
      ? "Underweight"
      : bmi < overweightCutoff
        ? "Healthy range"
        : bmi < obeseCutoff
          ? "Overweight"
          : "Obese";

  const healthyRangeKg: [number, number] = [
    18.5 * heightM * heightM,
    (overweightCutoff - 0.1) * heightM * heightM,
  ];

  return { bmi, category, healthyRangeKg };
}

// ---------------------------------------------------------------------
// Calorie goal helper: Mifflin-St Jeor, with safety floors
// ---------------------------------------------------------------------

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active";
export type Sex = "f" | "m";

export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

/** Never suggest below this many kcal/day, regardless of the calculation. */
export const CALORIE_FLOOR: Record<Sex, number> = { f: 1200, m: 1500 };

export interface CalorieGoalOption {
  label: string;
  kcal: number;
  /** True if this option was clamped up to the safety floor. */
  atFloor: boolean;
}

/**
 * Three calorie-goal suggestions (maintain, -0.25kg/week, -0.5kg/week),
 * rounded to the nearest 50 kcal and never below the sex-based floor.
 */
export function calorieGoalOptions(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: Sex,
  activity: ActivityLevel
): CalorieGoalOption[] {
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === "m" ? 5 : -161);
  const tdee = bmr * ACTIVITY_FACTORS[activity];
  const floor = CALORIE_FLOOR[sex];
  const round50 = (v: number) => Math.round(v / 50) * 50;

  const option = (label: string, target: number): CalorieGoalOption => {
    const rounded = round50(target);
    const kcal = Math.max(floor, rounded);
    return { label, kcal, atFloor: kcal === floor && rounded < floor };
  };

  return [
    option("Maintain your weight", tdee),
    option("Lose about 0.25 kg a week", tdee - 275),
    option("Lose about 0.5 kg a week", tdee - 550),
  ];
}

// ---------------------------------------------------------------------
// Goal progress
// ---------------------------------------------------------------------

/**
 * Progress from a starting weight toward a target, clamped 0-1. Works for
 * both losing and gaining. Counts as fully reached (1) if within 0.05kg of
 * target, or if current has crossed to the target's side of start.
 */
export function goalProgress(current: number, start: number | null, target: number): number {
  const remaining = target - current;
  const reached =
    Math.abs(remaining) < 0.05 ||
    (start != null && ((start > target && current <= target) || (start < target && current >= target)));

  if (start == null || start === target) return reached ? 1 : 0;
  return Math.max(0, Math.min(1, (current - start) / (target - start)));
}
