import { describe, expect, it } from "vitest";
import { formatElectionNightTime, summarizePublicElectionNightStatus } from "./electionNightStatus";

describe("public Election Night status", () => {
  it("describes a healthy active poller without exposing private operation details", () => {
    expect(summarizePublicElectionNightStatus({ mode: "active", sourceName: "DDHQ", sourceHealth: "healthy", heartbeatAt: null, lastPollAt: null, mappedRaces: 65, updatedRaces: 65, failedPolls: 0, newCalls: 0 })).toMatchObject({ live: true, review: false, label: "Election Night Live", detail: "65/65 mapped races updated" });
  });

  it("identifies a degraded source state and formats missing timestamps safely", () => {
    expect(summarizePublicElectionNightStatus({ mode: "degraded", sourceName: "DDHQ", sourceHealth: "degraded", heartbeatAt: null, lastPollAt: null, mappedRaces: 65, updatedRaces: 60, failedPolls: 5, newCalls: 0 })).toMatchObject({ live: false, review: true, label: "Election Review" });
    expect(formatElectionNightTime(null)).toBe("Awaiting source update");
  });
});
