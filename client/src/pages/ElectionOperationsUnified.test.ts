import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const source = readFileSync(join(process.cwd(), "client/src/pages/Admin.tsx"), "utf8");

describe("Unified Election Operations Admin workspace", () => {
  it("consolidates candidate directory, sourcing, live results, conflicts, and operator history under one protected navigation entry", () => {
    expect(source).toContain('key: "electionOperations", label: "Election Operations"');
    expect(source).toContain('label: "Candidate directory"');
    expect(source).toContain('label: "Candidate sourcing"');
    expect(source).toContain('label: "Results & conflicts"');
    expect(source).toContain('<CandidateChangesTab />');
    expect(source).toContain('<ElectionResultsControlRoomTab />');
    expect(source).toContain('onOpenCandidateChanges={() => setSection("sourcing")}');
    expect(source).not.toContain('{ key: "results", label: "Results Control Room"');
    expect(source).not.toContain('{ key: "candidates", label: "Candidates"');
  });
});
