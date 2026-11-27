/** Start of the "upcoming" window: events that began in the last 6 hours still count. */
export function upcomingSince(): string {
  return new Date(Date.now() - 6 * 3_600_000).toISOString();
}

/** Whole days from now until an ISO timestamp, never below zero. */
export function daysUntil(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
}

/** Today's date (YYYY-MM-DD) in a time zone. */
export function todayIn(tz: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}
