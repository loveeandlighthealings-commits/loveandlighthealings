import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { INTERESTS } from "@/lib/interests";
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
    .select("full_name, interests")
    .eq("user_id", user.id)
    .single();

  const displayName = profile?.full_name || user.email;
  const selected = INTERESTS.filter((i) =>
    (profile?.interests ?? []).includes(i.key)
  );

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-16">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">
            Welcome, {displayName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your dashboard is built around what you chose.
          </p>
        </div>

        <div className="space-y-3">
          {selected.map((interest) => (
            <div
              key={interest.key}
              className="rounded-lg border border-border bg-white p-4"
            >
              <p className="font-medium text-foreground">{interest.label}</p>
              <p className="text-sm text-muted-foreground">
                {interest.description}
              </p>
              <p className="mt-2 text-xs font-medium text-accent">
                Coming soon
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-3 pt-2">
          <Link
            href="/onboarding"
            className="text-sm font-medium text-accent hover:underline"
          >
            Edit what you see
          </Link>

          <form action={signOut}>
            <button
              type="submit"
              className="rounded-full border border-border bg-white px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
