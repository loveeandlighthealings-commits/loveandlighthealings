import { z } from "zod";

/**
 * Diet tiers, strictest to least strict. Someone on tier X can eat
 * anything tagged X or stricter (see foods.diet in the schema). No dish
 * in this app's library uses beef.
 */
export const DIET_TIERS = [
  { key: "vegan", label: "Vegan", description: "No animal products at all." },
  { key: "vegetarian", label: "Vegetarian", description: "Dairy is fine, no eggs, meat or fish." },
  { key: "eggetarian", label: "Eggetarian", description: "Dairy and eggs, no meat or fish." },
  { key: "pescatarian", label: "Pescatarian", description: "Dairy, eggs and fish, no meat." },
  { key: "non_vegetarian", label: "Non-vegetarian", description: "Everything except beef." },
] as const;

export type DietKey = (typeof DIET_TIERS)[number]["key"];

const DIET_KEYS = DIET_TIERS.map((t) => t.key) as [DietKey, ...DietKey[]];
export const dietSchema = z.enum(DIET_KEYS);

const TIER_ORDER: Record<DietKey, number> = Object.fromEntries(
  DIET_TIERS.map((t, i) => [t.key, i])
) as Record<DietKey, number>;

/** Every diet tier a person on `diet` can eat (their own tier and stricter). */
export function allowedDietTiers(diet: DietKey | null): DietKey[] {
  if (!diet) return DIET_TIERS.map((t) => t.key);
  const maxOrder = TIER_ORDER[diet];
  return DIET_TIERS.filter((t) => TIER_ORDER[t.key] <= maxOrder).map((t) => t.key);
}

export function dietLabel(key: string): string {
  return DIET_TIERS.find((t) => t.key === key)?.label ?? key;
}
