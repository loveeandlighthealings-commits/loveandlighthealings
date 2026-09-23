import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Where Google (and, later, any other OAuth provider) sends people back
 * after they approve sign-in. Exchanges the one-time code Supabase issued
 * for a real session, then sends them on into the app -- middleware takes
 * it from there (onboarding for a first-time sign-in, the dashboard
 * otherwise).
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  return NextResponse.redirect(new URL("/login?error=Could not sign in with Google", request.url));
}
