import { createClient } from "@/lib/supabase/server";
import type { ActivityLevel, BmiScale, Sex } from "@/lib/formulas";

export interface ProgressProfile {
  heightCm: number | null;
  startKg: number | null;
  targetKg: number | null;
  calGoal: number | null;
  waterGoalMl: number;
  stepsGoal: number;
  sleepGoalH: number;
  bmiScale: BmiScale;
  age: number | null;
  sex: Sex | null;
  activity: ActivityLevel;
}

export interface WeightEntry {
  day: string;
  kg: number;
}

export interface ProgressData {
  profile: ProgressProfile;
  weights: WeightEntry[];
  currentWeight: number | null;
}

/** Profile goals/settings plus the full weight history, for the Progress screen. */
export async function getProgressData(userId: string): Promise<ProgressData> {
  const supabase = await createClient();

  const [profileRes, weightsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("height_cm, start_kg, target_kg, cal_goal, water_goal_ml, steps_goal, sleep_goal_h, bmi_scale, age, sex, activity")
      .eq("user_id", userId)
      .single(),
    supabase.from("weights").select("day, kg").eq("user_id", userId).order("day", { ascending: true }),
  ]);

  const p = profileRes.data;
  const weights: WeightEntry[] = weightsRes.data ?? [];

  return {
    profile: {
      heightCm: p?.height_cm ?? null,
      startKg: p?.start_kg ?? null,
      targetKg: p?.target_kg ?? null,
      calGoal: p?.cal_goal ?? null,
      waterGoalMl: p?.water_goal_ml ?? 2500,
      stepsGoal: p?.steps_goal ?? 8000,
      sleepGoalH: p?.sleep_goal_h ?? 8,
      bmiScale: (p?.bmi_scale as BmiScale) ?? "who",
      age: p?.age ?? null,
      sex: (p?.sex as Sex | null) ?? null,
      activity: (p?.activity as ActivityLevel) ?? "light",
    },
    weights,
    currentWeight: weights.length ? weights[weights.length - 1].kg : null,
  };
}
