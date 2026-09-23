import Link from "next/link";
import { getCurrentProfile, getCurrentUser } from "@/lib/current-user";
import { todayInTimezone } from "@/lib/date";
import { getFoodLog } from "@/lib/food-data";
import { MEAL_SLOTS } from "@/lib/meal-slots";
import { adjustEntryQty, deleteEntry } from "@/app/food-actions";
import { TabBar } from "@/app/_components/tab-bar";

export default async function FoodPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const profile = await getCurrentProfile();
  const hasNumerology = (profile?.interests ?? []).includes("numerology_daily");
  const day = todayInTimezone(profile?.timezone ?? "Asia/Kolkata");
  const log = await getFoodLog(user.id, day);
  const kcalLeft = log.calGoal != null ? log.calGoal - log.totalKcal : null;
  const pct = log.calGoal ? Math.min(100, Math.round((log.totalKcal / log.calGoal) * 100)) : null;

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-10 pb-32">
      <div className="w-full max-w-lg space-y-4">
        <div className="text-center">
          <h1 className="font-serif text-[32px] leading-none tracking-tight text-foreground">Food</h1>
          {!profile?.diet && (
            <p className="mt-2 text-sm text-foreground-muted">
              <Link href="/diet" className="font-medium text-accent-dark hover:underline">
                Tell us what you eat
              </Link>{" "}
              to see recipes that fit.
            </p>
          )}
        </div>

        <section className="card">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="font-serif text-[52px] leading-none tracking-tight text-foreground">
                {Math.round(log.totalKcal).toLocaleString("en-IN")}
              </div>
              <small className="mt-1 block text-xs font-semibold text-foreground-muted">
                calories eaten{log.calGoal ? ` of ${log.calGoal.toLocaleString("en-IN")}` : ""}
              </small>
            </div>
            {kcalLeft != null && (
              <div className="text-right">
                <div
                  className="font-serif text-2xl"
                  style={{ color: kcalLeft < 0 ? "var(--color-danger)" : "var(--color-foreground)" }}
                >
                  {Math.abs(Math.round(kcalLeft)).toLocaleString("en-IN")}
                </div>
                <small className="text-xs font-semibold text-foreground-muted">
                  {kcalLeft < 0 ? "over goal" : "left today"}
                </small>
              </div>
            )}
          </div>

          {pct != null ? (
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-calories-soft">
              <div className="progress-fill h-full rounded-full bg-calories" style={{ width: `${pct}%` }} />
            </div>
          ) : (
            <p className="mt-2 text-xs text-foreground-subtle">
              Set a calorie goal on your Progress page to see how much is left today.
            </p>
          )}

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-water-soft p-2.5">
              <small className="block text-xs font-bold text-foreground-muted">Protein</small>
              <b className="font-serif text-xl text-foreground">{Math.round(log.totalProtein)} g</b>
            </div>
            <div className="rounded-2xl bg-calories-soft p-2.5">
              <small className="block text-xs font-bold text-foreground-muted">Carbs</small>
              <b className="font-serif text-xl text-foreground">{Math.round(log.totalCarbs)} g</b>
            </div>
            <div className="rounded-2xl bg-weight-soft p-2.5">
              <small className="block text-xs font-bold text-foreground-muted">Fat</small>
              <b className="font-serif text-xl text-foreground">{Math.round(log.totalFat)} g</b>
            </div>
          </div>
        </section>

        {MEAL_SLOTS.map(({ key: slot, label }) => {
          const s = log.slots[slot];
          return (
            <section key={slot} className="card">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-serif text-2xl leading-tight text-foreground">{label}</h3>
                {s.kcal > 0 && (
                  <div className="font-serif text-xl text-foreground">
                    {Math.round(s.kcal)}{" "}
                    <small className="font-sans text-xs font-semibold text-foreground-muted">kcal</small>
                  </div>
                )}
              </div>

              <div className="mt-1 divide-y divide-border">
                {s.entries.length === 0 && (
                  <p className="py-2 text-sm text-foreground-muted">Nothing logged yet.</p>
                )}
                {s.entries.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-2 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">{entry.name}</p>
                      <p className="text-xs text-foreground-subtle">
                        {entry.qty} × {entry.serving ?? "serving"}, {Math.round(entry.kcal)} kcal
                      </p>
                    </div>
                    <div className="flex flex-none items-center gap-1 rounded-full bg-muted p-1">
                      <form action={adjustEntryQty}>
                        <input type="hidden" name="entryId" value={entry.id} />
                        <input type="hidden" name="delta" value={-0.5} />
                        <button
                          type="submit"
                          className="grid h-7 w-7 place-items-center rounded-full bg-white text-foreground"
                          aria-label="Fewer servings"
                        >
                          &minus;
                        </button>
                      </form>
                      <span className="w-6 text-center text-sm font-bold tabular-nums">{entry.qty}</span>
                      <form action={adjustEntryQty}>
                        <input type="hidden" name="entryId" value={entry.id} />
                        <input type="hidden" name="delta" value={0.5} />
                        <button
                          type="submit"
                          className="grid h-7 w-7 place-items-center rounded-full bg-white text-foreground"
                          aria-label="More servings"
                        >
                          +
                        </button>
                      </form>
                    </div>
                    <form action={deleteEntry}>
                      <input type="hidden" name="entryId" value={entry.id} />
                      <button type="submit" className="flex-none p-1 text-foreground-subtle" aria-label="Remove">
                        &#10005;
                      </button>
                    </form>
                  </div>
                ))}
              </div>

              <Link
                href={`/food/add?slot=${slot}`}
                className="btn-soft mt-3 inline-flex min-h-[38px] items-center justify-center px-4 text-sm"
              >
                + Add food
              </Link>
            </section>
          );
        })}
      </div>

      <TabBar hasHealthFood hasNumerology={hasNumerology} />
    </div>
  );
}
