import { useId } from "react";

/**
 * The numerology screen's mandala, ported from reference/prototype.html's
 * mandala() function. Fills its relative parent -- wrap it in a sized,
 * position:relative container.
 */
export function Mandala({ color }: { color: string }) {
  const gradId = useId();

  const petals = Array.from({ length: 12 }, (_, i) => (
    <ellipse key={i} cx="150" cy="82" rx="15" ry="44" transform={`rotate(${i * 30} 150 150)`} />
  ));
  const petals2 = Array.from({ length: 8 }, (_, i) => (
    <ellipse key={i} cx="150" cy="106" rx="10" ry="30" transform={`rotate(${i * 45 + 22.5} 150 150)`} />
  ));
  const dots = Array.from({ length: 24 }, (_, i) => {
    const angle = (i * 15 * Math.PI) / 180;
    const cx = (150 + 140 * Math.sin(angle)).toFixed(1);
    const cy = (150 - 140 * Math.cos(angle)).toFixed(1);
    return <circle key={i} cx={cx} cy={cy} r={i % 2 ? 1.4 : 2.3} />;
  });

  return (
    <svg viewBox="0 0 300 300" className="block h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id={gradId} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#fff" />
          <stop offset=".62" stopColor={color} stopOpacity=".18" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="150" cy="150" r="148" fill={`url(#${gradId})`} />
      <g fill="none" stroke={color} strokeWidth="1.1" strokeOpacity=".4">
        <circle cx="150" cy="150" r="128" />
        <circle cx="150" cy="150" r="94" />
        {petals}
      </g>
      <g fill="none" stroke={color} strokeWidth="1" strokeOpacity=".55">
        {petals2}
        <circle cx="150" cy="150" r="66" />
      </g>
      <g fill={color} fillOpacity=".6">
        {dots}
      </g>
      <circle cx="150" cy="150" r="54" fill="#fff" fillOpacity=".88" />
    </svg>
  );
}
