import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const mapSource = readFileSync(new URL("../client/src/components/HistoricalUSMap.tsx", import.meta.url), "utf8");

describe("Historical Atlas map source tag", () => {
  it("keeps an accessible UCLA geometry source tag visible in every Atlas map frame", () => {
    expect(mapSource).toContain('const UCLA_CDMAPS_URL = "https://cdmaps.polisci.ucla.edu"');
    expect(mapSource).toContain('aria-label="Map geometry source: UCLA Congressional District Maps"');
    expect(mapSource).toContain("Source · UCLA CD Maps");
  });
});
