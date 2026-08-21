import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const schema = readFileSync(new URL("../drizzle/schema.ts", import.meta.url), "utf8");
const persistence = readFileSync(new URL("./electionDb.ts", import.meta.url), "utf8");
const router = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const admin = readFileSync(new URL("../client/src/pages/Admin.tsx", import.meta.url), "utf8");
const candidateChanges = readFileSync(new URL("../client/src/components/CandidateChangesTab.tsx", import.meta.url), "utf8");
const verifier = readFileSync(new URL("../scripts/verify-change-candidates-end-to-end.ts", import.meta.url), "utf8");

describe("Governor candidate-log contract", () => {
  it("keeps candidate source fields and an immutable audit record in the election schema", () => {
    expect(schema).toContain('candidateSourceUrl: varchar("candidate_source_url"');
    expect(schema).toContain('candidateSourceLabel: varchar("candidate_source_label"');
    expect(schema).toContain('governorCandidateEdits = mysqlTable("governor_candidate_edits"');
  });

  it("requires the explicit protected candidate-log procedure instead of a blind public race update", () => {
    expect(persistence).toContain("updateGovernorCandidateLog");
    expect(persistence).toContain("previousValue: JSON.stringify(prior)");
    expect(router).toContain("updateGovernorCandidateLog: adminProcedure");
    expect(router).toContain("candidateSourceUrl: electionSourceUrl");
    expect(router).toContain("Source URL must use HTTP or HTTPS.");
    expect(router).toContain("governorCandidateHistory: adminProcedure");
    expect(admin).toContain("Manage candidates");
    expect(admin).toContain("Manual general-election candidate log");
    expect(admin).toContain('label: "Election Operations"');
    expect(admin).toContain('section === "sourcing" && <CandidateChangesTab />');
    expect(admin).not.toContain('label: "Candidate Changes"');
    expect(candidateChanges).toContain("GovernorCandidateLogEditor");
    expect(candidateChanges).toContain("updateGovernorCandidateLog.useMutation");
    expect(candidateChanges).toContain("The public Governor record and private source history refreshed.");
    expect(candidateChanges).not.toContain("onManageGovernor");
    expect(candidateChanges).toContain("Change candidates");
    expect(candidateChanges).toContain("The public Senate record and private source history refreshed.");
    expect(candidateChanges).toContain("The public House record and private source history refreshed.");
    expect(admin).toContain("The public Governor record and private source history refreshed.");
    expect(verifier).toContain("updateSenateCandidateLog");
    expect(verifier).toContain("updateHouseCandidateLog");
    expect(verifier).toContain("updateGovernorCandidateLog");
  });
});
