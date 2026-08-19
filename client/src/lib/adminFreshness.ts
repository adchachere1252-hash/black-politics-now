export function getAdminFreshness(timestamp: Date | string | number | null | undefined, now = Date.now()) {
  if (!timestamp) return { minutesAgo: null, label: "No durable timestamp", stale: true };
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) return { minutesAgo: null, label: "No durable timestamp", stale: true };
  const minutesAgo = Math.max(0, Math.floor((now - parsed.getTime()) / 60_000));
  return { minutesAgo, label: minutesAgo < 1 ? "Updated just now" : `${minutesAgo}m ago`, stale: minutesAgo > 120 };
}
