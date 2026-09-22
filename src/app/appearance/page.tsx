import { redirect } from "next/navigation";
import { getCurrentProfile, getCurrentUser } from "@/lib/current-user";
import { THEMES } from "@/lib/themes";
import { TabBar } from "@/app/_components/tab-bar";
import { setTheme } from "./actions";

export default async function AppearancePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getCurrentProfile();
  const current = profile?.theme ?? "default";
  const hasHealthFood = (profile?.interests ?? []).includes("health_food");
  const hasNumerology = (profile?.interests ?? []).includes("numerology_daily");

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 pb-32">
      <div className="card w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="font-serif text-4xl tracking-tight text-foreground">Choose your look</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Pick the mood that feels right. You can change this anytime.
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <form action={setTheme} className="space-y-3">
          {THEMES.map((theme) => (
            <label
              key={theme.key}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-white/85 p-4 transition-colors hover:bg-white has-[:checked]:border-accent has-[:checked]:bg-accent-soft/40"
            >
              <span className="flex h-10 w-16 flex-none overflow-hidden rounded-xl shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
                {theme.preview.map((color, i) => (
                  <span key={i} className="flex-1" style={{ background: color }} />
                ))}
              </span>
              <span className="flex-1">
                <span className="block font-medium text-foreground">{theme.label}</span>
                <span className="block text-sm text-foreground-muted">{theme.description}</span>
              </span>
              <input
                type="radio"
                name="theme"
                value={theme.key}
                defaultChecked={current === theme.key}
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

      <TabBar hasHealthFood={hasHealthFood} hasNumerology={hasNumerology} />
    </div>
  );
}
