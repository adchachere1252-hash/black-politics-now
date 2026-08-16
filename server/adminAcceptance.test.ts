import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createAdminContext(): TrpcContext {
  return {
    user: { role: "admin", name: "Acceptance Reviewer" } as TrpcContext["user"],
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

describe("protected Admin workspace acceptance", () => {
  it("loads the read-only operational workspaces without approving, publishing, or mutating records", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const [podcastOperations, portraitTargets, pendingPortraits, latestPortraitBatch, readyPortraitResearch, commandCenter, worldOperations, recommendations, runs, settings, tasks, changeProposals] = await Promise.all([
      caller.podcast.operations(),
      caller.portraits.targets(),
      caller.portraits.submissions({ status: "pending" }),
      caller.portraits.latestResearchBatch(),
      caller.portraits.researchItems({ status: "ready_for_review" }),
      caller.electionDay.commandCenter(),
      caller.world.refreshOperations(),
      caller.agent.recommendations(),
      caller.agent.runs(),
      caller.agent.settings(),
      caller.agent.tasks(),
      caller.agent.changeProposals(),
    ]);

    expect(podcastOperations).toBeDefined();
    expect(Array.isArray(portraitTargets)).toBe(true);
    expect(Array.isArray(pendingPortraits)).toBe(true);
    expect(latestPortraitBatch === null || typeof latestPortraitBatch === "object").toBe(true);
    expect(Array.isArray(readyPortraitResearch.items)).toBe(true);
    expect(readyPortraitResearch.items.every((item: any) => item.status === "ready_for_review")).toBe(true);
    expect(commandCenter).toBeTruthy();
    expect(worldOperations).toBeDefined();
    expect(Array.isArray(recommendations)).toBe(true);
    expect(Array.isArray(runs)).toBe(true);
    expect(settings).toBeDefined();
    expect(Array.isArray(tasks)).toBe(true);
    expect(Array.isArray(changeProposals)).toBe(true);
  });

  it("keeps every pending portrait review package source-linked and non-applied", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const pendingPortraits = await caller.portraits.submissions({ status: "pending" }) as any[];

    for (const submission of pendingPortraits) {
      expect(submission.status).toBe("pending");
      expect(submission.imageUrl).toMatch(/^https:\/\//);
      expect(submission.sourceUrl).toMatch(/^https:\/\//);
      expect(submission.appliedPhotoUrl).toBeNull();
      expect(submission.reviewedAt).toBeNull();
    }
  });
});
