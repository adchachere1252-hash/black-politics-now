import { describe, expect, it } from "vitest";
import { atlasFrameSummary, officialSeatsForAtlasState, stateGeometryMatchesApportionment } from "../client/src/lib/atlasFrameIntegrity";

describe("Historical Atlas frame integrity", () => {
  it("uses apportionment data for official House-seat totals rather than raw geometry counts", () => {
    expect(officialSeatsForAtlasState("North Dakota", 119)).toBe(1);
    expect(stateGeometryMatchesApportionment("North Dakota", 119, 3)).toBe(false);
    expect(stateGeometryMatchesApportionment("Alabama", 119, 7)).toBe(true);
  });

  it("reports geometry exceptions without changing the official 435-seat House total", () => {
    const counts = Object.fromEntries(Object.keys({ Alabama: 0, Alaska: 0, Arizona: 0, Arkansas: 0, California: 0, Colorado: 0, Connecticut: 0, Delaware: 0, Florida: 0, Georgia: 0, Hawaii: 0, Idaho: 0, Illinois: 0, Indiana: 0, Iowa: 0, Kansas: 0, Kentucky: 0, Louisiana: 0, Maine: 0, Maryland: 0, Massachusetts: 0, Michigan: 0, Minnesota: 0, Mississippi: 0, Missouri: 0, Montana: 0, Nebraska: 0, Nevada: 0, "New Hampshire": 0, "New Jersey": 0, "New Mexico": 0, "New York": 0, "North Carolina": 0, "North Dakota": 0, Ohio: 0, Oklahoma: 0, Oregon: 0, Pennsylvania: 0, "Rhode Island": 0, "South Carolina": 0, "South Dakota": 0, Tennessee: 0, Texas: 0, Utah: 0, Vermont: 0, Virginia: 0, Washington: 0, "West Virginia": 0, Wisconsin: 0, Wyoming: 0 }).map((state) => [state, officialSeatsForAtlasState(state, 119)]));
    counts["North Dakota"] = 3;
    counts["South Dakota"] = 2;
    const summary = atlasFrameSummary(119, counts);
    expect(summary.officialSeats).toBe(435);
    expect(summary.exceptionStates).toEqual(["North Dakota", "South Dakota"]);
  });
});
