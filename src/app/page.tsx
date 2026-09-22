import { createClient } from "@/lib/supabase/server";
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
    .select("full_name")
    .eq("id", user.id)
    .single();

  const displayName = profile?.full_name || user.email;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Welcome, {displayName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your wellness dashboard is on its way.
          </p>
        </div>

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
  );
}
