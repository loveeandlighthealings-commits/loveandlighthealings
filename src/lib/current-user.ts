import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { ActivityLevel, BmiScale, Sex } from "@/lib/formulas";
import type { DietKey } from "@/lib/diet";

/**
 * The full `profiles` row. Hand-written since queries run without generated
 * Supabase types (see supabase/server.ts) -- a known gap, tracked in
 * getCurrentProfile()'s docs below.
 */
export interface Profile {
  user_id: string;
  full_name: string | null;
  display_name: string | null;
  birth_date: string | null;
  height_cm: number | null;
  start_kg: number | null;
  target_kg: number | null;
  cal_goal: number | null;
  water_goal_ml: number;
  steps_goal: number;
  sleep_goal_h: number;
  bmi_scale: BmiScale;
  age: number | null;
  sex: Sex | null;
  activity: ActivityLevel;
  timezone: string;
  calorie_tracking: boolean;
  interests: string[];
  theme: string;
  diet: DietKey | null;
}

/**
 * The signed-in user, verified against Supabase's auth server.
 *
 * Wrapped in React's `cache()` so that within a single request, every
 * Server Component that calls this (the root layout, the page, and any
 * data-loading helper underneath it) shares one result instead of each
 * making its own network round trip to Supabase to verify the session --
 * this used to be the single biggest cause of slow page loads, since a
 * page could easily trigger 3-4 of these calls before it finished
 * rendering. Middleware (src/lib/supabase/middleware.ts) runs in a
 * separate execution context and can't share this cache, so it still does
 * its own check -- that one remaining call is expected and necessary.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * The signed-in user's full profile row, fetched once and cached the same
 * way as getCurrentUser(). Most pages only need a couple of columns, but
 * fetching every column in one query and letting callers pick what they
 * need is far cheaper than each page, plus its own data-loading helpers,
 * running its own narrow SELECT against the same row.
 *
 * NOTE: this queries Supabase without generated TypeScript types (see
 * src/lib/supabase/server.ts), so the cast below is a known, deliberate
 * gap against CLAUDE.md's "no any" rule -- worth a follow-up once the
 * schema settles down enough to generate real types.
 */
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
  return (data as Profile | null) ?? null;
});
