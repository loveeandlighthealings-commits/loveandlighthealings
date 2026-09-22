"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const startSchema = z.object({ hours: z.coerce.number().min(1).max(72) });

export async function startFast(formData: FormData) {
  const parsed = startSchema.safeParse({ hours: formData.get("hours") });
  if (!parsed.success) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // The database's partial unique index (one active fast per user) is the
  // real guard; this insert simply fails harmlessly if one is already running.
  await supabase.from("fasting_sessions").insert({ user_id: user.id, planned_hours: parsed.data.hours });
  revalidatePath("/");
}

const endSchema = z.object({ id: z.string().uuid(), broken: z.enum(["true", "false"]) });

export async function endFast(formData: FormData) {
  const parsed = endSchema.safeParse({
    id: formData.get("id"),
    broken: formData.get("broken") ?? "false",
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("fasting_sessions")
    .update({ ended_at: new Date().toISOString(), broken: parsed.data.broken === "true" })
    .eq("id", parsed.data.id)
    .eq("user_id", user.id);
  revalidatePath("/");
}
