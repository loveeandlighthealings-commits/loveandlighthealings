"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { todayInTimezone } from "@/lib/date";

async function currentUserAndDay() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("user_id", user.id)
    .single();

  const day = todayInTimezone(profile?.timezone ?? "Asia/Kolkata");
  return { supabase, user, day };
}

const slotSchema = z.enum(["b", "l", "s", "d"]);

const logSchema = z.object({
  foodId: z.string().min(1),
  slot: slotSchema,
  qty: z.coerce.number().min(0.5).max(20),
});

export async function logFood(formData: FormData) {
  const parsed = logSchema.safeParse({
    foodId: formData.get("foodId"),
    slot: formData.get("slot"),
    qty: formData.get("qty") ?? 1,
  });
  if (!parsed.success) return;

  const { supabase, user, day } = await currentUserAndDay();
  const [kind, id] = parsed.data.foodId.split(":");
  if (!kind || !id) return;

  type Source = {
    name: string;
    serving: string | null;
    kcal: number | null;
    protein_g: number | null;
    carbs_g: number | null;
    fat_g: number | null;
  };
  let source: Source | null = null;

  if (kind === "food") {
    const parsedId = Number(id);
    if (!Number.isInteger(parsedId)) return;
    const { data } = await supabase
      .from("foods")
      .select("name, serving, kcal, protein_g, carbs_g, fat_g")
      .eq("id", parsedId)
      .single();
    source = data;
  } else if (kind === "custom") {
    const { data } = await supabase
      .from("user_foods")
      .select("name, serving, kcal, protein_g, carbs_g, fat_g")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    source = data;
  }
  if (!source) return;

  await supabase.from("food_entries").insert({
    user_id: user.id,
    day,
    slot: parsed.data.slot,
    name: source.name,
    serving: source.serving,
    qty: parsed.data.qty,
    kcal: source.kcal,
    protein_g: source.protein_g,
    carbs_g: source.carbs_g,
    fat_g: source.fat_g,
  });

  redirect("/food");
}

const adjustSchema = z.object({ entryId: z.string().uuid(), delta: z.coerce.number().min(-5).max(5) });

export async function adjustEntryQty(formData: FormData) {
  const parsed = adjustSchema.safeParse({ entryId: formData.get("entryId"), delta: formData.get("delta") });
  if (!parsed.success) return;

  const { supabase, user } = await currentUserAndDay();
  const { data: existing } = await supabase
    .from("food_entries")
    .select("qty")
    .eq("id", parsed.data.entryId)
    .eq("user_id", user.id)
    .single();
  if (!existing) return;

  const next = Math.min(20, Math.max(0.5, Math.round((existing.qty + parsed.data.delta) * 2) / 2));
  await supabase.from("food_entries").update({ qty: next }).eq("id", parsed.data.entryId).eq("user_id", user.id);
  revalidatePath("/food");
}

const deleteSchema = z.object({ entryId: z.string().uuid() });

export async function deleteEntry(formData: FormData) {
  const parsed = deleteSchema.safeParse({ entryId: formData.get("entryId") });
  if (!parsed.success) return;

  const { supabase, user } = await currentUserAndDay();
  await supabase.from("food_entries").delete().eq("id", parsed.data.entryId).eq("user_id", user.id);
  revalidatePath("/food");
}

const customFoodSchema = z.object({
  name: z.string().trim().min(1).max(80),
  serving: z.string().trim().max(60).optional(),
  kcal: z.coerce.number().min(0).max(5000),
  protein: z.coerce.number().min(0).max(500).optional(),
  carbs: z.coerce.number().min(0).max(500).optional(),
  fat: z.coerce.number().min(0).max(500).optional(),
  slot: slotSchema.optional(),
});

export async function saveCustomFood(formData: FormData) {
  const parsed = customFoodSchema.safeParse({
    name: formData.get("name"),
    serving: formData.get("serving") || undefined,
    kcal: formData.get("kcal"),
    protein: formData.get("protein") || 0,
    carbs: formData.get("carbs") || 0,
    fat: formData.get("fat") || 0,
    slot: formData.get("slot") || undefined,
  });
  if (!parsed.success) return;

  const { supabase, user, day } = await currentUserAndDay();
  const serving = parsed.data.serving ?? "1 serving";

  const { data: inserted, error } = await supabase
    .from("user_foods")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      serving,
      kcal: parsed.data.kcal,
      protein_g: parsed.data.protein ?? 0,
      carbs_g: parsed.data.carbs ?? 0,
      fat_g: parsed.data.fat ?? 0,
    })
    .select("id")
    .single();

  if (error || !inserted) return;

  if (parsed.data.slot) {
    await supabase.from("food_entries").insert({
      user_id: user.id,
      day,
      slot: parsed.data.slot,
      name: parsed.data.name,
      serving,
      qty: 1,
      kcal: parsed.data.kcal,
      protein_g: parsed.data.protein ?? 0,
      carbs_g: parsed.data.carbs ?? 0,
      fat_g: parsed.data.fat ?? 0,
    });
  }

  redirect("/food");
}
