import { describe, expect, it } from "vitest";
import { APPORTIONMENT_HISTORY } from "../client/src/data/atlasHistory";
import { LEWIS_MANIFEST } from "../client/src/data/atlasBoundaryManifest";

const VRA_FIRST_CONGRESS = 89;
const CURRENT_CONGRESS = 119;

describe("Historical Atlas source integrity", () => {
  it("maps every one of the 50 states for every Congress from the VRA era forward", () => {
    const states = Object.keys(LEWIS_MANIFEST).sort();
    expect(states).toHaveLength(50);
    expect(Object.keys(APPORTIONMENT_HISTORY).sort()).toEqual(states);

    for (const state of states) {
      const eras = LEWIS_MANIFEST[state];
      expect(eras.length).toBeGreaterThan(0);
      expect(APPORTIONMENT_HISTORY[state]).toHaveLength(7);

      for (let congress = VRA_FIRST_CONGRESS; congress <= CURRENT_CONGRESS; congress += 1) {
        const match = eras.find((era) => congress >= era.start && congress <= era.end);
        expect(match, `${state} must have a source boundary file for the ${congress}th Congress`).toBeTruthy();
      }

      for (const era of eras) {
        const range = era.name.match(/_(\d{3})_to_(\d{3})\.geojson$/);
        expect(range, `${state} filename must carry its source Congress range`).toBeTruthy();
        expect(Number(range?.[1])).toBeLessThanOrEqual(era.start);
        expect(Number(range?.[2])).toBeGreaterThanOrEqual(era.end);
      }
    }
  });
});
