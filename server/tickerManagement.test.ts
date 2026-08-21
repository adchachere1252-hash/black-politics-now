import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(role: "admin" | "user"): TrpcContext {
  return { user: { role, name: role === "admin" ? "Ticker Manager Verifier" : "Standard User" } as TrpcContext["user"], req: { protocol: "https", headers: {} } as TrpcContext["req"], res: { clearCookie: () => {} } as unknown as TrpcContext["res"] };
}

describe("General-election ticker management", () => {
  it("exposes active source-backed ticker entries publicly but protects the Admin management list", async () => {
    const publicCaller = appRouter.createCaller(createContext("user"));
    const entries = await publicCaller.election.tickerEntries();
    expect(Array.isArray(entries)).toBe(true);
    await expect(publicCaller.election.tickerEntriesAdmin()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("blocks non-Admins before a ticker item can be created", async () => {
    const user = appRouter.createCaller(createContext("user"));
    await expect(user.election.createTickerEntry({ jurisdiction: "Example-1", chamber: "House", winnerName: "Example Candidate", winnerParty: "D", sourceLabel: "Example evidence", sourceUrl: "https://evidence.example/general" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects non-web evidence before an Admin ticker mutation can persist", async () => {
    const admin = appRouter.createCaller(createContext("admin"));
    await expect(admin.election.createTickerEntry({ jurisdiction: "Example-1", chamber: "House", winnerName: "Example Candidate", winnerParty: "D", sourceLabel: "Invalid protocol check", sourceUrl: "ftp://evidence.example/general" })).rejects.toBeTruthy();
  });
});
