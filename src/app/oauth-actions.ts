"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Starts the Google OAuth flow: Supabase hands back a Google consent-
 * screen URL, and we redirect the browser there. Google then sends the
 * person to /auth/callback with a one-time code, which is exchanged for
 * a session.
 */
export async function loginWithGoogle() {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });

  if (error || !data?.url) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? "Could not start Google sign-in")}`);
  }

  redirect(data.url);
}
