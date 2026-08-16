import { describe, expect, it } from "vitest";
import { getBoundedMapTooltipPosition } from "./mapTooltipPosition";

describe("getBoundedMapTooltipPosition", () => {
  it("keeps a left-edge map state preview inside the visible map width", () => {
    expect(getBoundedMapTooltipPosition({ x: 24, y: 572, width: 959, height: 593 })).toEqual({ x: 112, y: 437 });
  });

  it("keeps a right-edge map state preview inside the visible map width", () => {
    expect(getBoundedMapTooltipPosition({ x: 945, y: 120, width: 959, height: 593 })).toEqual({ x: 847, y: 10 });
  });

  it("retains an interior preview near its selected state", () => {
    expect(getBoundedMapTooltipPosition({ x: 480, y: 330, width: 959, height: 593 })).toEqual({ x: 480, y: 216 });
  });
});
