"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { todayInTimezone } from "@/lib/date";

/** Every tracker action needs the signed-in user and their local "today". */
async function currentUserAndDay() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not signed in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("user_id", user.id)
    .single();

  const day = todayInTimezone(profile?.timezone ?? "Asia/Kolkata");
  return { supabase, user, day };
}

const waterSchema = z.object({ waterMl: z.coerce.number().int().min(0).max(20000) });

export async function setWater(formData: FormData) {
  const parsed = waterSchema.safeParse({ waterMl: formData.get("waterMl") });
  if (!parsed.success) return;

  const { supabase, user, day } = await currentUserAndDay();
  await supabase
    .from("daily_logs")
    .upsert({ user_id: user.id, day, water_ml: parsed.data.waterMl }, { onConflict: "user_id,day" });
  revalidatePath("/");
  revalidatePath("/progress");
}

const waterDeltaSchema = z.object({ delta: z.coerce.number().int().min(-5000).max(5000) });

export async function addWater(formData: FormData) {
  const parsed = waterDeltaSchema.safeParse({ delta: formData.get("delta") });
  if (!parsed.success) return;

  const { supabase, user, day } = await currentUserAndDay();
  const { data: existing } = await supabase
    .from("daily_logs")
    .select("water_ml")
    .eq("user_id", user.id)
    .eq("day", day)
    .maybeSingle();

  const next = Math.max(0, (existing?.water_ml ?? 0) + parsed.data.delta);
  await supabase
    .from("daily_logs")
    .upsert({ user_id: user.id, day, water_ml: next }, { onConflict: "user_id,day" });
  revalidatePath("/");
  revalidatePath("/progress");
}

const stepsSchema = z.object({ steps: z.coerce.number().int().min(0).max(200000) });

export async function setSteps(formData: FormData) {
  const parsed = stepsSchema.safeParse({ steps: formData.get("steps") });
  if (!parsed.success) return;

  const { supabase, user, day } = await currentUserAndDay();
  await supabase
    .from("daily_logs")
    .upsert({ user_id: user.id, day, steps: parsed.data.steps }, { onConflict: "user_id,day" });
  revalidatePath("/");
}

const stepsDeltaSchema = z.object({ delta: z.coerce.number().int().min(-50000).max(50000) });

export async function addSteps(formData: FormData) {
  const parsed = stepsDeltaSchema.safeParse({ delta: formData.get("delta") });
  if (!parsed.success) return;

  const { supabase, user, day } = await currentUserAndDay();
  const { data: existing } = await supabase
    .from("daily_logs")
    .select("steps")
    .eq("user_id", user.id)
    .eq("day", day)
    .maybeSingle();

  const next = Math.max(0, (existing?.steps ?? 0) + parsed.data.delta);
  await supabase
    .from("daily_logs")
    .upsert({ user_id: user.id, day, steps: next }, { onConflict: "user_id,day" });
  revalidatePath("/");
}

const timeValue = z
  .string()
  .regex(/^\d{2}:\d{2}$/)
  .or(z.literal(""));

const sleepSchema = z.object({ bedTime: timeValue, wakeTime: timeValue });

export async function setSleep(formData: FormData) {
  const parsed = sleepSchema.safeParse({
    bedTime: formData.get("bedTime") ?? "",
    wakeTime: formData.get("wakeTime") ?? "",
  });
  if (!parsed.success) return;

  const { supabase, user, day } = await currentUserAndDay();
  await supabase.from("daily_logs").upsert(
    {
      user_id: user.id,
      day,
      bed_time: parsed.data.bedTime || null,
      wake_time: parsed.data.wakeTime || null,
    },
    { onConflict: "user_id,day" }
  );
  revalidatePath("/");
}

const weightSchema = z.object({ kg: z.coerce.number().min(20).max(400) });

export async function setWeight(formData: FormData) {
  const raw = formData.get("kg");

  if (raw == null || raw === "") {
    // Clearing the field removes today's entry, matching the prototype.
    const { supabase, user, day } = await currentUserAndDay();
    await supabase.from("weights").delete().eq("user_id", user.id).eq("day", day);
    revalidatePath("/");
    return;
  }

  const parsed = weightSchema.safeParse({ kg: raw });
  if (!parsed.success) return;

  const { supabase, user, day } = await currentUserAndDay();
  await supabase
    .from("weights")
    .upsert(
      { user_id: user.id, day, kg: parsed.data.kg, source: "manual" },
      { onConflict: "user_id,day" }
    );
  revalidatePath("/");
}
