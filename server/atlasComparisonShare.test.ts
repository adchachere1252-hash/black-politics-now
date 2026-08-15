import { describe, expect, it } from "vitest";
import { buildAtlasComparisonUrl } from "../client/src/lib/atlasComparisonShare";

describe("Atlas comparison sharing", () => {
  it("preserves both Congresses, selected state, and a non-default overlay", () => {
    expect(buildAtlasComparisonUrl("https://example.test", "/atlas", {
      stateCode: "AL", congress: 119, comparisonCongress: 89, overlayMode: "member",
    })).toBe("https://example.test/atlas?state=AL&congress=119&compare=1&compareCongress=89&overlay=member");
  });

  it("omits the default boundary overlay from compact share URLs", () => {
    expect(buildAtlasComparisonUrl("https://example.test", "/atlas", {
      stateCode: "NY", congress: 104, comparisonCongress: 89, overlayMode: "boundary",
    })).toBe("https://example.test/atlas?state=NY&congress=104&compare=1&compareCongress=89");
  });
});
