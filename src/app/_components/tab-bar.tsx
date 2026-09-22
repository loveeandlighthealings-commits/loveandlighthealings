"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { FlameIcon, MoreIcon, SparkleIcon, SunIcon } from "./icons";

interface Tab {
  href: string;
  label: string;
  icon: ReactNode;
}

/**
 * A floating pill tab bar, fixed to the bottom of the screen, ported in
 * spirit from reference/prototype.html's nav.tabs. The active tab expands
 * into a labelled pill; inactive tabs show only their icon.
 */
export function TabBar({ hasHealthFood }: { hasHealthFood: boolean }) {
  const pathname = usePathname();

  const tabs: Tab[] = [{ href: "/", label: "Today", icon: <SunIcon width={20} height={20} /> }];
  if (hasHealthFood) {
    tabs.push({ href: "/food", label: "Food", icon: <FlameIcon width={20} height={20} /> });
    tabs.push({ href: "/progress", label: "Progress", icon: <SparkleIcon width={20} height={20} /> });
  }
  tabs.push({ href: "/more", label: "More", icon: <MoreIcon width={20} height={20} /> });

  return (
    <nav
      aria-label="Sections"
      className="fixed inset-x-3 z-20 mx-auto max-w-[420px]"
      style={{ bottom: "calc(10px + env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="flex gap-0.5 rounded-[34px] bg-white/86 p-1.5 shadow-[0_18px_38px_-12px_rgba(70,50,150,0.46)] backdrop-blur-2xl">
        {tabs.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`flex h-[50px] flex-1 items-center justify-center gap-1.5 rounded-[28px] text-[13px] font-bold transition-[flex-grow] ${
                active ? "flex-[2.4] bg-accent-soft text-accent-dark" : "text-foreground-subtle"
              }`}
            >
              {tab.icon}
              {active && <span>{tab.label}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
