import Link from "next/link";
import { getCurrentProfile, getCurrentUser } from "@/lib/current-user";
import { todayInTimezone } from "@/lib/date";
import {
  calculateChallenges,
  calculateMaturity,
  calculateNameNumbers,
  calculatePersonalNumbers,
  calculatePinnacles,
  displayNumber,
} from "@/lib/numerology";
import { challengeText, numerologyReading } from "@/lib/numerology-content";
import { Mandala } from "@/app/_components/mandala";
import { SparkleIcon } from "@/app/_components/icons";
import { TabBar } from "@/app/_components/tab-bar";
import { saveNumerologyProfile } from "./actions";

type FocusKey =
  | "day"
  | "month"
  | "year"
  | "lifepath"
  | "birthday"
  | "expression"
  | "soulurge"
  | "personality"
  | "maturity";

const FOCUS_LABELS: Record<FocusKey, string> = {
  day: "Personal day",
  month: "Personal month",
  year: "Personal year",
  lifepath: "Life path",
  birthday: "Birthday number",
  expression: "Expression",
  soulurge: "Soul urge",
  personality: "Personality",
  maturity: "Maturity",
};

function numHref(date: string, focus: FocusKey, edit?: boolean) {
  const params = new URLSearchParams({ date, focus });
  if (edit) params.set("edit", "1");
  return `/numerology?${params.toString()}`;
}

export default async function NumerologyPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; focus?: string; edit?: string; error?: string }>;
}) {
  const { date: dateParam, focus: focusParam, edit, error } = await searchParams;
  const user = await getCurrentUser();
  if (!user) return null;

  const profile = await getCurrentProfile();
  const hasHealthFood = (profile?.interests ?? []).includes("health_food");
  const timezone = profile?.timezone ?? "Asia/Kolkata";

  if (!profile?.birth_date || edit === "1") {
    return (
      <div className="flex flex-1 flex-col items-center px-4 py-10 pb-32">
        <div className="w-full max-w-lg space-y-6 text-center">
          <div className="relative mx-auto aspect-square w-[180px]">
            <Mandala color="#8B6FE0" />
            <div className="absolute inset-0 flex items-center justify-center">
              <SparkleIcon width={54} height={54} className="text-[#8B6FE0]" />
            </div>
          </div>
          <h1 className="font-serif text-4xl tracking-tight text-foreground">Your numbers</h1>
          <p className="mx-auto max-w-[38ch] text-sm text-foreground-muted">
            Numerology reads your birth date and name to describe the themes of each year, month and day. Enter
            yours to begin.
          </p>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <form action={saveNumerologyProfile} className="card space-y-4 text-left">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="birthDate">
                Date of birth
              </label>
              <input
                id="birthDate"
                name="birthDate"
                type="date"
                required
                defaultValue={profile?.birth_date ?? ""}
                max={todayInTimezone(timezone)}
                className="w-full rounded-2xl border border-border bg-white/90 px-3.5 py-2.5 text-[16px] text-foreground outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="fullName">
                Full name, for Expression, Soul urge and Personality (optional)
              </label>
              <input
                id="fullName"
                name="fullName"
                defaultValue={profile?.full_name ?? ""}
                maxLength={80}
                placeholder="As on your birth certificate"
                className="w-full rounded-2xl border border-border bg-white/90 px-3.5 py-2.5 text-[16px] text-foreground outline-none focus:border-accent"
              />
            </div>
            <button
              type="submit"
              className="btn-primary flex min-h-[48px] w-full items-center justify-center px-5 text-[14.5px]"
            >
              Reveal my numbers
            </button>
          </form>
          <p className="text-xs text-foreground-subtle">Stays private to your account.</p>
        </div>

        <TabBar hasHealthFood={hasHealthFood} />
      </div>
    );
  }

  const birthDate = profile.birth_date;
  const date = dateParam ?? todayInTimezone(timezone);
  const focus: FocusKey = (focusParam as FocusKey) ?? "day";

  const nums = calculatePersonalNumbers(birthDate, date);
  const nameNums = calculateNameNumbers(profile.full_name ?? "");
  const maturity = nameNums ? calculateMaturity(nums.lifePath, nameNums.expression) : null;
  const challenges = calculateChallenges(birthDate);
  const pinnacles = calculatePinnacles(birthDate, nums.lifePath);

  const focusValues: Record<FocusKey, number> = {
    day: nums.personalDay,
    month: nums.personalMonth,
    year: nums.personalYear,
    lifepath: nums.lifePath,
    birthday: nums.birthdayNumber,
    expression: nameNums?.expression ?? 0,
    soulurge: nameNums?.soulUrge ?? 0,
    personality: nameNums?.personality ?? 0,
    maturity: maturity ?? 0,
  };

  const karmicDebtByFocus: Partial<Record<FocusKey, number | null>> = {
    lifepath: nums.lifePathKarmicDebt,
    birthday: nums.birthdayKarmicDebt,
    expression: nameNums?.expressionKarmicDebt ?? null,
    soulurge: nameNums?.soulUrgeKarmicDebt ?? null,
    personality: nameNums?.personalityKarmicDebt ?? null,
  };

  const focusedNumber = focusValues[focus];
  const reading = numerologyReading(focusedNumber);
  const karmicDebt = karmicDebtByFocus[focus] ?? null;

  const focusedText =
    focus === "day" ? reading.day : focus === "month" ? reading.month : focus === "year" ? reading.year : reading.lifePath;

  // Month calendar for the selected date.
  const [y, m] = date.split("-").map(Number);
  const lead = (new Date(y, m - 1, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(y, m, 0).getDate();
  const monthLabel = new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const prevMonthDate = new Date(y, m - 2, 1);
  const nextMonthDate = new Date(y, m, 1);
  const pad2 = (n: number) => String(n).padStart(2, "0");
  const monthHref = (d: Date) => numHref(`${d.getFullYear()}-${pad2(d.getMonth() + 1)}-01`, "day");
  const todayStr = todayInTimezone(timezone);

  const coreRows: { key: FocusKey; label: string; description: string }[] = [
    { key: "lifepath", label: "Life path", description: "Your core purpose and lessons" },
    { key: "birthday", label: "Birthday", description: "A talent you carry from birth" },
  ];
  if (nameNums) {
    coreRows.push({ key: "expression", label: "Expression", description: "How you express yourself" });
    if (nameNums.soulUrge) coreRows.push({ key: "soulurge", label: "Soul urge", description: "What your heart desires" });
    if (nameNums.personality) {
      coreRows.push({ key: "personality", label: "Personality", description: "How others first see you" });
    }
    coreRows.push({ key: "maturity", label: "Maturity", description: "Who you grow into, from your mid-30s on" });
  }

  const challengeRows = [
    ["1st", challenges.first],
    ["2nd", challenges.second],
    ["3rd", challenges.third],
    ["4th", challenges.fourth],
  ] as const;

  const pinnacleRows = [
    ["1st", pinnacles.first],
    ["2nd", pinnacles.second],
    ["3rd", pinnacles.third],
    ["4th", pinnacles.fourth],
  ] as const;

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-10 pb-32">
      <div className="w-full max-w-lg space-y-4">
        <section className="text-center">
          <div className="relative mx-auto aspect-square w-[220px]">
            <Mandala color={reading.color} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <b className="font-serif text-6xl italic tracking-tight text-foreground">{displayNumber(focusedNumber)}</b>
              <span className="mt-1 text-xs font-bold text-foreground-muted">{FOCUS_LABELS[focus]}</span>
            </div>
          </div>
          <h2 className="mt-3 font-serif text-4xl tracking-tight text-foreground">{reading.name}</h2>
          <p className="mt-1 text-sm text-foreground-muted">{reading.keyword}</p>
        </section>

        <div className="grid grid-cols-3 gap-2.5">
          {(["day", "month", "year"] as const).map((key) => {
            const val = focusValues[key];
            const r = numerologyReading(val);
            const active = focus === key;
            return (
              <Link
                key={key}
                href={numHref(date, key)}
                className="card flex flex-col items-center gap-1 !p-3.5 text-center"
                style={active ? { boxShadow: `0 0 0 2px ${r.color}` } : undefined}
              >
                <span
                  className="grid h-14 w-14 place-items-center rounded-full font-serif text-2xl italic text-foreground"
                  style={{
                    background: `radial-gradient(circle at 35% 30%, #fff, color-mix(in srgb, ${r.color} 18%, white) 80%)`,
                    boxShadow: `inset 0 0 0 1.5px ${r.color}`,
                  }}
                >
                  {displayNumber(val)}
                </span>
                <span className="text-xs font-bold text-foreground">{FOCUS_LABELS[key]}</span>
                <span className="text-[11px] leading-tight text-foreground-muted">{r.keyword}</span>
              </Link>
            );
          })}
        </div>

        <section className="card">
          <div className="flex items-center gap-3">
            <span
              className="grid h-9 w-9 flex-none place-items-center rounded-2xl bg-white"
              style={{ color: reading.color }}
            >
              <SparkleIcon />
            </span>
            <h3 className="font-serif text-2xl leading-tight text-foreground">
              {FOCUS_LABELS[focus]}, number {displayNumber(focusedNumber)}
            </h3>
          </div>
          <p className="mt-3 font-serif text-xl leading-snug text-foreground">{focusedText}</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="mb-2 text-xs font-bold text-foreground-subtle">Good for</p>
              <div className="flex flex-wrap gap-1.5">
                {reading.good.map((g) => (
                  <span
                    key={g}
                    className="rounded-full px-3 py-1 text-xs font-semibold text-foreground"
                    style={{ background: `color-mix(in srgb, ${reading.color} 18%, white)` }}
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold text-foreground-subtle">Take care with</p>
              <div className="flex flex-wrap gap-1.5">
                {reading.care.map((g) => (
                  <span
                    key={g}
                    className="rounded-full px-3 py-1 text-xs font-semibold text-foreground"
                    style={{ background: `color-mix(in srgb, ${reading.color} 18%, white)` }}
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-4 text-center font-serif text-xl italic text-foreground">&ldquo;{reading.affirmation}&rdquo;</p>
          <div className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-foreground-muted">
            <span className="h-4 w-4 rounded-full" style={{ background: reading.color }} />
            Colour to notice: {reading.colorName}
          </div>

          {karmicDebt && (
            <div
              className="mt-4 rounded-2xl p-3"
              style={{ background: `color-mix(in srgb, ${reading.color} 12%, white)` }}
            >
              <p className="text-xs font-bold" style={{ color: reading.color }}>
                Karmic Debt {karmicDebt}
              </p>
              <p className="mt-1 text-sm leading-snug text-foreground">
                This number carries a Karmic Debt from {karmicDebt} -- a traditional sign to work with this theme
                consciously rather than avoid it, since the lesson tends to resurface until it&rsquo;s met head-on.
              </p>
            </div>
          )}
        </section>

        <section className="card">
          <h3 className="mb-2 font-serif text-2xl leading-tight text-foreground">The world today</h3>
          <p className="mb-4 text-sm text-foreground-muted">
            The shared vibration everyone moves through, whatever their birth date.
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            {(
              [
                ["Universal year", nums.universalYear],
                ["Universal month", nums.universalMonth],
                ["Universal day", nums.universalDay],
              ] as const
            ).map(([label, val]) => {
              const r = numerologyReading(val);
              return (
                <div key={label}>
                  <span
                    className="mx-auto mb-1 grid h-12 w-12 place-items-center rounded-full font-serif text-lg italic text-foreground"
                    style={{
                      background: `radial-gradient(circle at 35% 30%, #fff, color-mix(in srgb, ${r.color} 18%, white) 80%)`,
                      boxShadow: `inset 0 0 0 1.5px ${r.color}`,
                    }}
                  >
                    {displayNumber(val)}
                  </span>
                  <p className="text-xs font-bold text-foreground">{label}</p>
                  <p className="text-[11px] text-foreground-muted">{r.keyword}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="card">
          <div className="mb-3 flex items-center justify-between">
            <Link
              href={monthHref(prevMonthDate)}
              aria-label="Previous month"
              className="grid h-10 w-10 place-items-center rounded-full text-foreground-muted hover:bg-muted"
            >
              &#8249;
            </Link>
            <h3 className="font-serif text-2xl text-foreground">{monthLabel}</h3>
            <Link
              href={monthHref(nextMonthDate)}
              aria-label="Next month"
              className="grid h-10 w-10 place-items-center rounded-full text-foreground-muted hover:bg-muted"
            >
              &#8250;
            </Link>
          </div>
          <p className="mb-3 text-center text-sm text-foreground-muted">
            Your personal day for every date. Tap one to read it.
          </p>
          <div className="grid grid-cols-7 gap-1 text-center">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div key={i} className="text-xs font-bold text-foreground-subtle">
                {d}
              </div>
            ))}
            {Array.from({ length: lead }).map((_, i) => (
              <div key={`blank-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const dStr = `${y}-${pad2(m)}-${pad2(day)}`;
              const dn = calculatePersonalNumbers(birthDate, dStr).personalDay;
              const r = numerologyReading(dn);
              const isToday = dStr === todayStr;
              const isSelected = dStr === date;
              return (
                <Link
                  key={day}
                  href={numHref(dStr, "day")}
                  className="flex flex-col items-center justify-center rounded-2xl py-1.5"
                  style={{
                    background: `color-mix(in srgb, ${r.color} 12%, white)`,
                    boxShadow: isSelected
                      ? `0 0 0 2px ${r.color}`
                      : isToday
                        ? "inset 0 0 0 1.5px var(--color-accent)"
                        : undefined,
                  }}
                >
                  <small className="text-[10px] font-bold text-foreground-subtle">{day}</small>
                  <b className="font-serif text-sm italic text-foreground">{dn}</b>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="card">
          <h3 className="mb-2 font-serif text-2xl leading-tight text-foreground">Your core numbers</h3>
          <div className="divide-y divide-border">
            {coreRows.map(({ key, label, description }) => {
              const val = focusValues[key];
              const r = numerologyReading(val);
              return (
                <Link key={key} href={numHref(date, key)} className="flex items-center gap-3 py-3">
                  <span
                    className="grid h-11 w-11 flex-none place-items-center rounded-full font-serif text-lg italic text-foreground"
                    style={{
                      background: `radial-gradient(circle at 35% 30%, #fff, color-mix(in srgb, ${r.color} 18%, white) 80%)`,
                      boxShadow: `inset 0 0 0 1.5px ${r.color}`,
                    }}
                  >
                    {displayNumber(val)}
                  </span>
                  <span className="flex-1">
                    <span className="block font-medium text-foreground">{label}</span>
                    <span className="block text-xs text-foreground-muted">
                      {description}, {r.name}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
          {!nameNums && (
            <p className="mt-3 text-xs text-foreground-subtle">
              Add your full name to see Expression, Soul urge and Personality.
            </p>
          )}
          {nameNums && nameNums.hiddenPassion.length > 0 && (
            <div className="mt-4 rounded-2xl bg-muted p-3">
              <p className="text-xs font-bold text-foreground-subtle">Hidden Passion</p>
              <p className="mt-1 text-sm leading-snug text-foreground">
                {nameNums.hiddenPassion.map((n) => displayNumber(n)).join(" & ")} &mdash;{" "}
                {nameNums.hiddenPassion.map((n) => numerologyReading(n).keyword.toLowerCase()).join("; ")}. A talent
                you lean on so naturally it can go unnoticed.
              </p>
            </div>
          )}
          <Link
            href={numHref(date, focus, true)}
            className="btn-soft mt-4 inline-flex min-h-[38px] items-center justify-center px-4 text-sm"
          >
            Edit my details
          </Link>
        </section>

        <section className="card">
          <h3 className="mb-1 font-serif text-2xl leading-tight text-foreground">Your challenges</h3>
          <p className="mb-3 text-sm text-foreground-muted">
            The growth edge of each life stage &mdash; not obstacles to fear, but patterns to work through.
          </p>
          <div className="divide-y divide-border">
            {challengeRows.map(([label, value]) => (
              <div key={label} className="flex items-start gap-3 py-3">
                <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-muted font-serif text-lg text-foreground">
                  {value}
                </span>
                <div>
                  <p className="text-xs font-bold text-foreground-subtle">{label} challenge</p>
                  <p className="text-sm leading-snug text-foreground">{challengeText(value)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h3 className="mb-1 font-serif text-2xl leading-tight text-foreground">Your pinnacles</h3>
          <p className="mb-3 text-sm text-foreground-muted">Four major life chapters, each with its own theme.</p>
          <div className="divide-y divide-border">
            {pinnacleRows.map(([label, p]) => {
              const r = numerologyReading(p.number);
              return (
                <div key={label} className="flex items-start gap-3 py-3">
                  <span
                    className="grid h-11 w-11 flex-none place-items-center rounded-full font-serif text-lg italic text-foreground"
                    style={{
                      background: `radial-gradient(circle at 35% 30%, #fff, color-mix(in srgb, ${r.color} 18%, white) 80%)`,
                      boxShadow: `inset 0 0 0 1.5px ${r.color}`,
                    }}
                  >
                    {displayNumber(p.number)}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-foreground-subtle">
                      {label} pinnacle &middot; age {p.fromAge}
                      {p.toAge ? `–${p.toAge}` : "+"}
                    </p>
                    <p className="text-sm leading-snug text-foreground">{r.lifePath}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <Link
          href="/angel-numbers"
          className="btn-soft flex min-h-[44px] w-full items-center justify-center px-5 text-sm"
        >
          Keep seeing repeating numbers? Look them up
        </Link>

        <p className="px-3 text-center text-xs text-foreground-subtle">
          Cycles follow the calendar year. Numerology is a traditional practice offered for reflection and
          inspiration, not a scientific or predictive tool.
        </p>
      </div>

      <TabBar hasHealthFood={hasHealthFood} />
    </div>
  );
}
