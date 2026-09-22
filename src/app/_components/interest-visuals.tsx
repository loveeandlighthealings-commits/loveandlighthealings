import type { InterestIconKey, InterestTheme } from "@/lib/interests";
import { BoltIcon, BookIcon, FlameIcon, MoonIcon, SparkleIcon, StarIcon, SunIcon } from "./icons";

const ICONS: Record<InterestIconKey, typeof FlameIcon> = {
  flame: FlameIcon,
  moon: MoonIcon,
  star: StarIcon,
  sparkle: SparkleIcon,
  bolt: BoltIcon,
  sun: SunIcon,
  book: BookIcon,
};

const THEME_VARS: Record<InterestTheme, { color: string; soft: string }> = {
  calories: { color: "var(--color-calories)", soft: "var(--color-calories-soft)" },
  sleep: { color: "var(--color-sleep)", soft: "var(--color-sleep-soft)" },
  weight: { color: "var(--color-weight)", soft: "var(--color-weight-soft)" },
  accent: { color: "var(--color-accent)", soft: "var(--color-accent-soft)" },
  workout: { color: "var(--color-workout)", soft: "var(--color-workout-soft)" },
  routine: { color: "var(--color-routine)", soft: "var(--color-routine-soft)" },
  water: { color: "var(--color-water)", soft: "var(--color-water-soft)" },
};

export function interestThemeVars(theme: InterestTheme) {
  return THEME_VARS[theme];
}

export function InterestIcon({ theme, icon }: { theme: InterestTheme; icon: InterestIconKey }) {
  const Icon = ICONS[icon];
  const vars = THEME_VARS[theme];
  return (
    <span
      className="grid h-10 w-10 flex-none place-items-center rounded-2xl bg-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.9)]"
      style={{ color: vars.color }}
    >
      <Icon width={20} height={20} />
    </span>
  );
}
