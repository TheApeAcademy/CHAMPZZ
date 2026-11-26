/** Start of the "upcoming" window: events that began in the last 6 hours still count. */
export function upcomingSince(): string {
  return new Date(Date.now() - 6 * 3_600_000).toISOString();
}

/** Whole days from now until an ISO timestamp, never below zero. */
export function daysUntil(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
}
