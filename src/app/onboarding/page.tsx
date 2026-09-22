import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { INTERESTS } from "@/lib/interests";
import { saveInterests } from "./actions";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("interests")
    .eq("user_id", user.id)
    .single();

  const selected = new Set(profile?.interests ?? []);
  const isEditing = selected.size > 0;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="card w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="font-serif text-4xl tracking-tight text-foreground">
            {isEditing ? "Edit what you see" : "What would you like to see?"}
          </h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Pick as many as you like. Your dashboard will only show these — you
            can change your mind anytime.
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <form action={saveInterests} className="space-y-3">
          {INTERESTS.map((interest) => (
            <label
              key={interest.key}
              className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-white/85 p-4 transition-colors hover:bg-white has-[:checked]:border-accent has-[:checked]:bg-accent-soft/60"
            >
              <input
                type="checkbox"
                name="interests"
                value={interest.key}
                defaultChecked={selected.has(interest.key)}
                className="mt-1 h-5 w-5 flex-none accent-accent"
              />
              <span>
                <span className="block font-medium text-foreground">
                  {interest.label}
                </span>
                <span className="block text-sm text-foreground-muted">
                  {interest.description}
                </span>
              </span>
            </label>
          ))}

          <button
            type="submit"
            className="btn-primary flex min-h-[48px] w-full items-center justify-center px-5 text-[14.5px]"
          >
            {isEditing ? "Save changes" : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
