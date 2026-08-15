import { describe, expect, it, vi } from "vitest";
import { UCLA_TRUE_DISTRICT_ASSETS } from "../client/src/data/atlasTrueDistrictAssets";
import { loadTrueDistrictFrame } from "../client/src/lib/atlasTrueDistrictLoader";

function frame(congress: number) {
  return {
    type: "FeatureCollection" as const,
    metadata: { source: "UCLA", sourceUrl: "https://cdmaps.polisci.ucla.edu/", congress, states: 50, districtFeatures: 435, simplifiedForWeb: true },
    features: Array.from({ length: 50 }, (_, index) => ({ type: "Feature" as const, properties: { state: `State ${index}`, district: 1, id: String(index) }, geometry: null })),
  };
}

describe("validated UCLA Atlas district frames", () => {
  it("covers every Congress from the 89th through the 119th", () => {
    expect(Object.keys(UCLA_TRUE_DISTRICT_ASSETS).map(Number)).toEqual(Array.from({ length: 31 }, (_, index) => index + 89));
  });

  it("accepts a 50-state matching Congress frame and uses the immutable asset URL", async () => {
    const request = vi.fn(async () => ({ ok: true, json: async () => frame(119) }));
    const loaded = await loadTrueDistrictFrame(119, request as any);
    expect(loaded.metadata.congress).toBe(119);
    expect(request).toHaveBeenCalledWith(UCLA_TRUE_DISTRICT_ASSETS[119]);
  });
});
