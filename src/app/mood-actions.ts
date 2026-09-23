"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { todayInTimezone } from "@/lib/date";

/** Every mood/reflection action needs the signed-in user and their local "today". */
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

const moodSchema = z.object({ rating: z.coerce.number().int().min(1).max(5) });

export async function setMood(formData: FormData) {
  const parsed = moodSchema.safeParse({ rating: formData.get("rating") });
  if (!parsed.success) return;

  const { supabase, user, day } = await currentUserAndDay();
  await supabase
    .from("daily_logs")
    .upsert({ user_id: user.id, day, rating: parsed.data.rating }, { onConflict: "user_id,day" });
  revalidatePath("/");
}

const reflectionSchema = z.object({ note: z.string().trim().max(500) });

export async function saveReflection(formData: FormData) {
  const parsed = reflectionSchema.safeParse({ note: formData.get("note") ?? "" });
  if (!parsed.success) return;

  const { supabase, user, day } = await currentUserAndDay();
  await supabase
    .from("daily_logs")
    .upsert({ user_id: user.id, day, note: parsed.data.note || null }, { onConflict: "user_id,day" });
  revalidatePath("/");
}
