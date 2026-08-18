import { describe, expect, it } from "vitest";
import { getAtlasDistrictFill, getAtlasDistrictStroke, getAtlasMapLegend } from "./atlasMapPalette";

describe("Historical Atlas House-map palette", () => {
  it("uses the shared election rating tokens while retaining each historical overlay meaning", () => {
    expect(getAtlasDistrictFill({ mode: "boundary", hasMember: false, selected: false })).toBe("var(--color-no-data)");
    expect(getAtlasDistrictFill({ mode: "party", party: "D", hasMember: true, selected: false })).toBe("var(--color-solid-d)");
    expect(getAtlasDistrictFill({ mode: "party", party: "R", hasMember: true, selected: false })).toBe("var(--color-solid-r)");
    expect(getAtlasDistrictFill({ mode: "party", party: "O", hasMember: true, selected: false })).toBe("var(--color-tossup)");
    expect(getAtlasDistrictFill({ mode: "member", hasMember: true, selected: false })).toBe("var(--color-representation)");
    expect(getAtlasDistrictFill({ mode: "member", hasMember: false, selected: true })).toBe("var(--primary)");
  });

  it("keeps selection and legend presentation tied to the shared design tokens", () => {
    expect(getAtlasDistrictStroke({ mode: "party", party: "D", selected: false })).toBe("var(--color-likely-d)");
    expect(getAtlasDistrictStroke({ mode: "boundary", selected: false })).toBe("var(--muted-foreground)");
    expect(getAtlasDistrictStroke({ mode: "boundary", selected: true })).toBe("var(--color-primary)");
    expect(getAtlasMapLegend("party")).toEqual(expect.arrayContaining([
      { label: "Democratic", color: "var(--color-solid-d)" },
      { label: "Republican", color: "var(--color-solid-r)" },
    ]));
  });
});
