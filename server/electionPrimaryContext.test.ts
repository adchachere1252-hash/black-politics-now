import { describe, expect, it } from "vitest";
import { getPublicPrimaryContexts } from "./electionPrimaryContext";

describe("Alaska primary context", () => {
  it("keeps reviewed primary context separate from general-election outcomes", () => {
    const alaska = getPublicPrimaryContexts().find((item) => item.stateCode === "AK");
    expect(alaska).toMatchObject({ status: "preliminary", primaryDate: "2026-08-18" });
    expect(alaska?.generalElectionBoundary).toContain("general-election rating");
    expect(alaska?.sourceUrl).toMatch(/^https:\/\//);
    expect(alaska?.summary).toContain("Unofficial");
  });
});
