import { z } from "zod";

/**
 * The six meal slots tasks/food get logged against, in day order. Single
 * source of truth: the database's CHECK constraints on food_entries.slot
 * and meal_plan.slot must agree with these keys.
 */
export const MEAL_SLOTS = [
  { key: "morning_detox", label: "Morning Detox" },
  { key: "breakfast", label: "Breakfast" },
  { key: "mid_morning_snack", label: "Mid Morning Snack" },
  { key: "lunch", label: "Lunch" },
  { key: "evening_snack", label: "Evening Snack" },
  { key: "dinner", label: "Dinner" },
] as const;

export type MealSlot = (typeof MEAL_SLOTS)[number]["key"];

const SLOT_KEYS = MEAL_SLOTS.map((s) => s.key) as [MealSlot, ...MealSlot[]];
export const mealSlotSchema = z.enum(SLOT_KEYS);

export function mealSlotLabel(key: string): string {
  return MEAL_SLOTS.find((s) => s.key === key)?.label ?? key;
}
