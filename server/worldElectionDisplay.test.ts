import { describe, expect, it } from "vitest";
import { rankedWorldSignals, worldSignalLabel } from "../client/src/lib/worldElectionDisplay";

describe("World Elections display ranking", () => {
  const cookIslands = { id: 22, country: "Cook Islands", status: "Voting Today", electionDate: "2026-08-12" };
  const zambia = { id: 23, country: "Zambia", status: "Voting Today", electionDate: "2026-08-13" };
  const future = { id: 24, country: "Example", status: "Upcoming", electionDate: "2026-08-20" };

  it("places the most recently voting or counting event before an older live watch and future events", () => {
    expect(rankedWorldSignals([future, cookIslands, zambia]).map((item) => item.country)).toEqual(["Zambia", "Cook Islands", "Example"]);
  });

  it("does not label a results-pending election as the next event", () => {
    expect(worldSignalLabel(zambia, new Date("2026-08-14T12:00:00Z"))).toBe("Results pending");
    expect(worldSignalLabel(future, new Date("2026-08-14T12:00:00Z"))).toBe("Next");
  });
});
