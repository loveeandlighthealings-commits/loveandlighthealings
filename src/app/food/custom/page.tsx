import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { saveCustomFood } from "@/app/food-actions";
import { TabBar } from "@/app/_components/tab-bar";

const fieldClass =
  "w-full rounded-2xl border border-border bg-white/90 px-3.5 py-2.5 text-[16px] text-foreground outline-none focus:border-accent";

export default async function CustomFoodPage({
  searchParams,
}: {
  searchParams: Promise<{ slot?: string }>;
}) {
  const { slot } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hasNumerology = false;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("interests").eq("user_id", user.id).single();
    hasNumerology = (profile?.interests ?? []).includes("numerology_daily");
  }

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-10 pb-32">
      <div className="w-full max-w-lg space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-[28px] leading-none tracking-tight text-foreground">Add your own food</h1>
          <Link href="/food" className="text-sm font-medium text-accent-dark hover:underline">
            Cancel
          </Link>
        </div>

        <form action={saveCustomFood} className="card space-y-4">
          {slot && <input type="hidden" name="slot" value={slot} />}

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="name">
              Name
            </label>
            <input id="name" name="name" required maxLength={80} placeholder="e.g. Mom's dal khichdi" className={fieldClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="serving">
                Serving size
              </label>
              <input id="serving" name="serving" maxLength={60} placeholder="e.g. 1 bowl" className={fieldClass} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="kcal">
                Calories per serving
              </label>
              <input id="kcal" name="kcal" type="number" inputMode="decimal" min={0} required placeholder="kcal" className={fieldClass} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="protein">
                Protein (g)
              </label>
              <input id="protein" name="protein" type="number" inputMode="decimal" min={0} step={0.1} className={fieldClass} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="carbs">
                Carbs (g)
              </label>
              <input id="carbs" name="carbs" type="number" inputMode="decimal" min={0} step={0.1} className={fieldClass} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="fat">
                Fat (g)
              </label>
              <input id="fat" name="fat" type="number" inputMode="decimal" min={0} step={0.1} className={fieldClass} />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary flex min-h-[48px] w-full items-center justify-center px-5 text-[14.5px]"
          >
            {slot ? "Save and add to log" : "Save food"}
          </button>
        </form>
      </div>

      <TabBar hasHealthFood hasNumerology={hasNumerology} />
    </div>
  );
}
