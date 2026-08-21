import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(role: "admin" | "user"): TrpcContext {
  return {
    user: { role, name: role === "admin" ? "Results Control Room Verifier" : "Standard User" } as TrpcContext["user"],
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

describe("Election Results Control Room", () => {
  it("provides an Admin-only consolidated board with races, conflicts, and immutable activity fields", async () => {
    const admin = appRouter.createCaller(createContext("admin"));
    const board = await admin.electionDay.resultsControlRoom();
    expect(board).toBeTruthy();
    expect(Array.isArray(board?.races)).toBe(true);
    expect(Array.isArray(board?.sourceConflicts)).toBe(true);
    expect(Array.isArray(board?.activity)).toBe(true);
    expect(board?.summary).toEqual(expect.objectContaining({ total: expect.any(Number), reporting: expect.any(Number), called: expect.any(Number), conflicts: expect.any(Number) }));
    expect(board?.races[0]).toEqual(expect.objectContaining({ raceType: expect.any(String), jurisdiction: expect.any(String), reportingPct: expect.any(Number), confirmableCandidates: expect.any(Array) }));
  });

  it("blocks a non-admin user before the control room or confirmation workflow can access election records", async () => {
    const user = appRouter.createCaller(createContext("user"));
    await expect(user.electionDay.resultsControlRoom()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(user.electionDay.confirmResult({ raceType: "senate", raceId: 1, winnerName: "Example Candidate", winnerParty: "D", sourceLabel: "Example source", sourceUrl: "https://evidence.example/result" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(user.electionDay.addConfirmedWinnerToTicker({ raceType: "senate", raceId: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects an unmapped winner before it can change a public race or create an operator confirmation", async () => {
    const admin = appRouter.createCaller(createContext("admin"));
    const board = await admin.electionDay.resultsControlRoom();
    const race = board?.races.find((item) => item.confirmableCandidates.length > 0);
    expect(race).toBeTruthy();
    await expect(admin.electionDay.confirmResult({
      raceType: race!.raceType,
      raceId: race!.id,
      winnerName: "Unmapped Candidate",
      winnerParty: "D",
      sourceLabel: "Guardrail verification source",
      sourceUrl: "https://evidence.example/guardrail",
      addToTicker: true,
    })).rejects.toThrow("Choose a currently mapped Democratic, Republican, or Independent candidate");
  });

  it("refuses a ticker handoff unless the race already has a cited human confirmation", async () => {
    const admin = appRouter.createCaller(createContext("admin"));
    await expect(admin.electionDay.addConfirmedWinnerToTicker({ raceType: "senate", raceId: 999999 })).rejects.toThrow("Confirm a mapped winner with a cited source");
  });
});
