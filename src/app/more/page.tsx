import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { getCurrentProfile, getCurrentUser } from "@/lib/current-user";
import { TabBar } from "@/app/_components/tab-bar";
import { ChevronRightIcon, CompassIcon, LeafIcon, PaletteIcon } from "@/app/_components/icons";
import { signOut } from "@/app/actions";

export default async function MorePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const profile = await getCurrentProfile();
  const interestKeys: string[] = profile?.interests ?? [];
  const hasHealthFood = interestKeys.includes("health_food");
  const hasNumerology = interestKeys.includes("numerology_daily");

  const rows: {
    href: string;
    label: string;
    description: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    color: string;
    soft: string;
  }[] = [
    {
      href: "/onboarding",
      label: "Edit what you see",
      description: "Choose your dashboard sections",
      icon: CompassIcon,
      color: "var(--color-accent)",
      soft: "var(--color-accent-soft)",
    },
  ];
  if (hasHealthFood) {
    rows.push({
      href: "/diet",
      label: "Diet preference",
      description: "What you eat, for recipe filtering",
      icon: LeafIcon,
      color: "var(--color-calories)",
      soft: "var(--color-calories-soft)",
    });
  }
  rows.push({
    href: "/appearance",
    label: "Choose your look",
    description: "Default, Sunset, 7 Chakras, Forest",
    icon: PaletteIcon,
    color: "var(--color-weight)",
    soft: "var(--color-weight-soft)",
  });

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-10 pb-32">
      <div className="w-full max-w-lg space-y-4">
        <h1 className="text-center font-serif text-[32px] leading-none tracking-tight text-foreground">More</h1>

        <section className="card divide-y divide-border">
          {rows.map((row) => (
            <Link key={row.href} href={row.href} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
              <span
                className="grid h-10 w-10 flex-none place-items-center rounded-2xl"
                style={{ background: row.soft, color: row.color }}
              >
                <row.icon width={19} height={19} />
              </span>
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

      <TabBar hasHealthFood={hasHealthFood} hasNumerology={hasNumerology} />
    </div>
  );
}
