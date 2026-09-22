const COLOR_CLASSES = {
  water: "bg-water",
  steps: "bg-steps",
  sleep: "bg-sleep",
  calories: "bg-calories",
  weight: "bg-weight",
  fasting: "bg-fasting",
} as const;

export function ProgressBar({
  pct,
  color,
}: {
  pct: number;
  color: keyof typeof COLOR_CLASSES;
}) {
  const width = Math.round(Math.min(1, Math.max(0, pct)) * 100);
  return (
    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/70">
      <div className={`h-full rounded-full ${COLOR_CLASSES[color]}`} style={{ width: `${width}%` }} />
    </div>
  );
}
