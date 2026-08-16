import { describe, expect, it } from "vitest";
import { getOfficialPortraitSourceLeads } from "./portraitSourceLeads";

describe("getOfficialPortraitSourceLeads", () => {
  it("offers campaign, election-office, and congressional leads for federal candidates", () => {
    const leads = getOfficialPortraitSourceLeads({ candidateName: "Example Candidate", location: "Virginia 04", targetType: "house" });
    expect(leads.map((lead) => lead.label)).toEqual(["Official campaign portrait", "Congressional biography", "State election authority"]);
    expect(leads.every((lead) => lead.url.startsWith("https://www.google.com/search?q="))).toBe(true);
  });

  it("offers government biography lead for a governor candidate", () => {
    const leads = getOfficialPortraitSourceLeads({ candidateName: "Example Candidate", location: "Virginia", targetType: "governor" });
    expect(leads[1]?.label).toBe("Official government biography");
  });
});
