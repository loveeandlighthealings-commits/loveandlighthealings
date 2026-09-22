import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { searchFoods } from "@/lib/food-data";
import { logFood } from "@/app/food-actions";
import { TabBar } from "@/app/_components/tab-bar";

const SLOT_LABELS: Record<string, string> = { b: "Breakfast", l: "Lunch", s: "Snack", d: "Dinner" };
const CUISINES = ["all", "mine", "Indian", "Italian", "Mexican", "Asian", "Mediterranean", "Western", "Basics"];

function cuisineHref(slot: string, cuisine: string, q: string) {
  const params = new URLSearchParams({ slot, cuisine });
  if (q) params.set("q", q);
  return `/food/add?${params.toString()}`;
}

export default async function AddFoodPage({
  searchParams,
}: {
  searchParams: Promise<{ slot?: string; q?: string; cuisine?: string }>;
}) {
  const { slot = "l", q = "", cuisine = "all" } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("diet").eq("user_id", user.id).single();
  const results = await searchFoods(user.id, { query: q, cuisine, userDiet: profile?.diet ?? null });

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-10 pb-32">
      <div className="w-full max-w-lg space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-[28px] leading-none tracking-tight text-foreground">
            Add to {SLOT_LABELS[slot] ?? "meal"}
          </h1>
          <Link href="/food" className="text-sm font-medium text-accent-dark hover:underline">
            Done
          </Link>
        </div>

        <form method="get" className="card">
          <input type="hidden" name="slot" value={slot} />
          <input type="hidden" name="cuisine" value={cuisine} />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search dishes or ingredients"
            aria-label="Search foods"
            className="w-full rounded-2xl border border-border bg-white/90 px-3.5 py-2.5 text-[16px] text-foreground outline-none focus:border-accent"
          />
        </form>

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {CUISINES.map((c) => (
            <Link
              key={c}
              href={cuisineHref(slot, c, q)}
              className={`min-h-[36px] flex-none rounded-full border px-3.5 py-1.5 text-sm font-bold ${
                cuisine === c
                  ? "border-transparent bg-accent text-accent-foreground"
                  : "border-border bg-white text-foreground-muted"
              }`}
            >
              {c === "all" ? "All" : c === "mine" ? "My foods" : c}
            </Link>
          ))}
        </div>

        <div className="card">
          {results.length === 0 && (
            <p className="text-sm text-foreground-muted">No match. Try a different search, or add your own below.</p>
          )}
          <div className="divide-y divide-border">
            {results.map((f) => (
              <div key={f.id} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{f.name}</p>
                  <p className="text-xs text-foreground-subtle">
                    {f.serving ?? "1 serving"}
                    {f.cuisine ? `, ${f.cuisine}` : ""}
                  </p>
                </div>
                <div className="flex-none text-right text-xs font-semibold text-foreground-muted">
                  <span className="font-serif text-lg text-foreground">{Math.round(f.kcal)}</span> kcal
                </div>
                <form action={logFood}>
                  <input type="hidden" name="foodId" value={f.id} />
                  <input type="hidden" name="slot" value={slot} />
                  <input type="hidden" name="qty" value={1} />
                  <button type="submit" className="btn-soft min-h-[36px] px-3.5 text-sm">
                    Add
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>

        <Link
          href={`/food/custom?slot=${slot}`}
          className="btn-soft flex min-h-[44px] items-center justify-center px-5 text-sm"
        >
          + Add your own food
        </Link>
      </div>

      <TabBar hasHealthFood />
    </div>
  );
}
