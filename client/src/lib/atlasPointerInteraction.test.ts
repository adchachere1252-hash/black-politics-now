import { describe, expect, it } from "vitest";
import { shouldBeginAtlasPan } from "./atlasPointerInteraction";

describe("Atlas pointer interaction threshold", () => {
  it("does not treat a click as a pan but begins capture after a meaningful drag", () => {
    expect(shouldBeginAtlasPan(0, 0)).toBe(false);
    expect(shouldBeginAtlasPan(2, 2)).toBe(false);
    expect(shouldBeginAtlasPan(5, 0)).toBe(true);
    expect(shouldBeginAtlasPan(-3, -2)).toBe(true);
  });
});
