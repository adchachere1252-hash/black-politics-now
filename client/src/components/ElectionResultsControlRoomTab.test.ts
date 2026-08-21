import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const source = readFileSync(join(process.cwd(), "client/src/components/ElectionResultsControlRoomTab.tsx"), "utf8");

describe("Election Results Control Room UI contract", () => {
  it("keeps source-backed human confirmation, conflicts, and activity visible in one protected Admin workspace", () => {
    expect(source).toContain("electionDay.resultsControlRoom.useQuery");
    expect(source).toContain("electionDay.confirmResult.useMutation");
    expect(source).toContain("Cited winner confirmation");
    expect(source).toContain("Source-conflict queue");
    expect(source).toContain("Immutable operator record");
    expect(source).toContain("A valid HTTP/HTTPS source is required");
  });
});
