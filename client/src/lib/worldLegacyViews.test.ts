import { describe, expect, it } from "vitest";
import { getCompletedWorldResults, getWorldReferendums, type WorldElectionRecord } from "./worldLegacyViews";

const election = (overrides: Partial<WorldElectionRecord>): WorldElectionRecord => ({
  id: String(overrides.id ?? "1"), country: "Example", countryCode: "EX", electionName: "Example vote", electionType: "Presidential", electionDate: "2026-08-01", status: "Upcoming", ...overrides,
});

describe("World legacy views", () => {
  it("limits results to completed records and keeps the newest outcome first", () => {
    const results = getCompletedWorldResults([
      election({ id: "old", status: "Completed", electionDate: "2026-01-01" }),
      election({ id: "future", status: "Upcoming", electionDate: "2026-12-01" }),
      election({ id: "new", status: "Completed", electionDate: "2026-08-01" }),
    ]);
    expect(results.map((item) => item.id)).toEqual(["new", "old"]);
  });

  it("keeps both upcoming and completed referendums in chronological order", () => {
    const referendums = getWorldReferendums([
      election({ id: "result", electionType: "Referendum", status: "Completed", electionDate: "2026-08-01" }),
      election({ id: "other", electionType: "Parliamentary", electionDate: "2026-01-01" }),
      election({ id: "upcoming", electionType: "Referendum", electionDate: "2026-11-01" }),
    ]);
    expect(referendums.map((item) => item.id)).toEqual(["result", "upcoming"]);
  });
});
