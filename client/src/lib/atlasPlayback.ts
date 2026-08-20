import { LEWIS_MANIFEST } from "@/data/atlasBoundaryManifest";

export const ATLAS_PLAYBACK_CONGRESSES = Array.from({ length: 31 }, (_, index) => 89 + index);
export const ATLAS_PLAYBACK_SPEEDS = {
  slow: { label: "Slow", duration: 6500 },
  standard: { label: "Standard", duration: 4500 },
  fast: { label: "Fast", duration: 2750 },
} as const;

export type AtlasPlaybackSpeed = keyof typeof ATLAS_PLAYBACK_SPEEDS;
export type AtlasPlaybackStep = "wait" | "advance" | "complete";

export function atlasPlaybackStepState({ isPlaying, frameReady, displayedCongress, selectedCongress }: { isPlaying: boolean; frameReady: boolean; displayedCongress: number | null; selectedCongress: number }): AtlasPlaybackStep {
  if (!isPlaying || !frameReady || displayedCongress !== selectedCongress) return "wait";
  return selectedCongress >= 119 ? "complete" : "advance";
}

export function atlasManifestCoverage(congress: number) {
  const coveredStates = Object.entries(LEWIS_MANIFEST)
    .filter(([, eras]) => eras.some((era) => congress >= era.start && congress <= era.end));
  return {
    stateCount: coveredStates.length,
    missingStates: Object.keys(LEWIS_MANIFEST).filter((state) => !coveredStates.some(([coveredState]) => coveredState === state)),
    boundaryFiles: coveredStates.map(([, eras]) => eras.find((era) => congress >= era.start && congress <= era.end)?.name).filter((name): name is string => Boolean(name)),
  };
}

export function nextPlaybackCongress(congress: number) {
  return congress >= 119 ? 89 : Math.max(89, congress + 1);
}
