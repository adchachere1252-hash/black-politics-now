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

function createAdminContext(): TrpcContext {
  return {
    user: { role: "admin" } as TrpcContext["user"],
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

  it("returns source-backed Black Representation election records", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const records = await caller.election.blackRepresentationElections();
    expect(Array.isArray(records)).toBe(true);
    expect(records.length).toBeGreaterThan(0);
    for (const record of records as any[]) {
      expect(record.district).toEqual(expect.any(String));
      expect(record.stateCode).toMatch(/^[A-Z]{2}$/);
      expect(record.resultStatus).toMatch(/^(called|uncontested|too_close_to_call|upcoming)$/);
      expect(record.winnerName).toEqual(expect.any(String));
      expect(record.sourceUrl).toMatch(/^https:\/\//);
    }
  });

  it("returns complete Black Representation profiles with editorial context", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const profiles = await caller.election.cbc();
    expect(Array.isArray(profiles)).toBe(true);
    expect(profiles.length).toBeGreaterThan(100);
    for (const profile of profiles as any[]) {
      expect(profile.member).toEqual(expect.any(String));
      expect(profile.district).toEqual(expect.any(String));
      expect(profile.stateCode).toMatch(/^[A-Z]{2}$/);
      expect(profile.status).toEqual(expect.any(String));
    }
  });

  it("allows an administrator to safely re-save every article-backed election record", async () => {
    const publicCaller = appRouter.createCaller(createPublicContext());
    const adminCaller = appRouter.createCaller(createAdminContext());
    const records = await publicCaller.election.blackRepresentationElections();

    for (const record of records as any[]) {
      await expect(adminCaller.election.updateBlackRepresentationElection({
        id: record.id,
        data: { sourceUrl: record.sourceUrl },
      })).resolves.toEqual({ success: true });
    }

    const afterSave = await publicCaller.election.blackRepresentationElections();
    expect(afterSave).toHaveLength(records.length);
    expect(afterSave.every((record: any) => /^https:\/\//.test(record.sourceUrl))).toBe(true);
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
