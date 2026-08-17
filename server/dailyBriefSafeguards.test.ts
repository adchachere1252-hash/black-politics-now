import { describe, expect, it } from "vitest";
import { assessDailyBriefGate, getEasternDate } from "./dailyBriefSafeguards";

describe("Daily Brief safeguards", () => {
  it("passes only when preflight and both verified full voices are ready", () => {
    expect(assessDailyBriefGate({ verificationStatus: "passed", andrewFullReady: true, jennyFullReady: true, preflightStatus: "ready" })).toMatchObject({ passed: true, preflightReady: true, fullAudioReady: true });
  });

  it("holds a missing or partial episode for an owner alert", () => {
    const result = assessDailyBriefGate({ preflightStatus: "blocked", verificationStatus: "warnings", andrewFullReady: false, jennyFullReady: false });
    expect(result.passed).toBe(false);
    expect(result.message).toContain("source preflight is not ready");
    expect(result.message).toContain("Andrew full episode is unavailable");
  });

  it("uses the America/New_York calendar date for current-date recovery", () => {
    expect(getEasternDate(new Date("2026-08-18T02:15:00.000Z"))).toBe("2026-08-17");
  });
});
