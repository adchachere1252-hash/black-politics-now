import { describe, expect, it } from "vitest";
import { summarizePortraitResearchBatchItems } from "./agentDesk";

describe("Portrait Research batch progress", () => {
  it("keeps every private item status visible to an administrator", () => {
    const summary = summarizePortraitResearchBatchItems([
      { status: "queued" }, { status: "queued" }, { status: "in_progress" },
      { status: "ready_for_review" }, { status: "ready_for_review" }, { status: "blocked" },
    ]);
    expect(summary).toEqual({ queued: 2, in_progress: 1, ready_for_review: 2, blocked: 1, skipped: 0 });
  });
});
