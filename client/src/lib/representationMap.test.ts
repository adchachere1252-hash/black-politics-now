import { BLACK_POLITICAL_REPRESENTATION_RATING, buildBlackPoliticalRepresentationMapData } from "./representationMap";
import { describe, expect, it } from "vitest";

describe("Black Political Representation map semantics", () => {
  it("aggregates represented states without labeling them as partisan Toss-ups", () => {
    const data = buildBlackPoliticalRepresentationMapData([
      { stateCode: "GA" },
      { stateCode: "GA" },
      { stateCode: "MD" },
    ]);

    expect(data).toEqual({
      GA: { rating: BLACK_POLITICAL_REPRESENTATION_RATING, candidate1: "2 Black members", candidate2: "Representation record", calledWinner: null },
      MD: { rating: BLACK_POLITICAL_REPRESENTATION_RATING, candidate1: "1 Black member", candidate2: "Representation record", calledWinner: null },
    });
    expect(Object.values(data).some((record) => record.rating === "Toss-up")).toBe(false);
  });

  it("supports records that require a state-name-to-code resolver", () => {
    const data = buildBlackPoliticalRepresentationMapData(
      [{ state: "District of Columbia" }],
      (member) => member.state === "District of Columbia" ? "DC" : null,
    );

    expect(data.DC).toMatchObject({ rating: BLACK_POLITICAL_REPRESENTATION_RATING, candidate1: "1 Black member" });
  });
});
