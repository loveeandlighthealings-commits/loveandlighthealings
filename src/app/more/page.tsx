import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TabBar } from "@/app/_components/tab-bar";
import { ChevronRightIcon } from "@/app/_components/icons";
import { signOut } from "@/app/actions";

export default async function MorePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("interests").eq("user_id", user.id).single();
  const hasHealthFood = (profile?.interests ?? []).includes("health_food");

  const rows: { href: string; label: string; description: string }[] = [
    { href: "/onboarding", label: "Edit what you see", description: "Choose your dashboard sections" },
  ];
  if (hasHealthFood) {
    rows.push({ href: "/diet", label: "Diet preference", description: "What you eat, for recipe filtering" });
  }
  rows.push({ href: "/appearance", label: "Choose your look", description: "Default, Sunset, 7 Chakras, Forest" });

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-10 pb-32">
      <div className="w-full max-w-lg space-y-4">
        <h1 className="text-center font-serif text-[32px] leading-none tracking-tight text-foreground">More</h1>

        <section className="card divide-y divide-border">
          {rows.map((row) => (
            <Link key={row.href} href={row.href} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
              <div className="flex-1">
                <p className="font-medium text-foreground">{row.label}</p>
                <p className="text-sm text-foreground-muted">{row.description}</p>
              </div>
              <ChevronRightIcon className="flex-none text-foreground-subtle" />
            </Link>
          ))}
        </section>

        <form action={signOut}>
          <button type="submit" className="btn-ghost flex min-h-[44px] w-full items-center justify-center px-5 text-sm">
            Sign out
          </button>
        </form>
      </div>

      <TabBar hasHealthFood={hasHealthFood} />
    </div>
  );
}
