import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getArchiveEpisodesFormatted, getEpisodesFormatted, subscribeEmail, unsubscribeEmail, getPipelineRuns, getPodcastOperations } from "./podcastDb";
import { getAllSenateRaces, getAllHouseRaces, getAllGovernorRaces, getAllReferendums, getScoreboard, searchRaces, getHouseRacesByState, updateSenateRace, updateHouseRace, updateGovernorRace, updateReferendum } from "./electionDb";
import { fetchWithCache, getPersistedWordPressNews } from "./newsCache";
import { getAllCbcMembers, getAllRedistrictingStates, getBlackRepresentationElections, updateBlackRepresentationElection, updateCbcMember } from "./cbcDb";
import { getWorldElections, getWorldElectionsByCountry } from "./worldDb";
import { getWorldElectionRefreshOperations, runDatedWorldElectionRefresh } from "./worldElectionRefresh";
import { getPortraitSubmissionTargets, getPortraitSubmissions, portraitPhotoFields, portraitProvenanceTypes, portraitTargetTypes, reviewPortraitSubmission, submitPortraitSubmission } from "./portraitReview";
import { answerReaderQuestion, approveRecommendationToTask, assignAgentRecommendation, executeAgentTask, getAgentRecommendations, getAgentRuns, getAgentSettings, getAgentTasks, reviewAgentRecommendation, runResearchDesk, setAgentDefaultOwners, setAgentPriorityMode, updateAgentTask } from "./agentDesk";

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
    pipelineRuns: protectedProcedure.query(async () => getPipelineRuns()),
    operations: adminProcedure.query(async () => getPodcastOperations()),
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
    search: publicProcedure
      .input(z.object({ query: z.string().min(1).max(100) }))
      .query(async ({ input }) => searchRaces(input.query)),
    // Admin mutations
    updateSenate: adminProcedure
      .input(z.object({ id: z.number(), data: z.record(z.string(), z.unknown()) }))
      .mutation(async ({ input }) => { await updateSenateRace(input.id, input.data as any); return { success: true }; }),
    updateHouse: adminProcedure
      .input(z.object({ id: z.number(), data: z.record(z.string(), z.unknown()) }))
      .mutation(async ({ input }) => { await updateHouseRace(input.id, input.data as any); return { success: true }; }),
    updateGovernor: adminProcedure
      .input(z.object({ id: z.number(), data: z.record(z.string(), z.unknown()) }))
      .mutation(async ({ input }) => { await updateGovernorRace(input.id, input.data as any); return { success: true }; }),
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
    redistricting: publicProcedure.query(async () => getAllRedistrictingStates()),
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
          if (snapshot) return { ...snapshot, posts: snapshot.posts.slice(0, perPage) };
        }
        try {
          const { data: posts, headers } = await fetchWithCache(url);
          const total = parseInt(headers.get("X-WP-Total") ?? "0") || posts.length;
          const totalPages = parseInt(headers.get("X-WP-TotalPages") ?? "0") || 1;
          return { posts, total, totalPages };
        } catch {
          // The daily WordPress refresh stores an authenticated source snapshot.
          // Only use it for the unfiltered landing feed when the live source is temporarily unavailable.
          if (!category) {
            const fallback = await getPersistedWordPressNews();
            if (fallback) return fallback;
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
    settings: adminProcedure.query(async () => getAgentSettings()),
    tasks: adminProcedure.query(async () => getAgentTasks()),
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
      .mutation(async ({ input, ctx }) => executeAgentTask(input.id, ctx.user.name ?? "Administrator")),
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
