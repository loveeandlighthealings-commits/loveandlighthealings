import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { INTERESTS } from "@/lib/interests";
import { getTodayData } from "@/lib/today";
import { HeroOrb } from "./_components/hero-orb";
import { InterestIcon, interestThemeVars } from "./_components/interest-visuals";
import { TrackerTiles } from "./_components/tracker-tiles";
import { signOut } from "./actions";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware already redirects signed-out visitors to /login, but keep
  // this as a safe fallback in case this page is ever reached directly.
  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, interests, timezone")
    .eq("user_id", user.id)
    .single();

  const displayName = profile?.full_name || user.email;
  const interestKeys: string[] = profile?.interests ?? [];
  const hasHealthFood = interestKeys.includes("health_food");
  const otherSelected = INTERESTS.filter((i) => i.key !== "health_food" && interestKeys.includes(i.key));

  const today = hasHealthFood ? await getTodayData(user.id, profile?.timezone ?? "Asia/Kolkata") : null;

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-10">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex items-end justify-between px-1.5 pb-2 pt-3">
          <h1 className="font-serif text-[32px] leading-none tracking-tight text-foreground">
            Welcome, {displayName}
          </h1>
        </div>

        {today && (
          <section className="text-center">
            <HeroOrb score={today.score} />
            <h2 className="mt-2 font-serif text-4xl leading-tight tracking-tight text-foreground">
              {today.verdict.headline}
            </h2>
            <p className="mx-auto mt-2 max-w-[38ch] text-sm text-foreground-muted">{today.verdict.subtext}</p>
            <div className="mt-6 text-left">
              <TrackerTiles data={today} />
            </div>
          </section>
        )}

        <div className="space-y-3">
          {otherSelected.map((interest) => {
            const vars = interestThemeVars(interest.theme);
            return (
              <div
                key={interest.key}
                className="card overflow-hidden"
                style={{ background: `linear-gradient(160deg, ${vars.soft} 0%, rgba(255,255,255,0) 60%)` }}
              >
                <div className="flex items-start gap-3">
                  <InterestIcon theme={interest.theme} icon={interest.icon} />
                  <div>
                    <p className="font-serif text-2xl leading-tight text-foreground">{interest.label}</p>
                    <p className="mt-1 text-sm text-foreground-muted">{interest.description}</p>
                  </div>
                </div>
                <p
                  className="mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ background: vars.soft, color: vars.color }}
                >
                  Coming soon
                </p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col items-center gap-3 pt-2">
          <div className="flex items-center gap-4">
            <Link href="/onboarding" className="text-sm font-medium text-accent-dark hover:underline">
              Edit what you see
            </Link>
            <Link href="/appearance" className="text-sm font-medium text-accent-dark hover:underline">
              Choose your look
            </Link>
          </div>

          <form action={signOut}>
            <button type="submit" className="btn-ghost flex min-h-[44px] items-center justify-center px-5 text-sm">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
