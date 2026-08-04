import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getEpisodesFormatted, subscribeEmail, unsubscribeEmail, getPipelineRuns } from "./podcastDb";
import { getAllSenateRaces, getAllHouseRaces, getAllGovernorRaces, getAllReferendums, getScoreboard, searchRaces, getHouseRacesByState, updateSenateRace, updateHouseRace, updateGovernorRace, updateReferendum } from "./electionDb";

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
    subscribe: publicProcedure
      .input(z.object({ email: z.string().email(), name: z.string().max(128).optional() }))
      .mutation(async ({ input }) => { await subscribeEmail(input); return { success: true }; }),
    unsubscribe: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => { await unsubscribeEmail(input.email); return { success: true }; }),
    pipelineRuns: protectedProcedure.query(async () => getPipelineRuns()),
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
  }),

  // ─── News (WordPress proxy) ──────────────────────────────────────────────────
  news: router({
    list: publicProcedure
      .input(z.object({ page: z.number().min(1).default(1), perPage: z.number().min(1).max(20).default(10), category: z.string().optional() }).optional())
      .query(async ({ input }) => {
        const { page = 1, perPage = 10, category } = input ?? {};
        let url = `https://blkpoliticsnow.com/wp-json/wp/v2/posts?_embed&per_page=${perPage}&page=${page}`;
        if (category) url += `&categories=${category}`;
        try {
          const res = await fetch(url, { headers: { "User-Agent": "BlackPoliticsNow/1.0" } });
          if (!res.ok) return { posts: [], total: 0, totalPages: 0 };
          const posts = await res.json();
          const total = parseInt(res.headers.get("X-WP-Total") ?? "0");
          const totalPages = parseInt(res.headers.get("X-WP-TotalPages") ?? "0");
          return { posts, total, totalPages };
        } catch { return { posts: [], total: 0, totalPages: 0 }; }
      }),
    categories: publicProcedure.query(async () => {
      try {
        const res = await fetch("https://blkpoliticsnow.com/wp-json/wp/v2/categories?per_page=50", { headers: { "User-Agent": "BlackPoliticsNow/1.0" } });
        if (!res.ok) return [];
        return res.json();
      } catch { return []; }
    }),
    search: publicProcedure
      .input(z.object({ query: z.string().min(1).max(100) }))
      .query(async ({ input }) => {
        try {
          const res = await fetch(`https://blkpoliticsnow.com/wp-json/wp/v2/posts?_embed&search=${encodeURIComponent(input.query)}&per_page=10`, { headers: { "User-Agent": "BlackPoliticsNow/1.0" } });
          if (!res.ok) return [];
          return res.json();
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
              const res = await fetch(`https://blkpoliticsnow.com/wp-json/wp/v2/posts?_embed&search=${encodeURIComponent(q)}&per_page=5`, { headers: { "User-Agent": "BlackPoliticsNow/1.0" } });
              if (!res.ok) return [];
              return res.json();
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
});

function getSnippet(text: string, query: string, contextLen = 80): string {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text.slice(0, contextLen * 2) + "...";
  const start = Math.max(0, idx - contextLen);
  const end = Math.min(text.length, idx + query.length + contextLen);
  return (start > 0 ? "..." : "") + text.slice(start, end) + (end < text.length ? "..." : "");
}

export type AppRouter = typeof appRouter;
