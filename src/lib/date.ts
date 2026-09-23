/**
 * Date helpers that respect the user's own timezone (profiles.timezone),
 * per docs/build-brief.md section 6: "Dates are the user's local date,
 * never UTC."
 */

/** Today's date, as YYYY-MM-DD, in the given IANA timezone. */
export function todayInTimezone(timezone: string): string {
  // en-CA formats as YYYY-MM-DD, which saves us building the string by hand.
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(new Date());
}

/** Weekday index for a YYYY-MM-DD date string, where 0 = Monday, per the brief's convention. */
export function weekdayIndex(dateKey: string): number {
  const [year, month, day] = dateKey.split("-").map(Number);
  const jsDay = new Date(year, month - 1, day).getDay(); // 0 = Sunday
  return (jsDay + 6) % 7;
}

/** The current hour (0-23) in the given IANA timezone, for time-of-day greetings. */
export function hourInTimezone(timezone: string): number {
  return Number(new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", hour12: false }).format(new Date()));
}

/** 1-366, for rotating content by day (e.g. a different reflection question each day). */
export function dayOfYear(dateKey: string): number {
  const [year, month, day] = dateKey.split("-").map(Number);
  const start = Date.UTC(year, 0, 1);
  const current = Date.UTC(year, month - 1, day);
  return Math.floor((current - start) / 86_400_000) + 1;
}

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "21 Sep" style short date, for a YYYY-MM-DD date string. */
export function formatDayMonth(dateKey: string): string {
  const [, month, day] = dateKey.split("-").map(Number);
  return `${day} ${MONTHS_SHORT[month - 1]}`;
}
