export type PublicElectionNightStatus = {
  mode: "standby" | "active" | "degraded";
  sourceName: string;
  sourceHealth: "unknown" | "healthy" | "degraded";
  heartbeatAt: Date | string | null;
  lastPollAt: Date | string | null;
  mappedRaces: number;
  updatedRaces: number;
  failedPolls: number;
  newCalls: number;
};

export function summarizePublicElectionNightStatus(status: PublicElectionNightStatus) {
  const live = status.mode === "active" && status.sourceHealth === "healthy";
  const review = status.mode === "degraded" || status.sourceHealth === "degraded" || status.failedPolls > 0;
  return {
    live,
    review,
    label: live ? "Election Night Live" : review ? "Election Review" : "Election Watch",
    detail: live
      ? `${status.updatedRaces}/${status.mappedRaces} mapped races updated`
      : status.mode === "standby"
        ? "Monitoring is ready for the next active election date"
        : "Operations need an editor review before any public correction",
  };
}

export function formatElectionNightTime(value: Date | string | null) {
  if (!value) return "Awaiting source update";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Awaiting source update";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
