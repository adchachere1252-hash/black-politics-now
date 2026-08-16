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

describe("news router", () => {
  it("returns a source-backed public newsroom feed with article metadata", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const feed = await caller.news.list({ page: 1, perPage: 5 });
    expect(Array.isArray(feed.posts)).toBe(true);
    expect(feed.total).toBeGreaterThanOrEqual(feed.posts.length);
    if (feed.posts.length > 0) {
      expect(feed.posts[0]).toHaveProperty("title");
      expect(feed.posts[0]).toHaveProperty("link");
    }
  });
});

describe("election router", () => {
  it("uses the original repository’s verified photo map only as a safe fallback", () => {
    expect(resolveRepositoryCandidatePhoto("Cory Booker")).toMatch(/^https:\/\/unitedstates\.github\.io\/images\/congress\/225x275\//);
    expect(resolveRepositoryCandidatePhoto("Everett Wess")).toMatch(/^https:\/\/ballotpedia\.org\/wiki\/images\//);
    expect(resolveRepositoryCandidatePhoto("Robert White")).toBe("https://dccouncil.gov/wp-content/uploads/2025/02/CM-Robert-White-Headshot.jpg");
    expect(resolveRepositoryCandidatePhoto("Chris Jones")).not.toEqual(expect.stringContaining("Arkansas_gubernatorial_candidate"));
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

    // U.S. Census historical apportionment table: 1960–2020 results.
    expect(APPORTIONMENT_HISTORY.Alabama).toEqual([8, 7, 7, 7, 7, 7, 7]);
    expect(APPORTIONMENT_HISTORY.California).toEqual([38, 43, 45, 52, 53, 53, 52]);
    expect(APPORTIONMENT_HISTORY.Texas).toEqual([23, 24, 27, 30, 32, 36, 38]);
    for (const index of APPORTIONMENT_YEARS.keys()) {
      const nationalSeats = Object.values(APPORTIONMENT_HISTORY).reduce((sum, stateSeries) => sum + stateSeries[index], 0);
      expect(nationalSeats).toBe(435);
    }
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

  it("keeps Podcast Ops operational diagnostics administrator-only and reports the full release gate", async () => {
    const publicCaller = appRouter.createCaller(createPublicContext());
    const adminCaller = appRouter.createCaller(createAdminContext());

    await expect(publicCaller.podcast.operations()).rejects.toMatchObject({ code: "FORBIDDEN" });
    const operations = await adminCaller.podcast.operations() as any;
    expect(operations).toMatchObject({
      recentEpisodes: expect.any(Array),
      recentRuns: expect.any(Array),
      preflights: expect.any(Array),
    });
    if (operations.latest) {
      expect(operations.latest).toMatchObject({
        date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        segmentCount: expect.any(Number),
        expectedSegments: expect.any(Number),
        scriptsReady: expect.any(Number),
        andrewReady: expect.any(Number),
        jennyReady: expect.any(Number),
        duplicateKeys: expect.any(Array),
        fullAudioReady: expect.any(Boolean),
        segments: expect.any(Array),
      });
      expect(operations.latest.segmentCount).toBeGreaterThanOrEqual(operations.latest.expectedSegments);
      expect(operations.latest.duplicateKeys).toEqual([]);
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

  it("keeps bounded agent task execution administrator-only and exposes review-safe task fields", async () => {
    const publicCaller = appRouter.createCaller(createPublicContext());
    const adminCaller = appRouter.createCaller(createAdminContext());

    await expect(publicCaller.agent.executeTask({ id: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(publicCaller.agent.runTaskResearchNow({ id: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    const tasks = await adminCaller.agent.tasks() as any[];
    for (const task of tasks) {
      expect(task.executionMode).toMatch(/^(human|agent)$/);
      expect(task.status).toMatch(/^(open|in_progress|blocked|ready_for_review|completed)$/);
    }
  });

  it("keeps proposed change sets and their review decisions administrator-only", async () => {
    const publicCaller = appRouter.createCaller(createPublicContext());
    const adminCaller = appRouter.createCaller(createAdminContext());

    await expect(publicCaller.agent.changeProposals()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(publicCaller.agent.reviewChangeProposal({ id: 1, status: "approved" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    const proposals = await adminCaller.agent.changeProposals();
    expect(proposals).toEqual(expect.any(Array));
    for (const proposal of proposals as any[]) {
      expect(proposal.kind).toMatch(/^(article_link|data_correction|editorial_copy|portrait_source)$/);
      expect(proposal.status).toMatch(/^(pending_review|approved|rejected|revision_requested)$/);
    }
  });

  it("keeps the command center and portrait research action administrator-only", async () => {
    const publicCaller = appRouter.createCaller(createPublicContext());
    const adminCaller = appRouter.createCaller(createAdminContext());

    await expect(publicCaller.electionDay.commandCenter()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(publicCaller.electionDay.runAgentResearch({ triageIndex: 0 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(publicCaller.electionDay.startRehearsal()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(publicCaller.electionDay.advanceRehearsal({ id: 1, step: "heartbeat" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(publicCaller.portraits.researchNow({ targetType: "senate", targetRecordId: 1, targetPhotoField: "candidate1", candidateName: "Example Candidate" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(adminCaller.electionDay.commandCenter()).resolves.toMatchObject({ coverage: expect.any(Object), candidatePerformance: expect.any(Array), triage: expect.any(Array), runbook: expect.any(Array), rehearsal: expect.anything() });
  });
});

describe("portrait review router", () => {
  it("keeps research, visual submissions, and approval decisions administrator-only while exposing review data to an administrator", async () => {
    const publicCaller = appRouter.createCaller(createPublicContext());
    const adminCaller = appRouter.createCaller(createAdminContext());
    const visualSubmission = {
      targetType: "house" as const,
      targetRecordId: 1,
      targetPhotoField: "candidate1" as const,
      candidateName: "Example Candidate",
      imageUrl: "https://official.example/images/example-candidate.jpg",
      sourceUrl: "https://official.example/about",
      provenanceType: "official_campaign" as const,
    };

    await expect(publicCaller.portraits.targets()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(publicCaller.portraits.submissions()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(publicCaller.portraits.researchItems({ status: "ready_for_review" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(publicCaller.portraits.submit(visualSubmission)).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(publicCaller.portraits.review({ id: 1, decision: "approved" })).rejects.toMatchObject({ code: "FORBIDDEN" });

    const [targets, pendingSubmissions, researchItems] = await Promise.all([
      adminCaller.portraits.targets(),
      adminCaller.portraits.submissions({ status: "pending" }),
      adminCaller.portraits.researchItems({ status: "ready_for_review" }),
    ]);
    expect(Array.isArray(targets)).toBe(true);
    expect(Array.isArray(pendingSubmissions)).toBe(true);
    expect(Array.isArray(researchItems.items)).toBe(true);
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

  it("returns a source-enriched 48-record calendar with current Cook Islands voting status", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const elections = await caller.world.elections() as any[];
    const cookIslands = elections.find((election) => election.countryCode === "CK");

    expect(elections).toHaveLength(48);
    const missingIssues = elections.filter((election) => {
      try {
        const issues = JSON.parse(election.keyIssues ?? "[]");
        return !Array.isArray(issues) || issues.length === 0;
      } catch {
        return true;
      }
    }).map((election) => ({ id: election.id, country: election.country, keyIssues: election.keyIssues }));
    expect(missingIssues).toEqual([]);
    expect(cookIslands).toMatchObject({ status: "Voting Today", electionDate: "2026-08-12" });
    expect(cookIslands.winner).toBeFalsy();
  });

  it("filters the World Elections calendar by country", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const japan = await caller.world.byCountry({ countryCode: "JP" });
    expect(japan.length).toBeGreaterThan(0);
    expect(japan.every((election: any) => election.countryCode === "JP")).toBe(true);
  });

  it("keeps dated World Elections refresh operations administrator-only and review-first", async () => {
    const publicCaller = appRouter.createCaller(createPublicContext());
    const adminCaller = appRouter.createCaller(createAdminContext());

    await expect(publicCaller.world.refreshOperations()).rejects.toMatchObject({ code: "FORBIDDEN" });
    const operations = await adminCaller.world.refreshOperations() as any;
    expect(operations).toMatchObject({
      settings: expect.objectContaining({ enabled: expect.any(Boolean) }),
      items: expect.any(Array),
      recentRuns: expect.any(Array),
    });
    expect(operations.settings.lastSummary).toMatch(/Checked \d+ dated World Elections records/);
  });
});

describe("candidate portrait review router", () => {
  it("keeps portrait targets and submission history administrator-only", async () => {
    const publicCaller = appRouter.createCaller(createPublicContext());
    const adminCaller = appRouter.createCaller(createAdminContext());

    await expect(publicCaller.portraits.targets()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(publicCaller.portraits.submissions()).rejects.toMatchObject({ code: "FORBIDDEN" });
    const [targets, submissions] = await Promise.all([
      adminCaller.portraits.targets(),
      adminCaller.portraits.submissions(),
    ]);
    expect(Array.isArray(targets)).toBe(true);
    expect(Array.isArray(submissions)).toBe(true);
    for (const target of targets as any[]) {
      expect(target).toMatchObject({
        targetType: expect.stringMatching(/^(senate|house|governor|black_representation)$/),
        targetRecordId: expect.any(Number),
        candidateName: expect.any(String),
      });
    }
  });
});
