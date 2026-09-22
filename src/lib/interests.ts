import { z } from "zod";

/** Reuses the existing metric color pairs (see globals.css) for each category's identity. */
export type InterestTheme = "calories" | "sleep" | "weight" | "accent" | "workout" | "routine" | "water";
export type InterestIconKey = "flame" | "moon" | "star" | "sparkle" | "bolt" | "sun" | "book";

/**
 * The dashboard sections a person can opt into. This is the single
 * source of truth: the onboarding form, the dashboard renderer, and the
 * database's CHECK constraint (supabase/migrations/..._add_profile_interests.sql)
 * must all agree with this list.
 */
export const INTERESTS = [
  {
    key: "health_food",
    label: "Health, Food & Easy Recipes",
    description: "Water, steps, sleep, weight and a food and calorie log.",
    theme: "calories",
    icon: "flame",
  },
  {
    key: "meditation",
    label: "Meditation",
    description: "Guided sessions and simple daily practices.",
    theme: "sleep",
    icon: "moon",
  },
  {
    key: "angel_numbers",
    label: "Angel Numbers",
    description: "Meanings behind repeating numbers you notice.",
    theme: "weight",
    icon: "star",
  },
  {
    key: "numerology_daily",
    label: "Numerology for the Day",
    description: "Your personal day, month and year numbers.",
    theme: "accent",
    icon: "sparkle",
  },
  {
    key: "eft_tapping",
    label: "EFT Tapping",
    description: "Emotional Freedom Technique sequences and guides.",
    theme: "workout",
    icon: "bolt",
  },
  {
    key: "affirmations",
    label: "Affirmations",
    description: "Short, positive statements to start your day.",
    theme: "routine",
    icon: "sun",
  },
  {
    key: "spiritual_insights",
    label: "Other Spiritual Knowledge & Insights",
    description: "Articles and reflections beyond the categories above.",
    theme: "water",
    icon: "book",
  },
] as const satisfies ReadonlyArray<{
  key: string;
  label: string;
  description: string;
  theme: InterestTheme;
  icon: InterestIconKey;
}>;

export type InterestKey = (typeof INTERESTS)[number]["key"];

const INTEREST_KEYS = INTERESTS.map((i) => i.key) as [InterestKey, ...InterestKey[]];

/** Validates a submitted list of interest keys (e.g. from a form). */
export const interestsSchema = z
  .array(z.enum(INTEREST_KEYS))
  .max(INTERESTS.length)
  .transform((arr) => Array.from(new Set(arr)));

export function interestLabel(key: string): string {
  return INTERESTS.find((i) => i.key === key)?.label ?? key;
}
