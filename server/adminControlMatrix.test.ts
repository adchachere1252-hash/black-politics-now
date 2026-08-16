import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(role: "admin" | "user"): TrpcContext {
  return {
    user: { role, name: role === "admin" ? "Control Matrix Reviewer" : "Standard User" } as TrpcContext["user"],
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

describe("strict Admin control matrix", () => {
  it("loads every safe Admin workspace query and every portrait batch filter", async () => {
    const caller = appRouter.createCaller(createContext("admin"));
    const [podcast, commandCenter, worldOperations, batch, targets, pendingPortraits, recommendations, runs, settings, tasks, changes, queued, inProgress, ready, blocked, skipped] = await Promise.all([
      caller.podcast.operations(),
      caller.electionDay.commandCenter(),
      caller.world.refreshOperations(),
      caller.portraits.latestResearchBatch(),
      caller.portraits.targets(),
      caller.portraits.submissions({ status: "pending" }),
      caller.agent.recommendations(),
      caller.agent.runs(),
      caller.agent.settings(),
      caller.agent.tasks(),
      caller.agent.changeProposals(),
      caller.portraits.researchItems({ status: "queued" }),
      caller.portraits.researchItems({ status: "in_progress" }),
      caller.portraits.researchItems({ status: "ready_for_review" }),
      caller.portraits.researchItems({ status: "blocked" }),
      caller.portraits.researchItems({ status: "skipped" }),
    ]);

    expect(podcast).toBeDefined();
    expect(commandCenter).toBeTruthy();
    expect(worldOperations).toBeDefined();
    expect(batch === null || typeof batch === "object").toBe(true);
    expect(Array.isArray(targets)).toBe(true);
    expect(Array.isArray(pendingPortraits)).toBe(true);
    expect(Array.isArray(recommendations)).toBe(true);
    expect(Array.isArray(runs)).toBe(true);
    expect(settings).toBeDefined();
    expect(Array.isArray(tasks)).toBe(true);
    expect(Array.isArray(changes)).toBe(true);
    expect(queued.items.every((item: any) => item.status === "queued")).toBe(true);
    expect(inProgress.items.every((item: any) => item.status === "in_progress")).toBe(true);
    expect(ready.items.every((item: any) => item.status === "ready_for_review")).toBe(true);
    expect(blocked.items.every((item: any) => item.status === "blocked")).toBe(true);
    expect(skipped.items.every((item: any) => item.status === "skipped")).toBe(true);
  });

  it("blocks public-impact and operational mutations before they can run for a non-admin user", async () => {
    const caller = appRouter.createCaller(createContext("user"));

    await expect(caller.portraits.review({ id: 30001, decision: "approved" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.portraits.startAllResearch()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.election.updateSenate({ id: 1, data: { calledWinner: "Example", calledSourceUrl: "https://evidence.example/results" } })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.election.updateHouse({ id: 1, data: { candidate1Photo: "https://images.example/portrait.jpg" } })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.election.updateGovernor({ id: 30, data: { repPhoto: "https://images.example/portrait.jpg" } })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.election.updateReferendum({ id: 1, data: { status: "Updated" } })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.election.updateCbc({ id: 1, data: { notes: "Updated" } })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.election.updateBlackRepresentationElection({ id: 1, data: { notes: "Updated" } })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.world.runRefreshNow()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.electionDay.runAgentResearch({})).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.agent.reviewRecommendation({ id: 1, status: "approved" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.agent.assignRecommendation({ id: 1, owner: "Data Desk" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.agent.approveToTask({ id: 1, executionMode: "agent" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.agent.updateTask({ id: 1, status: "completed" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.agent.executeTask({ id: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.agent.reviewChangeProposal({ id: 1, status: "approved" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.agent.setPriorityMode({ enabled: true, durationHours: 4 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
