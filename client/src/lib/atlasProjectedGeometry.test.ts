import { describe, expect, it } from "vitest";
import { renderProjectedDistrictGeometry } from "./atlasProjectedGeometry";

const identity = ([x, y]: [number, number]) => [x, y] as [number, number];

describe("Atlas projected district geometry", () => {
  it("fills reversed source rings consistently instead of turning them into false cutouts", () => {
    const geometry = { type: "Polygon" as const, coordinates: [
      [[0, 0], [8, 0], [8, 8], [0, 8], [0, 0]],
      [[2, 2], [2, 6], [6, 6], [6, 2], [2, 2]],
    ] };
    const path = renderProjectedDistrictGeometry(identity, geometry);
    expect(path).toMatch(/M(?:0,0L8,0L8,8L0,8|0,8L8,8L8,0L0,0)Z/);
    expect(path).toMatch(/M(?:2,2L6,2L6,6L2,6|2,2L2,6L6,6L6,2)Z/);
    expect((path.match(/M/g) ?? []).length).toBe(2);
  });

  it("retains every ring of a multipolygon while skipping only unprojectable points", () => {
    const geometry = { type: "MultiPolygon" as const, coordinates: [
      [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]],
      [[[5, 5], [7, 5], [7, 7], [5, 7], [5, 5]]],
    ] };
    expect((renderProjectedDistrictGeometry(identity, geometry).match(/M/g) ?? []).length).toBe(2);
  });
});
