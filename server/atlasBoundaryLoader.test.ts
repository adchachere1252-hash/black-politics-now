import { describe, expect, it } from "vitest";
import { atlasManifestCoverage } from "../client/src/lib/atlasPlayback";
import { loadNationalAtlasBoundaryBundle } from "../client/src/lib/atlasBoundaryLoader";

describe("Historical Atlas client boundary loading", () => {
  it("reconstructs a complete all-state frame from individual repository-backed state routes when chunks fail", async () => {
    const coverage = atlasManifestCoverage(104);
    const requested: string[] = [];
    const request = async (input: string) => {
      requested.push(input);
      if (input.startsWith("/api/atlas/bundle/104")) return { ok: false, json: async () => ({}), text: async () => "" };
      return { ok: true, json: async () => ({}), text: async () => '{"type":"FeatureCollection","features":[]}' };
    };
    const loaded = await loadNationalAtlasBoundaryBundle(104, request);
    expect(loaded.source).toBe("state-fallback");
    expect(Object.keys(loaded.bundle)).toHaveLength(50);
    expect(requested).toHaveLength(55);
  });

  it("surfaces completed ten-state chunks progressively before returning a complete frame", async () => {
    const coverage = atlasManifestCoverage(90);
    const observed: number[] = [];
    const request = async (input: string) => {
      const chunk = Number(input.match(/chunk=(\d+)/)?.[1]);
      const entries = coverage.boundaryFiles.slice(chunk * 10, (chunk + 1) * 10).map((filename) => [filename, "{}"]);
      return { ok: true, json: async () => Object.fromEntries(entries), text: async () => "" };
    };
    const loaded = await loadNationalAtlasBoundaryBundle(90, request, (_bundle, loadedStateFiles) => observed.push(loadedStateFiles));
    expect(loaded.source).toBe("chunked-bundle");
    expect(observed.some((count) => count > 0 && count < 50)).toBe(true);
    expect(observed.at(-1)).toBe(50);
  });
});
