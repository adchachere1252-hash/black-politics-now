import { describe, expect, it } from "vitest";
import { ATLAS_VRA_TIMELINE, sourceCheckedBoundaryNote } from "../client/src/data/atlasVraTimeline";

describe("Historical Atlas VRA interpretation sources", () => {
  it("keeps every guided milestone within the Atlas era and linked to an institutional source", () => {
    expect(ATLAS_VRA_TIMELINE.map((item) => item.year)).toEqual([1965, 1982, 1986, 2013, 2023, 2026]);
    for (const milestone of ATLAS_VRA_TIMELINE) {
      expect(milestone.congress).toBeGreaterThanOrEqual(89);
      expect(milestone.congress).toBeLessThanOrEqual(119);
      expect(new URL(milestone.sourceUrl).hostname).toMatch(/^(www\.)?(justice\.gov|history\.house\.gov|supremecourt\.gov)$/);
    }
    expect(ATLAS_VRA_TIMELINE.at(-1)).toMatchObject({
      congress: 119,
      title: "Louisiana v. Callais",
      sourceUrl: "https://www.supremecourt.gov/opinions/25pdf/24-109_21o3.pdf",
    });
  });

  it("labels boundary notes as source-checked archive context rather than legal certification", () => {
    expect(sourceCheckedBoundaryNote("Alabama", 118, "Alabama_118_to_118.geojson")).toContain("not a legal certification");
  });
});
