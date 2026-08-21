import { describe, expect, it } from "vitest";
import { portraitResearchUnavailableMessage, resolvePortraitResearchOutcome, summarizePortraitResearchBatchItems } from "./agentDesk";

describe("Portrait Research batch progress", () => {
  it("keeps every private item status visible to an administrator", () => {
    const summary = summarizePortraitResearchBatchItems([
      { status: "queued" }, { status: "queued" }, { status: "in_progress" },
      { status: "ready_for_review" }, { status: "ready_for_review" }, { status: "blocked" },
    ]);
    expect(summary).toEqual({ queued: 2, in_progress: 1, ready_for_review: 2, blocked: 1, skipped: 0 });
  });

  it("does not label research without a source proposal as ready for portrait review", () => {
    expect(resolvePortraitResearchOutcome(false)).toMatchObject({
      status: "blocked",
      error: expect.stringContaining("Evidence needed"),
    });
    expect(resolvePortraitResearchOutcome(true)).toEqual({ status: "ready_for_review", error: null });
  });

  it("returns a reviewer-facing blocked explanation when a direct portrait-source package is unavailable", () => {
    const outcome = resolvePortraitResearchOutcome(false);
    expect(outcome.status).toBe("blocked");
    expect(outcome.error).toContain("Evidence needed");
  });

  it("gives an actionable manual recovery path when the research model is unavailable", () => {
    expect(portraitResearchUnavailableMessage()).toContain("official campaign");
    expect(portraitResearchUnavailableMessage()).toContain("No portrait was changed");
  });
});
