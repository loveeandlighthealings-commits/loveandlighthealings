import { createClient } from "@/lib/supabase/server";

export interface MoodCheckin {
  rating: number | null;
  note: string | null;
}

/**
 * Today's mood rating and reflection note, stored on the existing
 * daily_logs.rating/note columns. Deliberately independent of
 * getTodayData() so the check-in shows up for everyone, not just people
 * who opted into the Health & Food section.
 */
export async function getMoodCheckin(userId: string, day: string): Promise<MoodCheckin> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("daily_logs")
    .select("rating, note")
    .eq("user_id", userId)
    .eq("day", day)
    .maybeSingle();

  return { rating: data?.rating ?? null, note: data?.note ?? null };
}
