import { describe, expect, it, vi } from "vitest";
import { UCLA_TRUE_DISTRICT_ASSETS } from "../client/src/data/atlasTrueDistrictAssets";
import { loadTrueDistrictFrame } from "../client/src/lib/atlasTrueDistrictLoader";

function topologyFrame(congress: number) {
  return {
    type: "Topology",
    metadata: { source: "UCLA", sourceUrl: "https://cdmaps.polisci.ucla.edu/", congress, states: 50, districtFeatures: 435, simplifiedForWeb: false, topologyPreservesSharedBoundaries: true },
    objects: { districts: { type: "GeometryCollection", geometries: Array.from({ length: 50 }, (_, index) => ({ type: "Point", coordinates: [index, index], properties: { state: `State ${index}`, district: 1, id: String(index) } })) } },
  };
}

async function compressedResponse(payload: unknown) {
  const gzip = new CompressionStream("gzip");
  const body = new Blob([JSON.stringify(payload)]).stream().pipeThrough(gzip);
  return new Response(body);
}

describe("validated UCLA Atlas district frames", () => {
  it("covers every Congress from the 89th through the 119th", () => {
    expect(Object.keys(UCLA_TRUE_DISTRICT_ASSETS).map(Number)).toEqual(Array.from({ length: 31 }, (_, index) => index + 89));
  });

  it("accepts a 50-state matching Congress frame and uses the immutable asset URL", async () => {
    const request = vi.fn(async () => compressedResponse(topologyFrame(119)));
    const loaded = await loadTrueDistrictFrame(119, request as any);
    expect(loaded.metadata.congress).toBe(119);
    expect(loaded.metadata.topologyPreservesSharedBoundaries).toBe(true);
    expect(loaded.features).toHaveLength(50);
    expect(loaded.stateBoundaries).toHaveLength(50);
    expect(request).toHaveBeenCalledWith(UCLA_TRUE_DISTRICT_ASSETS[119]);
  });

  it("refuses a simplified or non-shared-boundary frame before it can render", async () => {
    const legacy = topologyFrame(118);
    legacy.metadata.simplifiedForWeb = true;
    legacy.metadata.topologyPreservesSharedBoundaries = false;
    await expect(loadTrueDistrictFrame(118, (async () => compressedResponse(legacy)) as any)).rejects.toThrow("required canonical shared-boundary geometry");
  });
});
