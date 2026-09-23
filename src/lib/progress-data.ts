import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/current-user";
import { todayInTimezone } from "@/lib/date";
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
  waterToday: number;
}

/** Profile goals/settings plus the full weight history, for the Progress screen. */
export async function getProgressData(userId: string): Promise<ProgressData> {
  const supabase = await createClient();

  const [p, weightsRes] = await Promise.all([
    // Request-cached -- free here if the calling page already fetched it.
    getCurrentProfile(),
    supabase.from("weights").select("day, kg").eq("user_id", userId).order("day", { ascending: true }),
  ]);
  const weights: WeightEntry[] = weightsRes.data ?? [];

  const day = todayInTimezone(p?.timezone ?? "Asia/Kolkata");
  const { data: log } = await supabase
    .from("daily_logs")
    .select("water_ml")
    .eq("user_id", userId)
    .eq("day", day)
    .maybeSingle();

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
    waterToday: log?.water_ml ?? 0,
  };
}
