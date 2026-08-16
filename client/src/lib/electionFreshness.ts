export type PublicElectionHeartbeat = {
  mode?: "standby" | "active" | "degraded";
  sourceName?: string;
  sourceHealth?: "unknown" | "healthy" | "degraded";
  heartbeatAt?: Date | string | null;
  lastPollAt?: Date | string | null;
} | null | undefined;

const timestampFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function formatTimestamp(value: Date | string | number | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : timestampFormat.format(date);
}

export function buildElectionMapFreshnessPresentation(recordUpdatedAt: number | null, heartbeat: PublicElectionHeartbeat) {
  const recordLabel = formatTimestamp(recordUpdatedAt);
  const activityLabel = formatTimestamp(heartbeat?.mode === "active" ? heartbeat.lastPollAt ?? heartbeat.heartbeatAt : heartbeat?.heartbeatAt);
  const sourceName = heartbeat?.sourceName || "Election engine";

  if (!heartbeat || !activityLabel) {
    return {
      status: "unknown" as const,
      primary: "Operational refresh status unavailable",
      detail: recordLabel ? `Latest displayed race-record change: ${recordLabel}` : "No race-record update timestamp is available.",
    };
  }

  if (heartbeat.mode === "active") {
    return {
      status: heartbeat.sourceHealth === "degraded" ? "warning" as const : "live" as const,
      primary: heartbeat.sourceHealth === "degraded" ? `${sourceName} polling needs attention` : `${sourceName} live polling active`,
      detail: `Most recent source poll: ${activityLabel}${recordLabel ? ` · latest displayed race-record change: ${recordLabel}` : ""}`,
    };
  }

  if (heartbeat.mode === "degraded" || heartbeat.sourceHealth === "degraded") {
    return {
      status: "warning" as const,
      primary: `${sourceName} refresh requires review`,
      detail: `Latest system heartbeat: ${activityLabel}${recordLabel ? ` · latest displayed race-record change: ${recordLabel}` : ""}`,
    };
  }

  return {
    status: "standby" as const,
    primary: `${sourceName} standing by between active election dates`,
    detail: `Latest system heartbeat: ${activityLabel}${recordLabel ? ` · latest displayed race-record change: ${recordLabel}` : ""}`,
  };
}
