import { createClient } from "@/lib/supabase/server";
import { allowedDietTiers, type DietKey } from "@/lib/diet";

export type Slot = "b" | "l" | "s" | "d";

export interface FoodEntry {
  id: string;
  name: string;
  serving: string | null;
  qty: number;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface SlotLog {
  slot: Slot;
  entries: FoodEntry[];
  kcal: number;
}

export interface FoodLog {
  day: string;
  calGoal: number | null;
  totalKcal: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  slots: Record<Slot, SlotLog>;
}

const SLOTS: Slot[] = ["b", "l", "s", "d"];

/** Today's logged food, grouped by meal slot, with running totals against the calorie goal. */
export async function getFoodLog(userId: string, day: string): Promise<FoodLog> {
  const supabase = await createClient();
  const [profileRes, entriesRes] = await Promise.all([
    supabase.from("profiles").select("cal_goal").eq("user_id", userId).single(),
    supabase
      .from("food_entries")
      .select("id, slot, name, serving, qty, kcal, protein_g, carbs_g, fat_g")
      .eq("user_id", userId)
      .eq("day", day)
      .order("created_at", { ascending: true }),
  ]);

  const slots = Object.fromEntries(SLOTS.map((s) => [s, { slot: s, entries: [], kcal: 0 } as SlotLog])) as Record<
    Slot,
    SlotLog
  >;

  let totalKcal = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  for (const row of entriesRes.data ?? []) {
    const qty = row.qty ?? 1;
    const kcal = qty * (row.kcal ?? 0);
    const protein = qty * (row.protein_g ?? 0);
    const carbs = qty * (row.carbs_g ?? 0);
    const fat = qty * (row.fat_g ?? 0);

    const entry: FoodEntry = { id: row.id, name: row.name, serving: row.serving, qty, kcal, proteinG: protein, carbsG: carbs, fatG: fat };
    const slot = slots[row.slot as Slot];
    if (slot) {
      slot.entries.push(entry);
      slot.kcal += kcal;
    }
    totalKcal += kcal;
    totalProtein += protein;
    totalCarbs += carbs;
    totalFat += fat;
  }

  return {
    day,
    calGoal: profileRes.data?.cal_goal ?? null,
    totalKcal,
    totalProtein,
    totalCarbs,
    totalFat,
    slots,
  };
}

export interface SearchableFood {
  /** "food:<id>" for the global library, "custom:<id>" for a user's own food. */
  id: string;
  name: string;
  cuisine: string | null;
  diet: string | null;
  serving: string | null;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  ingredients: string | null;
  method: string | null;
  isCustom: boolean;
}

export interface SearchFoodsOptions {
  query?: string;
  /** "all", "mine", or an exact cuisine name. */
  cuisine?: string;
  userDiet: DietKey | null;
}

export async function searchFoods(userId: string, options: SearchFoodsOptions): Promise<SearchableFood[]> {
  const supabase = await createClient();
  // Strip characters that would break PostgREST's .or() filter syntax.
  const safeQuery = (options.query ?? "").trim().replace(/[,()]/g, "");

  if (options.cuisine === "mine") {
    let query = supabase
      .from("user_foods")
      .select("id, name, serving, kcal, protein_g, carbs_g, fat_g")
      .eq("user_id", userId);
    if (safeQuery) query = query.ilike("name", `%${safeQuery}%`);
    const { data } = await query.order("name");

    return (data ?? []).map((f) => ({
      id: `custom:${f.id}`,
      name: f.name,
      cuisine: "Mine",
      diet: null,
      serving: f.serving,
      kcal: f.kcal ?? 0,
      proteinG: f.protein_g ?? 0,
      carbsG: f.carbs_g ?? 0,
      fatG: f.fat_g ?? 0,
      ingredients: null,
      method: null,
      isCustom: true,
    }));
  }

  const allowed = allowedDietTiers(options.userDiet);
  let query = supabase
    .from("foods")
    .select("id, name, cuisine, diet, serving, kcal, protein_g, carbs_g, fat_g, ingredients, method")
    .in("diet", allowed);
  if (options.cuisine && options.cuisine !== "all") query = query.eq("cuisine", options.cuisine);
  if (safeQuery) query = query.or(`name.ilike.%${safeQuery}%,ingredients.ilike.%${safeQuery}%`);
  const { data } = await query.order("name").limit(60);

  return (data ?? []).map((f) => ({
    id: `food:${f.id}`,
    name: f.name,
    cuisine: f.cuisine,
    diet: f.diet,
    serving: f.serving,
    kcal: f.kcal ?? 0,
    proteinG: f.protein_g ?? 0,
    carbsG: f.carbs_g ?? 0,
    fatG: f.fat_g ?? 0,
    ingredients: f.ingredients,
    method: f.method,
    isCustom: false,
  }));
}
