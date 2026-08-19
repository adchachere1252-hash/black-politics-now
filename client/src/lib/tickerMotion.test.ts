import { describe, expect, it } from "vitest";
import { nextTickerOffset } from "./tickerMotion";

describe("ticker motion", () => {
  it("advances continuously at a consistent rate", () => {
    expect(nextTickerOffset(0, 1000, 520)).toBe(52);
    expect(nextTickerOffset(52, 500, 520)).toBe(78);
  });

  it("wraps only after exactly one duplicated sequence width", () => {
    expect(nextTickerOffset(500, 1000, 520)).toBe(32);
    expect(nextTickerOffset(0, 1000, 0)).toBe(0);
  });
});
