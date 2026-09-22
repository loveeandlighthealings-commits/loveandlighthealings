import type { ComponentType, SVGProps } from "react";

/**
 * A colored medallion for a page or section heading, using the same
 * radial-gradient-on-white treatment the numerology screen's number
 * badges use (see src/app/numerology/page.tsx) -- reused here so
 * settings-style screens (onboarding, diet, appearance, more, progress)
 * share the same colorful, layered look as the dashboard and numerology
 * screens instead of sitting behind a plain heading.
 */
export function PageIcon({
  icon: Icon,
  color,
  size = 64,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  color: string;
  size?: number;
}) {
  return (
    <span
      className="mx-auto grid flex-none place-items-center rounded-[28%]"
      style={{
        width: size,
        height: size,
        color,
        background: `radial-gradient(circle at 35% 30%, #fff, color-mix(in srgb, ${color} 20%, white) 80%)`,
        boxShadow: `inset 0 0 0 1.5px ${color}`,
      }}
    >
      <Icon width={size * 0.42} height={size * 0.42} />
    </span>
  );
}

/** The smaller icon badge used beside a card's section heading. */
export function SectionIcon({
  icon: Icon,
  color,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  color: string;
}) {
  return (
    <span className="grid h-9 w-9 flex-none place-items-center rounded-2xl bg-white" style={{ color }}>
      <Icon width={18} height={18} />
    </span>
  );
}
