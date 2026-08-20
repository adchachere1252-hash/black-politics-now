import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export function requireManualCallEvidence(data: Record<string, unknown>) {
  const isManualWinnerConfirmation = typeof data.calledWinner === "string" && data.calledWinner.trim().length > 0
    && (data.status === "Called" || typeof data.calledAt === "number");
  if (!isManualWinnerConfirmation) return;
  if (typeof data.calledSourceUrl !== "string") {
    throw new TRPCError({ code: "BAD_REQUEST", message: "A valid HTTPS or HTTP source URL is required before confirming a winner." });
  }
  try {
    const url = new URL(data.calledSourceUrl);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Unsupported protocol");
  } catch {
    throw new TRPCError({ code: "BAD_REQUEST", message: "A valid HTTPS or HTTP source URL is required before confirming a winner." });
  }
}

function publicNewsListPost(post: any) {
  return {
    id: post.id,
    date: post.date,
    link: post.link,
    title: post.title,
    excerpt: post.excerpt,
    jetpack_featured_media_url: post.jetpack_featured_media_url,
    _embedded: {
      "wp:featuredmedia": (post?._embedded?.["wp:featuredmedia"] ?? []).map((item: any) => ({ source_url: item.source_url })),
      "wp:term": (post?._embedded?.["wp:term"] ?? []).map((group: any[]) => group.map((item: any) => ({ id: item.id, name: item.name, slug: item.slug }))),
    },
  };
}
import { getArchiveEpisodesFormatted, getEpisodesFormatted, subscribeEmail, unsubscribeEmail, getPipelineRuns, getPodcastOperations } from "./podcastDb";
import { queuePodcastRecoveryRequest } from "./podcastRecovery";
import { getEasternDate } from "./dailyBriefSafeguards";
import { getPublicPrimaryContexts } from "./electionPrimaryContext";
import { buildPodcastShowNotes, getPodcastAnalytics, getPodcastShowNotes, recordPodcastPlay, savePodcastShowNotes } from "./podcastLegacy";
import { getDailyBriefQAScorecard } from "./dailyBriefBenchmark";
import { createGovernorRace, createHouseRace, createSenateRace, getAllSenateRaces, getAllHouseRaces, getAllGovernorRaces, getAllReferendums, getPublicElectionFreshness, getScoreboard, searchRaces, getHouseRacesByState, updateSenateRace, updateHouseRace, updateGovernorRace, updateGovernorCandidateLog, getGovernorCandidateLogHistory, updateSenateCandidateLog, updateHouseCandidateLog, getRaceCandidateLogHistory, updateReferendum } from "./electionDb";
import { fetchWithCache, getPersistedWordPressNews } from "./newsCache";
import { createBlackRepresentationContest, createBlackRepresentationProfile, getAllCbcMembers, getAllRedistrictingStates, getBlackRepresentationElections, removeBlackRepresentationElection, removeBlackRepresentationProfile, updateBlackRepresentationElection, updateCbcMember } from "./cbcDb";
import { getWorldElections, getWorldElectionsByCountry } from "./worldDb";
import { getWorldElectionRefreshOperations, runDatedWorldElectionRefresh } from "./worldElectionRefresh";
import { advanceElectionDayRehearsal, getElectionDayCommandCenter, getElectionSourceConflictQueue, getPostElectionReconciliationReport, startElectionDayRehearsal } from "./electionDayCommandCenter";
import { getPortraitSubmissionTargets, getPortraitSubmissions, portraitPhotoFields, portraitProvenanceTypes, portraitTargetTypes, reviewPortraitSubmission, submitPortraitSubmission } from "./portraitReview";
import { getLatestPortraitResearchItems } from "./agentDesk";
import { getLatestDailyOperationalSnapshot } from "./agentDailySummary";
import { answerReaderQuestion, approveRecommendationToTask, assignAgentRecommendation, executeAgentTaskWithChangeSet, getAgentChangeProposals, getAgentRecommendations, getAgentRuns, getAgentSettings, getAgentTasks, getLatestPortraitResearchBatch, reviewAgentChangeProposal, reviewAgentRecommendation, runAgentTaskResearchNow, runElectionDayCommandResearch, runPortraitResearchTask, runResearchDesk, setAgentDefaultOwners, setAgentPriorityMode, startAllPortraitResearch, updateAgentTask } from "./agentDesk";
import { getEngagementSummary, recordAnonymousPageView } from "./siteAnalytics";
import { createCertificationArchive, getCertificationArchivePreview, getCertifiedResultArchiveDetail, getCertifiedResultArchives } from "./certifiedResultsArchive";
import { getApprovedAtlasEditorialNotes, getAtlasEditorialNotes, getAtlasOperations, runAtlasPlaybackCheck, saveAtlasEditorialNote, setAtlasEditorialNoteApproval } from "./atlasOperations";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  siteAnalytics: router({
    trackPageView: publicProcedure
      .input(z.object({
        pagePath: z.string().regex(/^\//, "A page path must begin with '/'").max(512),
        sessionToken: z.string().min(16).max(128),
        deviceType: z.enum(["desktop", "tablet", "mobile"]),
        referrerHost: z.string().max(255).nullable().optional(),
      }))
      .mutation(async ({ input }) => recordAnonymousPageView(input)),
    engagementSummary: adminProcedure
      .input(z.object({ days: z.union([z.literal(7), z.literal(30)]).default(7) }).optional())
      .query(async ({ input }) => getEngagementSummary(input?.days ?? 7)),
  }),

  atlasOperations: router({
    publicNotes: publicProcedure
      .input(z.object({ stateCode: z.string().length(2), congress: z.number().int().min(89).max(119) }))
      .query(async ({ input }) => getApprovedAtlasEditorialNotes(input.stateCode, input.congress)),
    health: adminProcedure.query(async () => getAtlasOperations()),
    notes: adminProcedure.query(async () => getAtlasEditorialNotes()),
    runPlaybackCheck: adminProcedure.mutation(async ({ ctx }) => runAtlasPlaybackCheck(ctx.user.name ?? "Administrator")),
    saveNote: adminProcedure
      .input(z.object({ id: z.number().int().positive().optional(), stateCode: z.string().regex(/^[A-Za-z]{2}$/), congress: z.number().int().min(89).max(119), title: z.string().min(4).max(200), body: z.string().min(20).max(5000), sourceLabel: z.string().min(2).max(160), sourceUrl: z.string().url().max(2048) }))
      .mutation(async ({ input, ctx }) => saveAtlasEditorialNote({ ...input, savedBy: ctx.user.name ?? "Administrator" })),
    setNoteApproval: adminProcedure
      .input(z.object({ id: z.number().int().positive(), approved: z.boolean() }))
      .mutation(async ({ input, ctx }) => setAtlasEditorialNoteApproval({ ...input, reviewedBy: ctx.user.name ?? "Administrator" })),
  }),

  // ─── Podcast ─────────────────────────────────────────────────────────────────
  podcast: router({
    getEpisodes: publicProcedure.query(async () => getEpisodesFormatted()),
    getArchiveEpisodes: publicProcedure.query(async () => getArchiveEpisodesFormatted()),
    subscribe: publicProcedure
      .input(z.object({ email: z.string().email(), name: z.string().max(128).optional() }))
      .mutation(async ({ input }) => { await subscribeEmail(input); return { success: true }; }),
    unsubscribe: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => { await unsubscribeEmail(input.email); return { success: true }; }),
    trackPlay: publicProcedure
      .input(z.object({ episodeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), segmentKey: z.string().max(64).nullable().optional(), segmentLabel: z.string().max(128).nullable().optional(), playbackKind: z.enum(["episode", "segment"]), voice: z.enum(["andrew", "jenny"]), sessionToken: z.string().min(16).max(128) }))
      .mutation(async ({ input }) => recordPodcastPlay(input)),
    analytics: adminProcedure
      .input(z.object({ days: z.union([z.literal(7), z.literal(30)]).default(30) }).optional())
      .query(async ({ input }) => getPodcastAnalytics(input?.days ?? 30)),
    qaScorecard: adminProcedure.query(async () => getDailyBriefQAScorecard()),
    getShowNotes: publicProcedure
      .input(z.object({ episodeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }))
      .query(async ({ input }) => getPodcastShowNotes(input.episodeDate)),
    buildShowNotes: adminProcedure
      .input(z.object({ episodeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }))
      .mutation(async ({ input, ctx }) => buildPodcastShowNotes(input.episodeDate, ctx.user.name ?? "Administrator")),
    saveShowNotes: adminProcedure
      .input(z.object({ episodeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), title: z.string().min(1).max(256), summary: z.string().min(1).max(2000), showNotes: z.string().min(1).max(12000), keywords: z.string().max(2000) }))
      .mutation(async ({ input, ctx }) => savePodcastShowNotes({ ...input, updatedBy: ctx.user.name ?? "Administrator" })),
    pipelineRuns: protectedProcedure.query(async () => getPipelineRuns()),
    operations: adminProcedure.query(async () => getPodcastOperations()),
    requestRecovery: adminProcedure
      .input(z.object({ episodeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), note: z.string().max(500).optional() }))
      .mutation(async ({ input, ctx }) => queuePodcastRecoveryRequest({ episodeDate: input.episodeDate, note: input.note, requestedBy: ctx.user.name ?? "Administrator" })),
    requestCurrentGuardedRecovery: adminProcedure
      .mutation(async ({ ctx }) => queuePodcastRecoveryRequest({
        episodeDate: getEasternDate(),
        recoveryMode: "full_guard",
        requestedBy: ctx.user.name ?? "Administrator",
        note: "Admin requested the current-date guarded recovery from Podcast Ops.",
      })),
  }),

  // ─── Election ────────────────────────────────────────────────────────────────
  election: router({
    senate: publicProcedure.query(async () => getAllSenateRaces()),
    house: publicProcedure.query(async () => getAllHouseRaces()),
    houseByState: publicProcedure
      .input(z.object({ stateCode: z.string().length(2) }))
      .query(async ({ input }) => getHouseRacesByState(input.stateCode)),
    governors: publicProcedure.query(async () => getAllGovernorRaces()),
    referendums: publicProcedure.query(async () => getAllReferendums()),
    scoreboard: publicProcedure.query(async () => getScoreboard()),
    freshness: publicProcedure.query(async () => getPublicElectionFreshness()),
    primaryContexts: publicProcedure.query(async () => getPublicPrimaryContexts()),
    search: publicProcedure
      .input(z.object({ query: z.string().min(1).max(100) }))
      .query(async ({ input }) => searchRaces(input.query)),
    // Admin mutations
    updateSenate: adminProcedure
      .input(z.object({ id: z.number(), data: z.record(z.string(), z.unknown()) }))
      .mutation(async ({ input }) => { requireManualCallEvidence(input.data); await updateSenateRace(input.id, input.data as any); return { success: true }; }),
    updateHouse: adminProcedure
      .input(z.object({ id: z.number(), data: z.record(z.string(), z.unknown()) }))
      .mutation(async ({ input }) => { requireManualCallEvidence(input.data); await updateHouseRace(input.id, input.data as any); return { success: true }; }),
    updateGovernor: adminProcedure
      .input(z.object({ id: z.number(), data: z.record(z.string(), z.unknown()) }))
      .mutation(async ({ input }) => { requireManualCallEvidence(input.data); await updateGovernorRace(input.id, input.data as any); return { success: true }; }),
    governorCandidateHistory: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input }) => getGovernorCandidateLogHistory(input.id)),
    updateGovernorCandidateLog: adminProcedure
      .input(z.object({
        id: z.number().int().positive(),
        demCandidate: z.string().min(2).max(128),
        repCandidate: z.string().min(2).max(128),
        demPreviousOffice: z.string().max(256).optional().nullable(),
        repPreviousOffice: z.string().max(256).optional().nullable(),
        candidateSourceUrl: z.string().url().max(2048),
        candidateSourceLabel: z.string().min(2).max(256),
        editorNote: z.string().max(4000).optional().nullable(),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateGovernorCandidateLog({ ...input, editorName: ctx.user.name ?? "Administrator" });
        return { success: true };
      }),
    senateCandidateHistory: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input }) => getRaceCandidateLogHistory("senate", input.id)),
    houseCandidateHistory: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input }) => getRaceCandidateLogHistory("house", input.id)),
    updateSenateCandidateLog: adminProcedure
      .input(z.object({
        id: z.number().int().positive(),
        candidate1Name: z.string().min(2).max(128),
        candidate1Party: z.enum(["D", "R", "I", "L", "G"]),
        candidate2Name: z.string().min(2).max(128),
        candidate2Party: z.enum(["D", "R", "I", "L", "G"]),
        candidateSourceUrl: z.string().url().max(2048),
        candidateSourceLabel: z.string().min(2).max(256),
        editorNote: z.string().max(4000).optional().nullable(),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateSenateCandidateLog({ ...input, editorName: ctx.user.name ?? "Administrator" });
        return { success: true };
      }),
    updateHouseCandidateLog: adminProcedure
      .input(z.object({
        id: z.number().int().positive(),
        candidate1Name: z.string().min(2).max(128),
        candidate1Party: z.enum(["D", "R", "I", "L", "G"]),
        candidate2Name: z.string().min(2).max(128),
        candidate2Party: z.enum(["D", "R", "I", "L", "G"]),
        candidateSourceUrl: z.string().url().max(2048),
        candidateSourceLabel: z.string().min(2).max(256),
        editorNote: z.string().max(4000).optional().nullable(),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateHouseCandidateLog({ ...input, editorName: ctx.user.name ?? "Administrator" });
        return { success: true };
      }),
    createSenateRace: adminProcedure
      .input(z.object({ stateCode: z.string().length(2), stateName: z.string().min(2).max(64), candidate1Name: z.string().min(2).max(128), candidate1Party: z.enum(["D", "R", "I", "L", "G"]), candidate2Name: z.string().min(2).max(128), candidate2Party: z.enum(["D", "R", "I", "L", "G"]), rating: z.enum(["Solid D", "Likely D", "Lean D", "Toss-up", "Lean R", "Likely R", "Solid R", "Safe D", "Safe R"]), sourceUrl: z.string().url().max(2048), sourceLabel: z.string().min(2).max(256), editorNote: z.string().max(4000).optional().nullable() }))
      .mutation(async ({ ctx, input }) => createSenateRace({ ...input, editorName: ctx.user.name ?? "Administrator" })),
    createHouseRace: adminProcedure
      .input(z.object({ stateCode: z.string().length(2), stateName: z.string().min(2).max(64), district: z.number().int().min(0).max(99), districtLabel: z.string().min(2).max(16).optional(), candidate1Name: z.string().min(2).max(128), candidate1Party: z.enum(["D", "R", "I", "L", "G"]), candidate2Name: z.string().min(2).max(128), candidate2Party: z.enum(["D", "R", "I", "L", "G"]), rating: z.enum(["Solid D", "Likely D", "Lean D", "Toss-up", "Lean R", "Likely R", "Solid R", "Safe D", "Safe R"]), sourceUrl: z.string().url().max(2048), sourceLabel: z.string().min(2).max(256), editorNote: z.string().max(4000).optional().nullable() }))
      .mutation(async ({ ctx, input }) => createHouseRace({ ...input, editorName: ctx.user.name ?? "Administrator" })),
    createGovernorRace: adminProcedure
      .input(z.object({ stateCode: z.string().length(2), stateName: z.string().min(2).max(64), candidate1Name: z.string().min(2).max(128), candidate1Party: z.literal("D"), candidate2Name: z.string().min(2).max(128), candidate2Party: z.literal("R"), rating: z.enum(["Solid D", "Likely D", "Lean D", "Toss-up", "Lean R", "Likely R", "Solid R", "Safe D", "Safe R"]), sourceUrl: z.string().url().max(2048), sourceLabel: z.string().min(2).max(256), editorNote: z.string().max(4000).optional().nullable() }))
      .mutation(async ({ ctx, input }) => createGovernorRace({ ...input, editorName: ctx.user.name ?? "Administrator" })),
    updateReferendum: adminProcedure
      .input(z.object({ id: z.number(), data: z.record(z.string(), z.unknown()) }))
      .mutation(async ({ input }) => { await updateReferendum(input.id, input.data as any); return { success: true }; }),
    // CBC
    cbc: publicProcedure.query(async () => getAllCbcMembers()),
    blackRepresentationElections: publicProcedure
      .input(z.object({ stateCode: z.string().length(2).optional() }).optional())
      .query(async ({ input }) => getBlackRepresentationElections(input?.stateCode)),
    updateCbc: adminProcedure
      .input(z.object({ id: z.number(), data: z.record(z.string(), z.unknown()) }))
      .mutation(async ({ input }) => { await updateCbcMember(input.id, input.data as any); return { success: true }; }),
    updateBlackRepresentationElection: adminProcedure
      .input(z.object({ id: z.number(), data: z.record(z.string(), z.unknown()) }))
      .mutation(async ({ input }) => { await updateBlackRepresentationElection(input.id, input.data as any); return { success: true }; }),
    createBlackRepresentationProfile: adminProcedure
      .input(z.object({
        district: z.string().min(1).max(16), member: z.string().min(2).max(128), party: z.enum(["D", "R", "I"]),
        state: z.string().min(2).max(64), stateCode: z.string().length(2), chamber: z.enum(["house", "senate", "governor"]),
        status: z.enum(["running", "retiring", "resigned", "withdrawn", "deceased", "lost_primary", "running_for_governor", "running_for_senate", "not_up_2026", "challenger", "advanced_to_general", "in_runoff", "too_close_to_call", "elected", "won_general", "lost_general"]),
        roleType: z.enum(["incumbent", "nominee", "challenger", "former_member", "delegate"]), isCurrentMember: z.boolean(), upIn2026: z.boolean(),
        raceStage: z.enum(["pre_primary", "primary", "runoff", "general", "special", "called", "not_up"]),
        sourceUrl: z.string().url().max(2048), sourceLabel: z.string().min(2).max(160), additionNote: z.string().max(4000).optional().nullable(),
      }))
      .mutation(async ({ ctx, input }) => createBlackRepresentationProfile({ ...input, addedBy: ctx.user.name ?? "Administrator" })),
    createBlackRepresentationContest: adminProcedure
      .input(z.object({
        district: z.string().min(1).max(16), state: z.string().min(2).max(64), stateCode: z.string().length(2), chamber: z.enum(["house", "senate", "governor"]),
        electionType: z.enum(["primary", "runoff", "general", "special"]), resultStatus: z.enum(["called", "too_close_to_call", "upcoming", "uncontested", "withdrawn"]),
        winnerName: z.string().max(128).optional().nullable(), winnerParty: z.string().max(8).optional().nullable(), runnerUpName: z.string().max(128).optional().nullable(), runnerUpParty: z.string().max(8).optional().nullable(),
        generalOpponent: z.string().max(128).optional().nullable(), electionDate: z.string().max(32).optional().nullable(),
        sourceUrl: z.string().url().max(2048), sourceLabel: z.string().min(2).max(160), additionNote: z.string().max(4000).optional().nullable(),
      }))
      .mutation(async ({ ctx, input }) => createBlackRepresentationContest({ ...input, addedBy: ctx.user.name ?? "Administrator" })),
    removeCbc: adminProcedure
      .input(z.object({ id: z.number().int().positive(), reason: z.string().min(12).max(1200), sourceUrl: z.string().url().max(2048).optional() }))
      .mutation(async ({ input, ctx }) => removeBlackRepresentationProfile({ ...input, removedBy: ctx.user.name ?? "Administrator" })),
    removeBlackRepresentationElection: adminProcedure
      .input(z.object({ id: z.number().int().positive(), reason: z.string().min(12).max(1200), sourceUrl: z.string().url().max(2048).optional() }))
      .mutation(async ({ input, ctx }) => removeBlackRepresentationElection({ ...input, removedBy: ctx.user.name ?? "Administrator" })),
    redistricting: publicProcedure.query(async () => getAllRedistrictingStates()),
  }),

  electionDay: router({
    commandCenter: adminProcedure.query(async () => getElectionDayCommandCenter()),
    sourceConflicts: adminProcedure.query(async () => getElectionSourceConflictQueue()),
    reconciliation: adminProcedure.query(async () => getPostElectionReconciliationReport()),
    runAgentResearch: adminProcedure
      .input(z.object({ triageIndex: z.number().int().min(0).max(11).optional() }).optional())
      .mutation(async ({ input, ctx }) => runElectionDayCommandResearch(input?.triageIndex, ctx.user.name ?? "Administrator")),
    startRehearsal: adminProcedure.mutation(async ({ ctx }) => startElectionDayRehearsal(ctx.user.name ?? "Administrator")),
    advanceRehearsal: adminProcedure
      .input(z.object({ id: z.number().int(), step: z.enum(["heartbeat", "triage", "research", "review"]), notes: z.string().max(500).optional() }))
      .mutation(async ({ input }) => advanceElectionDayRehearsal(input.id, input.step, input.notes)),
  }),

  certifiedResultsArchive: router({
    list: publicProcedure.query(async () => getCertifiedResultArchives()),
    detail: publicProcedure
      .input(z.object({ archiveKey: z.string().min(3).max(96) }))
      .query(async ({ input }) => getCertifiedResultArchiveDetail(input.archiveKey)),
    preview: adminProcedure.query(async () => getCertificationArchivePreview()),
    create: adminProcedure
      .input(z.object({
        archiveKey: z.string().min(3).max(96),
        title: z.string().min(3).max(256),
        certificationAuthority: z.string().min(3).max(256),
        certificationSourceUrl: z.string().url().max(2048),
        certificationStatement: z.string().min(12).max(4000),
        certifiedAt: z.date(),
      }))
      .mutation(async ({ input, ctx }) => createCertificationArchive({ ...input, certifiedBy: ctx.user.name ?? "Administrator" })),
  }),

  // ─── World Elections ─────────────────────────────────────────────────────────
  world: router({
    elections: publicProcedure.query(async () => getWorldElections()),
    byCountry: publicProcedure
      .input(z.object({ countryCode: z.string().length(2) }))
      .query(async ({ input }) => getWorldElectionsByCountry(input.countryCode)),
    refreshOperations: adminProcedure.query(async () => getWorldElectionRefreshOperations()),
    runRefreshNow: adminProcedure.mutation(async () => runDatedWorldElectionRefresh()),
  }),

  portraits: router({
    targets: adminProcedure.query(async () => getPortraitSubmissionTargets()),
    submissions: adminProcedure
      .input(z.object({ status: z.enum(["pending", "approved", "rejected"]).optional() }).optional())
      .query(async ({ input }) => getPortraitSubmissions(input?.status)),
    submit: adminProcedure
      .input(z.object({
        targetType: z.enum(portraitTargetTypes),
        targetRecordId: z.number().int().positive(),
        targetPhotoField: z.enum(portraitPhotoFields),
        candidateName: z.string().min(2).max(128),
        imageUrl: z.string().url().max(2048),
        sourceUrl: z.string().url().max(2048),
        provenanceType: z.enum(portraitProvenanceTypes),
        submissionNote: z.string().max(2000).optional(),
      }))
      .mutation(async ({ input, ctx }) => submitPortraitSubmission(input, ctx.user.name || "Administrator")),
    review: adminProcedure
      .input(z.object({ id: z.number().int().positive(), decision: z.enum(["approved", "rejected"]), reviewNote: z.string().max(2000).optional() }))
      .mutation(async ({ input, ctx }) => reviewPortraitSubmission(input.id, input.decision, ctx.user.name || "Administrator", input.reviewNote)),
    researchNow: adminProcedure
      .input(z.object({ targetType: z.enum(portraitTargetTypes), targetRecordId: z.number().int().positive(), targetPhotoField: z.enum(portraitPhotoFields), candidateName: z.string().min(2).max(128), sourceLead: z.string().url().max(2048).optional() }))
      .mutation(async ({ input, ctx }) => runPortraitResearchTask(input, ctx.user.name || "Administrator")),
    latestResearchBatch: adminProcedure.query(async () => getLatestPortraitResearchBatch()),
    researchItems: adminProcedure
      .input(z.object({ status: z.enum(["queued", "in_progress", "ready_for_review", "blocked", "skipped"]).optional() }).optional())
      .query(async ({ input }) => getLatestPortraitResearchItems(input?.status)),
    startAllResearch: adminProcedure.mutation(async ({ ctx }) => startAllPortraitResearch(ctx.user.name || "Administrator")),
  }),

  // ─── News (WordPress proxy) ──────────────────────────────────────────────────
  news: router({
    list: publicProcedure
      .input(z.object({ page: z.number().min(1).default(1), perPage: z.number().min(1).max(20).default(10), category: z.string().optional() }).optional())
      .query(async ({ input }) => {
        const { page = 1, perPage = 10, category } = input ?? {};
        let url = `https://blkpoliticsnow.com/wp-json/wp/v2/posts?_embed&per_page=${perPage}&page=${page}`;
        if (category) url += `&categories=${category}`;
        // The scheduled refresh persists the original WordPress feed every four hours.
        // Serve that source-only snapshot first for the landing stream so a transient
        // upstream TLS delay never holds up the public newsroom shell.
        if (!category && page === 1) {
          const snapshot = await getPersistedWordPressNews();
          if (snapshot) return { ...snapshot, posts: snapshot.posts.slice(0, perPage).map(publicNewsListPost) };
        }
        try {
          const { data: posts, headers } = await fetchWithCache(url);
          const total = parseInt(headers.get("X-WP-Total") ?? "0") || posts.length;
          const totalPages = parseInt(headers.get("X-WP-TotalPages") ?? "0") || 1;
          return { posts: posts.map(publicNewsListPost), total, totalPages };
        } catch {
          // The daily WordPress refresh stores an authenticated source snapshot.
          // Only use it for the unfiltered landing feed when the live source is temporarily unavailable.
          if (!category) {
            const fallback = await getPersistedWordPressNews();
            if (fallback) return { ...fallback, posts: fallback.posts.slice(0, perPage).map(publicNewsListPost) };
          }
          return { posts: [], total: 0, totalPages: 0 };
        }
      }),
    categories: publicProcedure.query(async () => {
      try {
        const { data } = await fetchWithCache("https://blkpoliticsnow.com/wp-json/wp/v2/categories?per_page=50");
        return data;
      } catch { return []; }
    }),
    search: publicProcedure
      .input(z.object({ query: z.string().min(1).max(100) }))
      .query(async ({ input }) => {
        try {
          const { data } = await fetchWithCache(`https://blkpoliticsnow.com/wp-json/wp/v2/posts?_embed&search=${encodeURIComponent(input.query)}&per_page=10`);
          return data;
        } catch { return []; }
      }),
  }),

  // ─── Unified Search ─────────────────────────────────────────────────────────
  search: router({
    all: publicProcedure
      .input(z.object({ query: z.string().min(1).max(100) }))
      .query(async ({ input }) => {
        const q = input.query;
        const [electionResults, newsResults, episodes] = await Promise.all([
          searchRaces(q),
          (async () => {
            try {
              const { data } = await fetchWithCache(`https://blkpoliticsnow.com/wp-json/wp/v2/posts?_embed&search=${encodeURIComponent(q)}&per_page=5`);
              return data;
            } catch { return []; }
          })(),
          getEpisodesFormatted(),
        ]);
        // Filter podcast episodes by segment labels
        const ql = q.toLowerCase();
        const podcastResults = (episodes as any[]).filter(ep =>
          ep.segments.some((s: any) => s.label.toLowerCase().includes(ql) || (s.script && s.script.toLowerCase().includes(ql)))
        ).slice(0, 5).map((ep: any) => ({
          date: ep.date,
          day: ep.day,
          matchingSegments: ep.segments.filter((s: any) => s.label.toLowerCase().includes(ql) || (s.script && s.script.toLowerCase().includes(ql))).map((s: any) => ({
            ...s,
            scriptSnippet: s.script ? getSnippet(s.script, q) : null,
          })),
        }));
        return { elections: electionResults, news: newsResults, podcast: podcastResults };
      }),
  }),

  // ─── Autonomous Research Desk ──────────────────────────────────────────────
  agent: router({
    chat: publicProcedure
      .input(z.object({
        question: z.string().min(3).max(1200),
        history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(1200) })).max(6).optional(),
      }))
      .mutation(async ({ input }) => answerReaderQuestion(input)),
    recommendations: adminProcedure
      .input(z.object({
        status: z.enum(["pending", "approved", "dismissed", "deferred"]).optional(),
        category: z.enum(["data_quality", "editorial", "coverage_gap", "source_watch", "product"]).optional(),
        priority: z.enum(["high", "medium", "low"]).optional(),
        owner: z.string().min(1).max(128).optional(),
      }).optional())
      .query(async ({ input }) => getAgentRecommendations(input)),
    runs: adminProcedure.query(async () => getAgentRuns()),
    dailySummary: adminProcedure.query(async () => getLatestDailyOperationalSnapshot()),
    settings: adminProcedure.query(async () => getAgentSettings()),
    tasks: adminProcedure.query(async () => getAgentTasks()),
    changeProposals: adminProcedure
      .input(z.object({ status: z.enum(["pending_review", "approved", "rejected", "revision_requested"]).optional() }).optional())
      .query(async ({ input }) => getAgentChangeProposals(input?.status)),
    runNow: adminProcedure.mutation(async () => runResearchDesk("admin")),
    reviewRecommendation: adminProcedure
      .input(z.object({ id: z.number(), status: z.enum(["approved", "dismissed", "deferred"]) }))
      .mutation(async ({ input, ctx }) => {
        await reviewAgentRecommendation(input.id, input.status, ctx.user.name ?? "Administrator");
        return { success: true };
      }),
    assignRecommendation: adminProcedure
      .input(z.object({ id: z.number(), owner: z.string().min(2).max(128) }))
      .mutation(async ({ input, ctx }) => {
        await assignAgentRecommendation(input.id, input.owner, ctx.user.name ?? "Administrator");
        return { success: true };
      }),
    approveToTask: adminProcedure
      .input(z.object({
        id: z.number(),
        owner: z.string().min(2).max(128).optional(),
        dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        executionMode: z.enum(["human", "agent"]).default("human"),
        executionScope: z.string().max(5000).optional(),
        sourceRequirements: z.string().max(2000).optional(),
      }))
      .mutation(async ({ input, ctx }) => approveRecommendationToTask(input.id, input.owner, input.dueDate, ctx.user.name ?? "Administrator", input.executionMode, input.executionScope, input.sourceRequirements)),
    updateTask: adminProcedure
      .input(z.object({ id: z.number(), status: z.enum(["open", "in_progress", "blocked", "ready_for_review", "completed"]), dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional() }))
      .mutation(async ({ input }) => { await updateAgentTask(input.id, input.status, input.dueDate); return { success: true }; }),
    executeTask: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => executeAgentTaskWithChangeSet(input.id, ctx.user.name ?? "Administrator")),
    runTaskResearchNow: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => runAgentTaskResearchNow(input.id, ctx.user.name ?? "Administrator")),
    reviewChangeProposal: adminProcedure
      .input(z.object({ id: z.number(), status: z.enum(["approved", "rejected", "revision_requested"]), reviewerNotes: z.string().max(2000).optional() }))
      .mutation(async ({ input, ctx }) => reviewAgentChangeProposal(input.id, input.status, input.reviewerNotes, ctx.user.name ?? "Administrator")),
    setDefaultOwners: adminProcedure
      .input(z.object({ editorialOwner: z.string().min(2).max(128), dataQualityOwner: z.string().min(2).max(128) }))
      .mutation(async ({ input }) => setAgentDefaultOwners(input.editorialOwner, input.dataQualityOwner)),
    setPriorityMode: adminProcedure
      .input(z.object({ enabled: z.boolean(), durationHours: z.number().int().min(1).max(24).optional() }))
      .mutation(async ({ input }) => setAgentPriorityMode(input.enabled, input.durationHours)),
  }),
});

function getSnippet(text: string, query: string, contextLen = 80): string {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text.slice(0, contextLen * 2) + "...";
  const start = Math.max(0, idx - contextLen);
  const end = Math.min(text.length, idx + query.length + contextLen);
  return (start > 0 ? "..." : "") + text.slice(start, end) + (end < text.length ? "..." : "");
}

export type AppRouter = typeof appRouter;
