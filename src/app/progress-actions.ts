"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { todayInTimezone } from "@/lib/date";

async function currentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  return { supabase, user };
}

const numOrEmpty = (min: number, max: number) => z.union([z.literal(""), z.coerce.number().min(min).max(max)]);
const toNullable = (v: number | "" | undefined) => (v === "" || v === undefined ? null : v);

const goalsSchema = z.object({
  heightCm: numOrEmpty(50, 260).optional(),
  startKg: numOrEmpty(20, 400).optional(),
  targetKg: numOrEmpty(20, 400).optional(),
  calGoal: numOrEmpty(500, 6000).optional(),
  waterGoalMl: z.coerce.number().min(0).max(10000),
  stepsGoal: z.coerce.number().min(0).max(100000),
  sleepGoalH: z.coerce.number().min(0).max(24),
  bmiScale: z.enum(["who", "asian"]),
});

export async function updateGoals(formData: FormData) {
  const parsed = goalsSchema.safeParse({
    heightCm: formData.get("heightCm") ?? "",
    startKg: formData.get("startKg") ?? "",
    targetKg: formData.get("targetKg") ?? "",
    calGoal: formData.get("calGoal") ?? "",
    waterGoalMl: formData.get("waterGoalMl"),
    stepsGoal: formData.get("stepsGoal"),
    sleepGoalH: formData.get("sleepGoalH"),
    bmiScale: formData.get("bmiScale"),
  });
  if (!parsed.success) return;

  const { supabase, user } = await currentUser();
  await supabase
    .from("profiles")
    .update({
      height_cm: toNullable(parsed.data.heightCm),
      start_kg: toNullable(parsed.data.startKg),
      target_kg: toNullable(parsed.data.targetKg),
      cal_goal: toNullable(parsed.data.calGoal),
      water_goal_ml: parsed.data.waterGoalMl,
      steps_goal: parsed.data.stepsGoal,
      sleep_goal_h: parsed.data.sleepGoalH,
      bmi_scale: parsed.data.bmiScale,
    })
    .eq("user_id", user.id);

  revalidatePath("/progress");
}

const calorieInputsSchema = z.object({
  age: numOrEmpty(10, 100).optional(),
  sex: z.enum(["f", "m", ""]).optional(),
  activity: z.enum(["sedentary", "light", "moderate", "active"]),
});

export async function updateCalorieInputs(formData: FormData) {
  const parsed = calorieInputsSchema.safeParse({
    age: formData.get("age") ?? "",
    sex: formData.get("sex") ?? "",
    activity: formData.get("activity"),
  });
  if (!parsed.success) return;

  const { supabase, user } = await currentUser();
  await supabase
    .from("profiles")
    .update({
      age: parsed.data.age === "" || parsed.data.age === undefined ? null : parsed.data.age,
      sex: parsed.data.sex === "" || parsed.data.sex === undefined ? null : parsed.data.sex,
      activity: parsed.data.activity,
    })
    .eq("user_id", user.id);

  revalidatePath("/progress");
}

const useCalorieSchema = z.object({ kcal: z.coerce.number().min(500).max(6000) });

export async function useCalorieSuggestion(formData: FormData) {
  const parsed = useCalorieSchema.safeParse({ kcal: formData.get("kcal") });
  if (!parsed.success) return;

  const { supabase, user } = await currentUser();
  await supabase.from("profiles").update({ cal_goal: parsed.data.kcal }).eq("user_id", user.id);
  revalidatePath("/progress");
}

const addWeightSchema = z.object({
  kg: z.coerce.number().min(20).max(400),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function addWeightEntry(formData: FormData) {
  const { supabase, user } = await currentUser();
  const { data: profile } = await supabase.from("profiles").select("timezone").eq("user_id", user.id).single();
  const defaultDay = todayInTimezone(profile?.timezone ?? "Asia/Kolkata");

  const parsed = addWeightSchema.safeParse({
    kg: formData.get("kg"),
    date: formData.get("date") || undefined,
  });
  if (!parsed.success) return;

  await supabase
    .from("weights")
    .upsert(
      { user_id: user.id, day: parsed.data.date ?? defaultDay, kg: parsed.data.kg, source: "manual" },
      { onConflict: "user_id,day" }
    );

  revalidatePath("/progress");
}

const deleteWeightSchema = z.object({ day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) });

export async function deleteWeightEntry(formData: FormData) {
  const parsed = deleteWeightSchema.safeParse({ day: formData.get("day") });
  if (!parsed.success) return;

  const { supabase, user } = await currentUser();
  await supabase.from("weights").delete().eq("user_id", user.id).eq("day", parsed.data.day);
  revalidatePath("/progress");
}
