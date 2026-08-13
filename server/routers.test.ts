import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { APPORTIONMENT_HISTORY, APPORTIONMENT_YEARS } from "../client/src/data/atlasHistory";
import { LEWIS_MANIFEST } from "../client/src/data/atlasBoundaryManifest";
import { photoWithRepositoryFallback, resolveRepositoryCandidatePhoto } from "./candidatePhotoResolver";

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
  it("uses the original repository’s verified photo map only as a safe fallback", () => {
    expect(resolveRepositoryCandidatePhoto("Cory Booker")).toMatch(/^https:\/\/unitedstates\.github\.io\/images\/congress\/225x275\//);
    expect(resolveRepositoryCandidatePhoto("TBD — D Primary")).toBeNull();
    expect(photoWithRepositoryFallback("Cory Booker", "/manus-storage/editor-selected.jpg")).toBe("/manus-storage/editor-selected.jpg");
  });

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

  it("returns public election-map records with freshness metadata", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const [senate, house, governors] = await Promise.all([
      caller.election.senate(),
      caller.election.house(),
      caller.election.governors(),
    ]);
    const allRaces = [...senate, ...house, ...governors] as any[];
    expect(allRaces.length).toBeGreaterThan(0);
    expect(allRaces.some((race) => Boolean(race.updatedAt))).toBe(true);
  });

  it("returns house races as an array", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const races = await caller.election.house();
    expect(Array.isArray(races)).toBe(true);
  });

  it("returns Historical Atlas redistricting records with state context", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const states = await caller.election.redistricting();
    expect(Array.isArray(states)).toBe(true);
    expect(states.length).toBeGreaterThan(0);
    for (const state of states as any[]) {
      expect(state.stateName).toEqual(expect.any(String));
      expect(state.stateCode).toMatch(/^[A-Z]{2}$/);
      expect(state.status).toEqual(expect.any(String));
    }
  });

  it("restores the original Atlas 50-state apportionment series without conflating it with the active watchlist", () => {
    expect(Object.keys(APPORTIONMENT_HISTORY)).toHaveLength(50);
    expect(APPORTIONMENT_YEARS).toEqual([1963, 1973, 1983, 1993, 2003, 2013, 2023]);
    expect(APPORTIONMENT_HISTORY.Mississippi).toEqual([5, 5, 5, 5, 4, 4, 4]);
    expect(APPORTIONMENT_HISTORY.Alaska).toEqual([1, 1, 1, 1, 1, 1, 1]);
    expect(APPORTIONMENT_HISTORY.Texas.at(-1)).toBe(38);
  });

  it("preserves the original Atlas boundary-era archive for all 50 state histories", () => {
    expect(Object.keys(LEWIS_MANIFEST)).toHaveLength(50);
    expect(LEWIS_MANIFEST.Alabama.at(-1)).toMatchObject({ start: 119, end: 119 });
    expect(LEWIS_MANIFEST.Alaska.length).toBeGreaterThan(0);
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

  it("returns the article-backed Alabama and Michigan representation corrections with usable public statuses", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const profiles = await caller.election.cbc() as any[];
    const mercer = profiles.find((profile) => profile.member === "Maurice Mercer" && profile.district === "AL-6");
    const james = profiles.find((profile) => profile.member === "John James" && profile.stateCode === "MI");

    expect(mercer).toMatchObject({
      status: "advanced_to_general",
      primaryVotes: 5398,
      primaryVotePct: "64.20",
      generalOpponent: "Gary Palmer",
    });
    expect(mercer.sourceUrl).toMatch(/^https:\/\//);
    expect(james).toMatchObject({
      district: "MI-Gov",
      status: "advanced_to_general",
      generalOpponent: "Jocelyn Benson",
    });
    expect(james.sourceUrl).toMatch(/^https:\/\//);
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

  it("allows an administrator to re-save manual Senate, House, and Governor fields including notes", async () => {
    const publicCaller = appRouter.createCaller(createPublicContext());
    const adminCaller = appRouter.createCaller(createAdminContext());
    const [senate] = await publicCaller.election.senate();
    const [house] = await publicCaller.election.house();
    const [governor] = await publicCaller.election.governors();

    await expect(adminCaller.election.updateSenate({
      id: (senate as any).id,
      data: { rating: (senate as any).rating, notes: (senate as any).notes ?? null },
    })).resolves.toEqual({ success: true });
    await expect(adminCaller.election.updateHouse({
      id: (house as any).id,
      data: { rating: (house as any).rating, notes: (house as any).notes ?? null },
    })).resolves.toEqual({ success: true });
    await expect(adminCaller.election.updateGovernor({
      id: (governor as any).id,
      data: { rating: (governor as any).rating, notes: (governor as any).notes ?? null },
    })).resolves.toEqual({ success: true });
  });

  it("preserves audited House schedule and nominee corrections", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const races = await caller.election.house();
    const louisiana = (races as any[]).filter((race) => race.stateCode === "LA");
    const newJerseyEight = (races as any[]).find((race) => race.stateCode === "NJ" && race.district === 8);
    const vermontAtLarge = (races as any[]).find((race) => race.stateCode === "VT" && race.district === 0);

    expect(louisiana).toHaveLength(6);
    expect(louisiana.every((race) => race.primaryDate === "November 3, 2026")).toBe(true);
    expect(louisiana.every((race) => race.notes?.includes("open primary"))).toBe(true);
    expect(newJerseyEight).toMatchObject({ candidate1Name: "Rob Menendez", candidate2Name: "Aristotle Eliopoulos" });
    expect(vermontAtLarge).toMatchObject({ candidate1Name: "Becca Balint", candidate2Name: "Gerald Malloy" });
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
      expect(ep.verificationStatus).toBe("passed");
      expect(ep.fullEpisodeCdnUrl).toMatch(/^https:\/\//);
    }
  });

  it("returns every stored Daily Brief date to the archive with an honest completion state", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const [published, archive] = await Promise.all([
      caller.podcast.getEpisodes(),
      caller.podcast.getArchiveEpisodes(),
    ]);
    expect(archive.length).toBeGreaterThanOrEqual(published.length);
    for (const episode of archive as any[]) {
      expect(episode.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(episode.verificationStatus).toEqual(expect.any(String));
      expect(episode).toHaveProperty("fullEpisodeCdnUrl");
    }
  });
});

describe("Autonomous Research Desk router", () => {
  it("keeps the approval queue administrator-only and rejects underspecified public questions", async () => {
    const publicCaller = appRouter.createCaller(createPublicContext());
    const adminCaller = appRouter.createCaller(createAdminContext());

    await expect(publicCaller.agent.recommendations()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(publicCaller.agent.tasks()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(publicCaller.agent.setDefaultOwners({ editorialOwner: "Editorial Desk", dataQualityOwner: "Data Desk" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(publicCaller.agent.updateTask({ id: 1, status: "open" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(publicCaller.agent.chat({ question: "hi" })).rejects.toBeDefined();
    await expect(adminCaller.agent.settings()).resolves.toMatchObject({ id: 1, researchIntervalHours: 4, defaultEditorialOwner: "Editorial Desk", defaultDataQualityOwner: "Data Desk" });
    await expect(adminCaller.agent.recommendations({ status: "pending", priority: "high" })).resolves.toEqual(expect.any(Array));
    await expect(adminCaller.agent.tasks()).resolves.toEqual(expect.any(Array));
  });

  it("lets an administrator safely toggle the bounded election-night priority mode", async () => {
    const adminCaller = appRouter.createCaller(createAdminContext());
    const active = await adminCaller.agent.setPriorityMode({ enabled: true, durationHours: 1 });
    expect(active).toMatchObject({ priorityModeEnabled: true });
    expect(active?.priorityModeExpiresAt).toBeTruthy();

    const disabled = await adminCaller.agent.setPriorityMode({ enabled: false });
    expect(disabled).toMatchObject({ priorityModeEnabled: false, priorityModeExpiresAt: null });
  });
});

describe("world elections router", () => {
  it("returns the imported World Elections calendar with display fields", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const elections = await caller.world.elections();
    expect(Array.isArray(elections)).toBe(true);
    expect(elections.length).toBeGreaterThan(0);
    for (const election of elections as any[]) {
      expect(election.country).toEqual(expect.any(String));
      expect(election.countryCode).toMatch(/^[A-Z]{2}$/);
      expect(election.electionName).toEqual(expect.any(String));
      expect(election.status).toEqual(expect.any(String));
    }
  });

  it("filters the World Elections calendar by country", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const japan = await caller.world.byCountry({ countryCode: "JP" });
    expect(japan.length).toBeGreaterThan(0);
    expect(japan.every((election: any) => election.countryCode === "JP")).toBe(true);
  });
});
