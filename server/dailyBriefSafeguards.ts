export type DailyBriefGateInput = {
  verificationStatus?: string | null;
  andrewFullReady?: boolean;
  jennyFullReady?: boolean;
  preflightStatus?: string | null;
};

export function getEasternDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function assessDailyBriefGate(input: DailyBriefGateInput) {
  const preflightReady = input.preflightStatus === "ready";
  const fullAudioReady = input.verificationStatus === "passed" && Boolean(input.andrewFullReady) && Boolean(input.jennyFullReady);
  const passed = preflightReady && fullAudioReady;
  const reasons: string[] = [];
  if (!preflightReady) reasons.push("source preflight is not ready");
  if (input.verificationStatus !== "passed") reasons.push("episode verification has not passed");
  if (!input.andrewFullReady) reasons.push("Andrew full episode is unavailable");
  if (!input.jennyFullReady) reasons.push("Jenny full episode is unavailable");
  return {
    passed,
    preflightReady,
    fullAudioReady,
    message: passed ? "The Daily Intelligence Brief has passed the full publication gate." : `The Daily Intelligence Brief is held because ${reasons.join("; ")}.`,
  };
}
