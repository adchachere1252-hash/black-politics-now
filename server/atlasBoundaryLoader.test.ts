import { describe, expect, it } from "vitest";
import { atlasManifestCoverage } from "../client/src/lib/atlasPlayback";
import { loadNationalAtlasBoundaryBundle } from "../client/src/lib/atlasBoundaryLoader";

describe("Historical Atlas client boundary fallback", () => {
  it("uses the compact national bundle when every expected state file is present", async () => {
    const coverage = atlasManifestCoverage(104);
    const bundle = Object.fromEntries(coverage.boundaryFiles.map((filename) => [filename, "{}"]));
    const request = async () => ({ ok: true, json: async () => bundle, text: async () => "" });
    await expect(loadNationalAtlasBoundaryBundle(104, request)).resolves.toMatchObject({ source: "bundle", bundle });
  });

  it("reconstructs a complete all-state frame from individual repository-backed state routes when the bundle fails", async () => {
    const coverage = atlasManifestCoverage(104);
    const requested: string[] = [];
    const request = async (input: string) => {
      requested.push(input);
      if (input === "/api/atlas/bundle/104") return { ok: false, json: async () => ({}), text: async () => "" };
      return { ok: true, json: async () => ({}), text: async () => '{"type":"FeatureCollection","features":[]}' };
    };
    const loaded = await loadNationalAtlasBoundaryBundle(104, request);
    expect(loaded.source).toBe("state-fallback");
    expect(Object.keys(loaded.bundle)).toHaveLength(50);
    expect(requested).toHaveLength(56);
  });

  it("uses compact ten-state chunks before relying on individual state routes", async () => {
    const coverage = atlasManifestCoverage(104);
    const request = async (input: string) => {
      if (input === "/api/atlas/bundle/104") return { ok: false, json: async () => ({}), text: async () => "" };
      const chunk = Number(input.match(/chunk=(\d+)$/)?.[1]);
      const entries = coverage.boundaryFiles.slice(chunk * 10, (chunk + 1) * 10).map((filename) => [filename, "{}"]);
      return { ok: true, json: async () => Object.fromEntries(entries), text: async () => "" };
    };
    await expect(loadNationalAtlasBoundaryBundle(104, request)).resolves.toMatchObject({ source: "chunked-bundle" });
  });
});
