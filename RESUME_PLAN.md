# Black Politics Now — Resume Plan

> Status as of July 27, 2026: FOUNDATION COMPLETE. Build paused at the user's
> request to conserve credits. This document lets any future session resume
> exactly where we left off.

## Vision
A unified "Political Intelligence Hub" at blkpoliticsnow.com combining:
1. **News** — headless WordPress feed from https://blkpoliticsnow.com (WP REST API: `https://blkpoliticsnow.com/wp-json/wp/v2/posts?_embed`)
2. **2026 U.S. Election Center** — ported from repo `adchachere1252-hash/election-map-2026` (live: electionmap-duqshn4d.manus.space)
3. **Daily Intelligence Brief podcast** — ported from repo `adchachere1252-hash/daily-podcast` (live: dailypodcst-crustlhc.manus.space)

## What is DONE (do not redo)
- Project scaffold (web-db-user template) initialized as `black-politics-now`.
- `drizzle/schema.ts`: complete unified schema — 10 tables:
  senate_races, house_races, governor_races, referendums (election);
  episodes, episode_segments, pipeline_runs, podcast_plays (podcast);
  email_subscribers, news_cache (unified platform). Migration applied to DB.
- **All production data imported into this project's database** via `seed-import.mjs`:
  35 senate races, 435 house races, 36 governor races, 148 referendums,
  82 podcast episodes, 1,144 audio segments (CDN URLs to CloudFront audio intact).
  Data was pulled from the live sites' public tRPC APIs (snapshots in /home/ubuntu/seed-data, may be gone after sandbox reset — but DB rows persist).

## What REMAINS (in recommended order, smallest useful increments)
1. **Theme + navigation shell** — dark-mode professional brand (deep navy/black + gold accents), top nav: News | Election Map | Podcast | Archive. Edit `client/src/index.css`, `client/index.html` (fonts), create `client/src/components/SiteHeader.tsx`.
2. **Podcast page** — port from daily-podcast repo: `client/src/pages/Home.tsx` (player), `AudioPlayer.tsx`, `ScriptDrawer.tsx`, `Archive.tsx`, `useVoicePreference.ts`. Keep Andrew/Jenny voice switcher names. Server: add `podcast` router (list episodes/segments from DB) + `/api/rss` endpoint (port `server/rss.ts`).
3. **Election Center page** — port from election-map-2026 repo: `ElectionMap.tsx` (SVG state map), `Scoreboard.tsx`, `ResultsTicker.tsx`, `RacePopup.tsx`, `ReferendumsView.tsx`, `GlobalSearch.tsx`. Server: senate/house/governor/referendum routers (read from unified DB; source routers in that repo's `server/routers.ts`).
4. **News feed** — server-side proxy for the WordPress REST API with news_cache table caching (30 min TTL). Categories: Civil Rights, Elections, Policy, Voting Rights, etc. News page + article cards linking to blkpoliticsnow.com.
5. **Unified homepage** — 3-column dashboard: latest news / featured races / latest episode player (see mockup concept in task history).
6. **Sticky bottom audio player** — global context so audio persists across page navigation.
7. **Admin dashboard** (role-gated with adminProcedure): tabs for Overview, Podcast Pipeline, Election Data editor (port editors from election-map-2026 `client/src/pages/Admin.tsx`), Audience.
8. **Cross-platform search** — one tRPC procedure querying news (WP API), episode segments, and race/candidate names.
9. **Notifications** — email_subscribers signup form; notify on new episode / major race call (use owner-notification skill or scheduled job; read webdev-periodic-updates skill first).
10. **Podcast generation pipeline** — port `server/pipeline.ts`, `research.ts`, `tts.ts` from daily-podcast repo (needs edge-tts + ffmpeg → requires custom Dockerfile skill, plus S3 storage helpers). Alternatively keep the old site running the pipeline and sync via its API.
11. **Domain** — user owns blkpoliticsnow.com (currently WordPress). When ready, bind custom domain via Settings → Domains. Keep WordPress reachable (e.g., move WP to a subdomain like news-admin.blkpoliticsnow.com or keep WP as content editor only via REST API).

## Key constraints (from user)
- Brand name: "Black Politics Now" everywhere; dark-mode professional news-media aesthetic.
- News sourced exclusively from blkpoliticsnow.com WP REST API.
- Voices must be named Andrew and Jenny (Microsoft Edge Neural TTS).
- AP-style ratings: Solid D, Likely D, Lean D, Toss-up, Lean R, Likely R, Solid R.
- Sticky audio player must not interrupt navigation.
- Admin UI fully gated behind role-based auth.

## Reference material
- Old repos cloned at /home/ubuntu/election-map-2026 and /home/ubuntu/daily-podcast (re-clone with `gh repo clone adchachere1252-hash/<name>` if sandbox was reset).
- The original sites remain live and untouched — they are the fallback while this build is incomplete.
