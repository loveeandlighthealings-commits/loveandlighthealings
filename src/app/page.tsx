import Link from "next/link";
import { getCurrentProfile, getCurrentUser } from "@/lib/current-user";
import { INTERESTS } from "@/lib/interests";
import { getActiveFast } from "@/lib/fasting-data";
import { getTodayData } from "@/lib/today";
import { FastingTimer } from "./_components/fasting-timer";
import { HeroOrb } from "./_components/hero-orb";
import { InterestIcon, interestThemeVars } from "./_components/interest-visuals";
import { TabBar } from "./_components/tab-bar";
import { TrackerTiles } from "./_components/tracker-tiles";

/** Interest categories that have a real screen built, and where it lives. */
const BUILT_INTEREST_ROUTES: Partial<Record<string, string>> = {
  numerology_daily: "/numerology",
  angel_numbers: "/angel-numbers",
};

export default async function Home() {
  const user = await getCurrentUser();

  // Middleware already redirects signed-out visitors to /login, but keep
  // this as a safe fallback in case this page is ever reached directly.
  if (!user) {
    return null;
  }

  const profile = await getCurrentProfile();
  const displayName = profile?.full_name || user.email;
  const interestKeys: string[] = profile?.interests ?? [];
  const hasHealthFood = interestKeys.includes("health_food");
  const hasNumerology = interestKeys.includes("numerology_daily");
  const otherSelected = INTERESTS.filter((i) => i.key !== "health_food" && interestKeys.includes(i.key));

  const today = hasHealthFood ? await getTodayData(user.id, profile?.timezone ?? "Asia/Kolkata") : null;
  const activeFast = hasHealthFood ? await getActiveFast(user.id) : null;

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-10 pb-32">
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
            <div className="mt-6 space-y-3 text-left">
              <TrackerTiles data={today} />
              <FastingTimer active={activeFast} />
              <div className="flex gap-2">
                <Link
                  href="/food"
                  className="btn-soft flex min-h-[44px] flex-1 items-center justify-center px-5 text-sm"
                >
                  Log food &amp; browse recipes
                </Link>
                <Link
                  href="/progress"
                  className="btn-soft flex min-h-[44px] flex-1 items-center justify-center px-5 text-sm"
                >
                  Progress &amp; BMI
                </Link>
              </div>
            </div>
          </section>
        )}

        <div className="space-y-3">
          {otherSelected.map((interest) => {
            const vars = interestThemeVars(interest.theme);
            const href = BUILT_INTEREST_ROUTES[interest.key];
            const content = (
              <>
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
                  {href ? "Open" : "Coming soon"}
                </p>
              </>
            );
            const className = "card block overflow-hidden";
            const style = { background: `linear-gradient(160deg, ${vars.soft} 0%, rgba(255,255,255,0) 60%)` };

            return href ? (
              <Link key={interest.key} href={href} className={className} style={style}>
                {content}
              </Link>
            ) : (
              <div key={interest.key} className={className} style={style}>
                {content}
              </div>
            );
          })}
        </div>
      </div>

      <TabBar hasHealthFood={hasHealthFood} hasNumerology={hasNumerology} />
    </div>
  );
}
