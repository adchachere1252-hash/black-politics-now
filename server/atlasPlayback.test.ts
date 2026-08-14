import { describe, expect, it } from "vitest";
import { ATLAS_PLAYBACK_CONGRESSES, atlasManifestCoverage, nextPlaybackCongress } from "../client/src/lib/atlasPlayback";

describe("Historical Atlas complete playback coverage", () => {
  it("covers all 50 states for every Congress in the 1963–2025 playback range", () => {
    for (const congress of ATLAS_PLAYBACK_CONGRESSES) {
      const coverage = atlasManifestCoverage(congress);
      expect(coverage.stateCount, `${congress}th Congress`).toBe(50);
      expect(coverage.missingStates, `${congress}th Congress`).toEqual([]);
      expect(new Set(coverage.boundaryFiles).size, `${congress}th Congress`).toBe(50);
    }
  });

  it("loops from the latest supported Congress back to the beginning of the archive", () => {
    expect(nextPlaybackCongress(89)).toBe(90);
    expect(nextPlaybackCongress(118)).toBe(119);
    expect(nextPlaybackCongress(119)).toBe(89);
  });
});
