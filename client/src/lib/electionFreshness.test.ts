import { describe, expect, it } from "vitest";
import { buildElectionMapFreshnessPresentation } from "./electionFreshness";

describe("buildElectionMapFreshnessPresentation", () => {
  const recordUpdatedAt = new Date("2026-08-16T12:00:00.000Z").getTime();

  it("distinguishes an active healthy source poll from the displayed record timestamp", () => {
    const result = buildElectionMapFreshnessPresentation(recordUpdatedAt, {
      mode: "active",
      sourceName: "DDHQ",
      sourceHealth: "healthy",
      lastPollAt: "2026-08-16T12:01:00.000Z",
    });

    expect(result.status).toBe("live");
    expect(result.primary).toBe("DDHQ live polling active");
    expect(result.detail).toContain("Most recent source poll:");
    expect(result.detail).toContain("latest displayed race-record change:");
  });

  it("makes standby status explicit instead of presenting an old record as a live update", () => {
    const result = buildElectionMapFreshnessPresentation(recordUpdatedAt, {
      mode: "standby",
      sourceName: "DDHQ",
      sourceHealth: "healthy",
      heartbeatAt: "2026-08-16T12:02:00.000Z",
    });

    expect(result.status).toBe("standby");
    expect(result.primary).toContain("standing by");
    expect(result.detail).toContain("Latest system heartbeat:");
  });

  it("provides a transparent fallback when no operational heartbeat is available", () => {
    const result = buildElectionMapFreshnessPresentation(recordUpdatedAt, null);

    expect(result.status).toBe("unknown");
    expect(result.primary).toBe("Operational refresh status unavailable");
    expect(result.detail).toContain("Latest displayed race-record change:");
  });
});
