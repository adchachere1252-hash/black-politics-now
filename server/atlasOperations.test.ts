import { describe, expect, it } from "vitest";
import { evaluateAtlasPlaybackContract, getAtlasFrameHealth } from "./atlasOperations";

describe("Atlas Operations contracts", () => {
  it("reports every registered Congress frame as a 50-state source-preserving health record", () => {
    const health = getAtlasFrameHealth();
    expect(health).toHaveLength(31);
    expect(health.every((frame) => frame.assetRegistered && frame.stateCount === 50 && frame.missingStates.length === 0 && frame.uniqueBoundaryFiles === 50 && frame.ready)).toBe(true);
  });

  it("passes the guarded playback contract without mutating public source data", () => {
    const result = evaluateAtlasPlaybackContract();
    expect(result.status).toBe("passed");
    expect(result.readyFrames).toBe(31);
    expect(result.sequencePassed).toBe(true);
    expect(result.readinessGuardPassed).toBe(true);
    expect(result.pauseGuardPassed).toBe(true);
    expect(result.speedMs).toEqual({ slow: 6500, standard: 4500, fast: 2750 });
  });
});
