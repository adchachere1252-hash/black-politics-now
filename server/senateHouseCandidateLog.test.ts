import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const schema = readFileSync(new URL("../drizzle/schema.ts", import.meta.url), "utf8");
const persistence = readFileSync(new URL("./electionDb.ts", import.meta.url), "utf8");
const router = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const workspace = readFileSync(new URL("../client/src/components/CandidateChangesTab.tsx", import.meta.url), "utf8");

describe("Senate and House candidate-log contract", () => {
  it("keeps source fields on both public race records and preserves a separate immutable audit ledger", () => {
    expect(schema).toContain('candidateSourceUrl: varchar("candidate_source_url"');
    expect(schema).toContain('candidateSourceLabel: varchar("candidate_source_label"');
    expect(schema).toContain('electionCandidateEdits = mysqlTable("election_candidate_edits"');
    expect(schema).toContain('contestType: mysqlEnum("contest_type", ["senate", "house"])');
  });

  it("requires protected source-backed procedures for Senate and House candidate changes", () => {
    expect(persistence).toContain("updateSenateCandidateLog");
    expect(persistence).toContain("updateHouseCandidateLog");
    expect(persistence).toContain("previousValue: JSON.stringify(prior)");
    expect(router).toContain("updateSenateCandidateLog: adminProcedure");
    expect(router).toContain("updateHouseCandidateLog: adminProcedure");
    expect(router).toContain("senateCandidateHistory: adminProcedure");
    expect(router).toContain("houseCandidateHistory: adminProcedure");
  });

  it("presents searchable Senate, House, and Governor race management from Candidate Changes", () => {
    expect(workspace).toContain('type RaceType = "senate" | "house" | "governor"');
    expect(workspace).toContain("Senate contests");
    expect(workspace).toContain("House contests");
    expect(workspace).toContain("Governor contests");
    expect(workspace).toContain("Save candidate log");
    expect(workspace).toContain("Recent private change history");
  });
});
