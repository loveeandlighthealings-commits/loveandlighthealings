import { getCurrentProfile, getCurrentUser } from "@/lib/current-user";
import { ANGEL_NUMBERS, findAngelNumber } from "@/lib/angel-numbers";
import { StarIcon } from "@/app/_components/icons";
import { TabBar } from "@/app/_components/tab-bar";

export default async function AngelNumbersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const user = await getCurrentUser();
  if (!user) return null;

  const profile = await getCurrentProfile();
  const interestKeys: string[] = profile?.interests ?? [];
  const hasHealthFood = interestKeys.includes("health_food");
  const hasNumerology = interestKeys.includes("numerology_daily");

  const match = q ? findAngelNumber(q) : null;

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-10 pb-32">
      <div className="w-full max-w-lg space-y-4">
        <div className="text-center">
          <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-weight-soft text-weight">
            <StarIcon width={22} height={22} />
          </span>
          <h1 className="font-serif text-4xl tracking-tight text-foreground">Angel Numbers</h1>
          <p className="mx-auto mt-1 max-w-[38ch] text-sm text-foreground-muted">
            Keep seeing the same numbers? Look up what they&rsquo;re traditionally said to mean.
          </p>
        </div>

        <form method="get" className="card">
          <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="q">
            What number do you keep noticing?
          </label>
          <input
            id="q"
            name="q"
            defaultValue={q ?? ""}
            placeholder="e.g. 1111, 444, 777"
            className="w-full rounded-2xl border border-border bg-white/90 px-3.5 py-2.5 text-[16px] text-foreground outline-none focus:border-accent"
          />
        </form>

        {q && (
          <section className="card" style={{ background: "var(--color-weight-soft)" }}>
            {match ? (
              <>
                <p className="font-serif text-3xl text-foreground">{match.sequence}</p>
                <p className="mt-0.5 text-sm font-bold text-foreground-muted">{match.title}</p>
                <p className="mt-2 text-sm leading-snug text-foreground">{match.meaning}</p>
              </>
            ) : (
              <p className="text-sm text-foreground-muted">
                No exact match for &ldquo;{q}&rdquo; yet. Try one of the common sequences below, or a repeating
                pattern like 222 or 1111.
              </p>
            )}
          </section>
        )}

        <section className="card">
          <h3 className="mb-3 font-serif text-2xl leading-tight text-foreground">Common sequences</h3>
          <div className="divide-y divide-border">
            {ANGEL_NUMBERS.map((a) => (
              <div key={a.sequence} className="flex items-start gap-3 py-3">
                <span className="grid h-11 w-16 flex-none place-items-center rounded-2xl bg-weight-soft font-serif text-lg text-foreground">
                  {a.sequence}
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground">{a.title}</p>
                  <p className="text-sm leading-snug text-foreground-muted">{a.meaning}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <p className="px-3 text-center text-xs text-foreground-subtle">
          Angel numbers are a popular folk practice offered here for reflection and inspiration, not a scientific or
          predictive tool.
        </p>
      </div>

      <TabBar hasHealthFood={hasHealthFood} hasNumerology={hasNumerology} />
    </div>
  );
}
