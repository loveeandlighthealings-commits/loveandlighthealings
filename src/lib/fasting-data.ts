import { createClient } from "@/lib/supabase/server";

export interface ActiveFast {
  id: string;
  startedAt: string;
  plannedHours: number;
}

/** The user's currently running fast, if any (a fast can span past midnight, so this isn't tied to "today"). */
export async function getActiveFast(userId: string): Promise<ActiveFast | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("fasting_sessions")
    .select("id, started_at, planned_hours")
    .eq("user_id", userId)
    .is("ended_at", null)
    .maybeSingle();

  if (!data) return null;
  return { id: data.id, startedAt: data.started_at, plannedHours: data.planned_hours };
}
