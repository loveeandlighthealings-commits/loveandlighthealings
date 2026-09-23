import type { SVGProps } from "react";

/** Small line icons, paths ported from reference/prototype.html's icon set. */
function Icon({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function DropIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M12 3s6.2 6.6 6.2 11.2A6.2 6.2 0 0 1 5.8 14.2C5.8 9.6 12 3 12 3z" />
    </Icon>
  );
}

export function PulseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M3 12h4l2.5-6 4 12 2.5-6H21" />
    </Icon>
  );
}

export function MoonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M20 14.6A8.2 8.2 0 0 1 9.4 4a8.2 8.2 0 1 0 10.6 10.6z" />
    </Icon>
  );
}

export function ScaleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="4" width="17" height="16" rx="4" />
      <path d="M8.5 9.5a3.5 3.5 0 0 1 7 0M12 9.5l1.6-2" />
    </Icon>
  );
}

export function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon width="14" height="14" {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

export function MinusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon width="14" height="14" {...props}>
      <path d="M5 12h14" />
    </Icon>
  );
}

export function FlameIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.2 2-4.2.2 1.2.9 2 1.8 2.2C10.5 8.2 11 5.5 12 3z" />
    </Icon>
  );
}

export function SunIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M4.6 4.6L6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4" />
    </Icon>
  );
}

export function BoltIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M13 2.5L4.5 14H11l-1 7.5L19.5 10H13z" />
    </Icon>
  );
}

export function SparkleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M11 3.5l1.9 5.6 5.6 1.9-5.6 1.9L11 18.5l-1.9-5.6L3.5 11l5.6-1.9z" />
      <path d="M19 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
    </Icon>
  );
}

export function BookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5zM4 5.5v16M8.5 8h7" />
    </Icon>
  );
}

export function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" />
    </Icon>
  );
}

export function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon width="18" height="18" {...props}>
      <path d="M9.5 5.5L16 12l-6.5 6.5" />
    </Icon>
  );
}

export function MoreIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <rect x="4" y="4" width="6.5" height="6.5" rx="2" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="2" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="2" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2" />
    </Icon>
  );
}

export function LeafIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M20 4C10 4 4 10 4 18v2h2c8 0 14-6 14-14V4z" />
      <path d="M6 20c2-4.5 6-8 12-10" />
    </Icon>
  );
}

export function EggIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M12 3c4 4.5 6 8.6 6 11.5a6 6 0 1 1-12 0C6 11.6 8 7.5 12 3z" />
    </Icon>
  );
}

export function FishIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M3 13c4-5 10-7.5 15-6-1 2-1 5 0 7-5 1.5-11-1-15-6z" />
      <path d="M18 8.5l3-2.5-.5 4.5M18 17.5l3 2.5-.5-4.5" />
      <circle cx="8.3" cy="12.3" r="0.6" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function DrumstickIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M14 4.5c2.8-1.6 6 .3 6 3.3 0 3.8-4.3 6-6.8 8.5" />
      <path d="M13.2 15.3a4 4 0 1 1-5.7 5.6c-1-1-1.3-2.4-1-4.2-1.6.3-3-.1-4-1a4 4 0 0 1 5.6-5.7z" />
    </Icon>
  );
}

export function PaletteIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M12 3a9 8 0 1 0 0 16c1.4 0 2-.8 2-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H16a4 4 0 0 0 4-4c0-4.4-3.6-6-8-6z" />
      <circle cx="7.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="9.5" cy="7" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="7" r="1" fill="currentColor" stroke="none" />
    </Icon>
  );
}

/** Google's own "G" mark, kept in its real brand colors per Google's sign-in button guidelines rather than recolored to match this icon set. */
export function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" {...props}>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.5 29.6 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.5 16 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.5 29.6 4.5 24 4.5c-7.6 0-14.2 4.3-17.7 10.2z"
      />
      <path
        fill="#4CAF50"
        d="M24 43.5c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.6C29.6 34.5 27 35.5 24 35.5c-5.3 0-9.7-3.3-11.3-8.1l-6.6 5.1C9.7 39.1 16.3 43.5 24 43.5z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.6 5.6C40.2 36.6 43.5 30.7 43.5 24c0-1.2-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}

export function HeartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M12 20.5S3.5 15.4 3.5 9.4A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 8.5 2.4c0 6-8.5 11.1-8.5 11.1z" />
    </Icon>
  );
}

export function TargetIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function SlidersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <circle cx="14.5" cy="7" r="2" />
      <circle cx="7.5" cy="17" r="2" />
    </Icon>
  );
}

export function CompassIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-2 6-6 2 2-6z" />
    </Icon>
  );
}
