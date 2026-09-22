/**
 * The Today screen's hero: a pearl orb with a gradient progress ring
 * showing the day score, ported from reference/prototype.html's `hero()`.
 */
export function HeroOrb({ score }: { score: number }) {
  const r = 94;
  const cx = 118;
  const cy = 118;
  const circumference = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(100, score)) / 100;
  const angle = -Math.PI / 2 + 2 * Math.PI * p;
  const tipX = cx + r * Math.cos(angle);
  const tipY = cy + r * Math.sin(angle);
  const showArc = p > 0;
  const showTip = p > 0.02 && p < 0.995;

  return (
    <div className="relative mx-auto mb-1 mt-3 h-[250px] w-[250px]">
      <svg
        viewBox="0 0 236 236"
        className="block h-full w-full"
        style={{ filter: "drop-shadow(0 18px 24px color-mix(in srgb, var(--orb-2) 26%, transparent))" }}
        role="img"
        aria-label={`${score} percent of today's goals met`}
      >
        <defs>
          <linearGradient id="heroRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={{ stopColor: "var(--orb-1)" }} />
            <stop offset=".55" style={{ stopColor: "var(--orb-2)" }} />
            <stop offset="1" style={{ stopColor: "var(--orb-3)" }} />
          </linearGradient>
          <radialGradient id="heroCenter" cx=".38" cy=".3" r=".85">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset=".6" stopColor="#F7F1FF" />
            <stop offset="1" stopColor="#EADFFC" />
          </radialGradient>
          <radialGradient id="heroHalo" cx=".5" cy=".5" r=".5">
            <stop offset=".62" stopColor="#FFB49A" stopOpacity="0" />
            <stop offset=".84" stopColor="#F3A3D6" stopOpacity=".3" />
            <stop offset="1" stopColor="#B9A2FF" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle className="halo" cx={cx} cy={cy} r="117" fill="url(#heroHalo)" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EEE8F9" strokeWidth="15" />
        <circle cx={cx} cy={cy} r="80" fill="url(#heroCenter)" stroke="#fff" strokeWidth="2" />
        <ellipse cx="96" cy="76" rx="34" ry="13" fill="#fff" opacity=".75" transform="rotate(-24 96 76)" />

        {showArc && (
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="url(#heroRing)"
            strokeWidth="15"
            strokeLinecap="round"
            strokeDasharray={`${(circumference * p).toFixed(1)} ${circumference.toFixed(1)}`}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        )}

        {showTip && (
          <circle
            cx={tipX.toFixed(1)}
            cy={tipY.toFixed(1)}
            r="6.5"
            fill="#fff"
            style={{ stroke: "var(--orb-2)" }}
            strokeWidth="3"
          />
        )}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <b className="font-serif text-[82px] leading-[0.9] tracking-tight text-foreground">{score}</b>
        <span className="mt-1.5 text-xs font-semibold text-foreground-muted">% of today&rsquo;s goals</span>
      </div>
    </div>
  );
}
