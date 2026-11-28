export type DateBucket = "today" | "yesterday" | "thisWeek" | "earlier"

export const DATE_BUCKET_LABEL: Record<DateBucket, string> = {
  today: "Today",
  yesterday: "Yesterday",
  thisWeek: "Earlier this week",
  earlier: "Earlier",
}

function startOfLocalDay(value: number): number {
  const d = new Date(value)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/**
 * Calendar-day bucket (device time zone) for list section headers. Future or invalid timestamps
 * fall into "today" so a clock skew never hides a fresh item under "Earlier".
 */
export function dateBucketOf(timestamp: number, now: number = Date.now()): DateBucket {
  if (!Number.isFinite(timestamp) || timestamp <= 0) return "earlier"
  const today = startOfLocalDay(now)
  if (timestamp >= today) return "today"
  const dayMs = 86_400_000
  if (timestamp >= today - dayMs) return "yesterday"
  if (timestamp >= today - 6 * dayMs) return "thisWeek"
  return "earlier"
}
