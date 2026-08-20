import { geoIdentity, geoPath } from "d3-geo";
import { describe, expect, it } from "vitest";
import { renderAtlasDistrictPath } from "./atlasProjectionPath";

describe("Atlas projected district path integrity", () => {
  it("preserves a valid rectangular congressional district path", () => {
    const district = {
      type: "Feature",
      properties: { state: "Example", district: 1, id: "Example-1" },
      geometry: { type: "Polygon", coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]] },
    };
    const draw = geoPath(geoIdentity());
    const original = draw(district as never) || "";
    expect(renderAtlasDistrictPath(draw as unknown as (feature: unknown) => string | null, district)).toBe(original);
    expect(original).toContain("Z");
  });

  it("removes only a full-map composite projection clip surface", () => {
    const draw = () => "M50,50L60,50L60,60L50,60ZM0,48.462L1000,48.462L1000,571.538L0,571.538Z";
    const result = renderAtlasDistrictPath(draw, {});
    expect(result).toContain("M50,50L60,50L60,60L50,60Z");
    expect(result).not.toContain("M0,48.462L1000,48.462");
  });
});
