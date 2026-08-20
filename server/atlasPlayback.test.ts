import { describe, expect, it } from "vitest";
import { ATLAS_PLAYBACK_CONGRESSES, ATLAS_PLAYBACK_SPEEDS, atlasManifestCoverage, atlasPlaybackStepState, nextPlaybackCongress } from "../client/src/lib/atlasPlayback";

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

  it("advances every Congress exactly once before completing at the final validated frame", () => {
    const visited: number[] = [];
    let congress = 89;
    while (atlasPlaybackStepState({ isPlaying: true, frameReady: true, displayedCongress: congress, selectedCongress: congress }) === "advance") {
      visited.push(congress);
      congress = nextPlaybackCongress(congress);
    }
    expect(visited).toEqual(ATLAS_PLAYBACK_CONGRESSES.slice(0, -1));
    expect(congress).toBe(119);
    expect(atlasPlaybackStepState({ isPlaying: true, frameReady: true, displayedCongress: congress, selectedCongress: congress })).toBe("complete");
  });

  it("waits when paused, when a frame is incomplete, or while an older frame remains visible", () => {
    expect(atlasPlaybackStepState({ isPlaying: false, frameReady: true, displayedCongress: 89, selectedCongress: 89 })).toBe("wait");
    expect(atlasPlaybackStepState({ isPlaying: true, frameReady: false, displayedCongress: 89, selectedCongress: 89 })).toBe("wait");
    expect(atlasPlaybackStepState({ isPlaying: true, frameReady: true, displayedCongress: 89, selectedCongress: 90 })).toBe("wait");
  });

  it("uses explicit slow, standard, and fast intervals without bypassing frame readiness", () => {
    expect(ATLAS_PLAYBACK_SPEEDS).toEqual({
      slow: { label: "Slow", duration: 6500 },
      standard: { label: "Standard", duration: 4500 },
      fast: { label: "Fast", duration: 2750 },
    });
  });
});
