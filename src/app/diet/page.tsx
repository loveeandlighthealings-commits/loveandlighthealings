import { redirect } from "next/navigation";
import { getCurrentProfile, getCurrentUser } from "@/lib/current-user";
import { DIET_TIERS } from "@/lib/diet";
import { TabBar } from "@/app/_components/tab-bar";
import { setDiet } from "./actions";

export default async function DietPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirectTo?: string }>;
}) {
  const { error, redirectTo } = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getCurrentProfile();
  const current = profile?.diet ?? null;
  const hasNumerology = (profile?.interests ?? []).includes("numerology_daily");

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 pb-32">
      <div className="card w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="font-serif text-4xl tracking-tight text-foreground">What do you eat?</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            This filters the recipes we show you. You can change it anytime.
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <form action={setDiet} className="space-y-3">
          <input type="hidden" name="redirectTo" value={redirectTo ?? "/food"} />
          {DIET_TIERS.map((tier) => (
            <label
              key={tier.key}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-white/85 p-4 transition-colors hover:bg-white has-[:checked]:border-accent has-[:checked]:bg-accent-soft/40"
            >
              <span className="flex-1">
                <span className="block font-medium text-foreground">{tier.label}</span>
                <span className="block text-sm text-foreground-muted">{tier.description}</span>
              </span>
              <input
                type="radio"
                name="diet"
                value={tier.key}
                defaultChecked={current === tier.key}
                className="h-5 w-5 flex-none accent-accent"
              />
            </label>
          ))}

          <button
            type="submit"
            className="btn-primary flex min-h-[48px] w-full items-center justify-center px-5 text-[14.5px]"
          >
            Save
          </button>
        </form>
      </div>

      <TabBar hasHealthFood hasNumerology={hasNumerology} />
    </div>
  );
}
