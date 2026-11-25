/** Start of the "upcoming" window: events that began in the last 6 hours still count. */
export function upcomingSince(): string {
  return new Date(Date.now() - 6 * 3_600_000).toISOString();
}
