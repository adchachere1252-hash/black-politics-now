import { describe, expect, it } from "vitest";
import { createTickerSequences } from "./tickerFlow";

describe("ticker flow", () => {
  it("duplicates equal result sequences for a seamless continuous track", () => {
    const items = ["Arizona House", "Florida House", "Virginia House"];
    const [first, second] = createTickerSequences(items);
    expect(first).toEqual(items);
    expect(second).toEqual(items);
    expect(first).toHaveLength(second.length);
  });
});
