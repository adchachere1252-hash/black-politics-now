import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

describe("election router", () => {
  it("returns scoreboard with senate and house counts", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const scoreboard = await caller.election.scoreboard();
    expect(scoreboard).toHaveProperty("senate");
    expect(scoreboard).toHaveProperty("house");
    expect(scoreboard.senate).toHaveProperty("dem");
    expect(scoreboard.senate).toHaveProperty("rep");
    expect(scoreboard.house).toHaveProperty("dem");
    expect(scoreboard.house).toHaveProperty("rep");
  });

  it("returns senate races as an array", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const races = await caller.election.senate();
    expect(Array.isArray(races)).toBe(true);
    if (races.length > 0) {
      expect(races[0]).toHaveProperty("stateName");
      expect(races[0]).toHaveProperty("rating");
    }
  });

  it("returns house races as an array", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const races = await caller.election.house();
    expect(Array.isArray(races)).toBe(true);
  });
});

describe("podcast router", () => {
  it("returns episodes as an array with expected fields", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const episodes = await caller.podcast.getEpisodes();
    expect(Array.isArray(episodes)).toBe(true);
    if (episodes.length > 0) {
      const ep = episodes[0] as any;
      expect(ep).toHaveProperty("date");
      expect(ep).toHaveProperty("segments");
      expect(Array.isArray(ep.segments)).toBe(true);
    }
  });
});
