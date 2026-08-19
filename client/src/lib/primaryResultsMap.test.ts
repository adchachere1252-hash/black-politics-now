import { describe, expect, it } from "vitest";
import { AUGUST_18_PRIMARY_RESULTS, buildPrimaryResultsMapData } from "./primaryResultsMap";

describe("August 18 primary-results map data", () => {
  it("keeps only source-backed participating jurisdictions in the public primary layer", () => {
    expect(AUGUST_18_PRIMARY_RESULTS.map((record) => record.stateCode)).toEqual(["FL", "AK", "WY", "CA"]);
    expect(AUGUST_18_PRIMARY_RESULTS.every((record) => record.sourceUrl.startsWith("https://"))).toBe(true);
    expect(AUGUST_18_PRIMARY_RESULTS.every((record) => record.resultStatus.length > 0 && record.results.length > 0)).toBe(true);
  });

  it("uses a distinct nonpartisan primary-result map semantic", () => {
    const mapData = buildPrimaryResultsMapData();
    expect(Object.keys(mapData)).toHaveLength(4);
    expect(mapData.FL.rating).toBe("Primary Result");
    expect(mapData.CA.candidate1).toContain("51.04%");
  });
});
