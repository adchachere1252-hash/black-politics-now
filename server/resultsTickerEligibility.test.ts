import { describe, expect, it } from "vitest";
import { isFinalElectionTickerOutcome } from "../client/src/lib/resultsTickerEligibility";

describe("homepage results ticker eligibility", () => {
  it("includes called general or special-election outcomes but excludes primary-stage results", () => {
    expect(isFinalElectionTickerOutcome({ calledWinner: "Jimmy Patronis", status: "Called" })).toBe(true);
    expect(isFinalElectionTickerOutcome({ calledWinner: "Adelita S. Grijalva", status: "General" })).toBe(true);
    expect(isFinalElectionTickerOutcome({ calledWinner: "Wesley Bell", status: "Primary" })).toBe(false);
    expect(isFinalElectionTickerOutcome({ calledWinner: "Primary candidate", status: "Primary Runoff" })).toBe(false);
    expect(isFinalElectionTickerOutcome({ status: "Called" })).toBe(false);
  });
});
