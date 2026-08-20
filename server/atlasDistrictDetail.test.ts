import { describe, expect, it } from "vitest";
import { atlasDistrictLabel, atlasDistrictSelection, atlasPartyLabel } from "../client/src/lib/atlasDistrictDetail";

describe("Historical Atlas district detail", () => {
  it("keeps UCLA's at-large district convention distinct from numbered districts", () => {
    expect(atlasDistrictLabel(0)).toBe("At-large");
    expect(atlasDistrictLabel(7)).toBe("District 7");
  });

  it("preserves roster-party context without recoding other parties", () => {
    expect(atlasPartyLabel("D", 100)).toBe("Democratic Party");
    expect(atlasPartyLabel("R", 200)).toBe("Republican Party");
    expect(atlasPartyLabel("O", 328)).toBe("Other party · Voteview code 328");
  });

  it("builds a typed selection that retains the source feature identifier", () => {
    expect(atlasDistrictSelection({
      congress: 119,
      state: "Alaska",
      stateCode: "AK",
      districtNumber: 0,
      sourceFeatureId: "02011911900",
      member: null,
    })).toMatchObject({
      districtLabel: "At-large",
      sourceFeatureId: "02011911900",
      stateCode: "AK",
    });
  });
});
