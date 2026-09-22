/** Pure fasting-timer math: elapsed/remaining time and progress, given a start time and a planned duration. */

export interface FastingProgress {
  elapsedHours: number;
  /** Negative once the planned duration has passed. */
  remainingHours: number;
  /** 0-1+, uncapped (can exceed 1 if the fast has run past its planned length). */
  pct: number;
  isComplete: boolean;
}

export function fastingProgress(startedAt: Date, plannedHours: number, now: Date = new Date()): FastingProgress {
  const elapsedHours = (now.getTime() - startedAt.getTime()) / (1000 * 60 * 60);
  const remainingHours = plannedHours - elapsedHours;
  return {
    elapsedHours,
    remainingHours,
    pct: plannedHours > 0 ? elapsedHours / plannedHours : 0,
    isComplete: elapsedHours >= plannedHours,
  };
}

/** "Xh YYm" style duration, e.g. for 13.5 hours -> "13h 30m". Negative hours get a leading "-". */
export function formatDuration(hours: number): string {
  const totalMinutes = Math.round(Math.abs(hours) * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${hours < 0 ? "-" : ""}${h}h ${String(m).padStart(2, "0")}m`;
}
