import { createClient } from "@/lib/supabase/server";
import { todayInTimezone, weekdayIndex } from "@/lib/date";
import { dayScore, dayVerdict, foodPct, sleepHours, type DayVerdict, type ScoreComponent } from "@/lib/formulas";

/**
 * NOTE: this file queries Supabase without generated Database types (see
 * src/lib/supabase/server.ts), so query results are implicitly `any`. This
 * is a known gap against CLAUDE.md's "no any" rule -- worth a follow-up PR
 * to generate/hand-write proper types once the schema settles down more.
 */

export interface TodayData {
  day: string;
  waterGoalMl: number;
  stepsGoal: number;
  sleepGoalH: number;
  calGoal: number | null;
  water: number;
  steps: number;
  bedTime: string | null;
  wakeTime: string | null;
  sleptHours: number | null;
  weightKg: number | null;
  previousWeight: { kg: number; day: string } | null;
  score: number;
  verdict: DayVerdict;
}

/** Everything the Today screen needs for one user's current day, plus their day score. */
export async function getTodayData(userId: string, timezone: string): Promise<TodayData> {
  const supabase = await createClient();
  const day = todayInTimezone(timezone);
  const weekday = weekdayIndex(day);

  const [
    profileRes,
    dailyLogRes,
    weightRes,
    previousWeightRes,
    routineItemsRes,
    workoutLinksRes,
    mealPlanRes,
    foodEntriesRes,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("water_goal_ml, steps_goal, sleep_goal_h, cal_goal")
      .eq("user_id", userId)
      .single(),
    supabase
      .from("daily_logs")
      .select("water_ml, steps, bed_time, wake_time, routine_done, links_done, meals_done")
      .eq("user_id", userId)
      .eq("day", day)
      .maybeSingle(),
    supabase.from("weights").select("kg").eq("user_id", userId).eq("day", day).maybeSingle(),
    supabase
      .from("weights")
      .select("kg, day")
      .eq("user_id", userId)
      .lt("day", day)
      .order("day", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("routine_items").select("id").eq("user_id", userId),
    supabase.from("workout_links").select("id").eq("user_id", userId),
    supabase.from("meal_plan").select("slot, text").eq("user_id", userId).eq("weekday", weekday),
    supabase.from("food_entries").select("kcal, qty").eq("user_id", userId).eq("day", day),
  ]);

  const profile = profileRes.data ?? {
    water_goal_ml: 2500,
    steps_goal: 8000,
    sleep_goal_h: 8,
    cal_goal: null,
  };
  const log = dailyLogRes.data;
  const water = log?.water_ml ?? 0;
  const steps = log?.steps ?? 0;
  const sleptHours = sleepHours(log?.bed_time ?? null, log?.wake_time ?? null);

  const totalKcal = (foodEntriesRes.data ?? []).reduce(
    (sum: number, e: { qty: number; kcal: number | null }) => sum + (e.qty ?? 1) * (e.kcal ?? 0),
    0
  );

  const routineIds = (routineItemsRes.data ?? []).map((r: { id: string }) => r.id);
  const routineDone = (log?.routine_done ?? {}) as Record<string, boolean>;
  const routineDoneCount = routineIds.filter((id: string) => routineDone[id]).length;

  const workoutIds = (workoutLinksRes.data ?? []).map((w: { id: string }) => w.id);
  const linksDone = (log?.links_done ?? {}) as Record<string, boolean>;
  const workoutDoneCount = workoutIds.filter((id: string) => linksDone[id]).length;

  const plannedMeals = (mealPlanRes.data ?? []).filter(
    (m: { text: string | null }) => m.text && m.text.trim().length > 0
  );
  const mealsDone = (log?.meals_done ?? {}) as Record<string, boolean>;
  const mealsDoneCount = plannedMeals.filter((m: { slot: string }) => mealsDone[m.slot]).length;

  const components: Record<string, ScoreComponent> = {
    water: { pct: profile.water_goal_ml ? water / profile.water_goal_ml : null },
    steps: { pct: profile.steps_goal ? steps / profile.steps_goal : null },
    sleep: {
      pct: profile.sleep_goal_h && sleptHours != null ? sleptHours / profile.sleep_goal_h : null,
    },
    food: {
      pct: profile.cal_goal
        ? foodPct(totalKcal, profile.cal_goal)
        : plannedMeals.length
          ? mealsDoneCount / plannedMeals.length
          : null,
    },
    routine: { pct: routineIds.length ? routineDoneCount / routineIds.length : null },
    workout: { pct: workoutIds.length ? workoutDoneCount / workoutIds.length : null },
  };

  const score = dayScore(components);
  const hasActivity =
    water > 0 ||
    steps > 0 ||
    sleptHours != null ||
    totalKcal > 0 ||
    routineDoneCount > 0 ||
    workoutDoneCount > 0 ||
    weightRes.data != null ||
    mealsDoneCount > 0;

  return {
    day,
    waterGoalMl: profile.water_goal_ml,
    stepsGoal: profile.steps_goal,
    sleepGoalH: profile.sleep_goal_h,
    calGoal: profile.cal_goal,
    water,
    steps,
    bedTime: log?.bed_time ?? null,
    wakeTime: log?.wake_time ?? null,
    sleptHours,
    weightKg: weightRes.data?.kg ?? null,
    previousWeight: previousWeightRes.data
      ? { kg: previousWeightRes.data.kg, day: previousWeightRes.data.day }
      : null,
    score,
    verdict: dayVerdict(score, components, hasActivity),
  };
}
