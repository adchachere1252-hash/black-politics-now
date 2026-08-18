import { describe, expect, it } from "vitest";
import { createCertifiedSnapshotDigest, validateCertificationArchiveInput } from "./certifiedResultsArchive";

const validInput = {
  archiveKey: "2026-general-election",
  title: "2026 General Election Certified Results",
  certificationAuthority: "State Election Authority",
  certificationSourceUrl: "https://results.example.gov/certification",
  certificationStatement: "The election authority certified the listed final results.",
  certifiedAt: new Date("2026-11-20T12:00:00Z"),
};

describe("certified results archive guard", () => {
  it("accepts a source-backed authority certification record", () => {
    expect(() => validateCertificationArchiveInput(validInput)).not.toThrow();
  });

  it("rejects malformed keys, invalid authority URLs, and missing certification statements", () => {
    expect(() => validateCertificationArchiveInput({ ...validInput, archiveKey: "2026 General" })).toThrow(/archive key/i);
    expect(() => validateCertificationArchiveInput({ ...validInput, certificationSourceUrl: "file:///tmp/certification" })).toThrow(/source URL/i);
    expect(() => validateCertificationArchiveInput({ ...validInput, certificationStatement: "  " })).toThrow(/statement/i);
  });

  it("creates a deterministic digest for the preserved certified ledger", () => {
    const ledger = [{ chamber: "Senate" as const, contestKey: "senate-AZ", winnerOrResult: "Example Winner", partyOrSide: "D", sourceUrl: "https://results.example.gov/az", snapshotJson: '{"status":"Certified","winner":"Example Winner"}' }];
    expect(createCertifiedSnapshotDigest(ledger)).toBe(createCertifiedSnapshotDigest(ledger));
    expect(createCertifiedSnapshotDigest([{ ...ledger[0], winnerOrResult: "Different Winner" }])).not.toBe(createCertifiedSnapshotDigest(ledger));
  });
});
