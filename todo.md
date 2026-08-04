# Black Politics Now — Project TODO

## Foundation
- [ ] Dark-mode professional theme (index.css, fonts, brand tokens)
- [x] Database schema: election tables (senate_races, house_races, gov_races, referendums)
- [x] Database schema: podcast tables (episodes, episode_segments, pipeline_runs)
- [x] Database schema: subscribers table for notifications
- [x] Seed election data from election-map-2026 repo (35 senate, 435 house, 36 gov, 148 referendums)
- [x] Seed podcast data from daily-podcast repo (82 episodes, 1144 segments from live API)

## Election Center
- [ ] Interactive U.S. state-by-state SVG map with AP-style race ratings colors
- [ ] Race detail popups (candidates, votes, pct reporting, called winner)
- [ ] Live seat scoreboard (Senate + House with majority thresholds)
- [ ] Results ticker (scrolling called races)
- [ ] Referendum tracking (Yes/No bars, margins, called status)
- [ ] Race search tool
- [ ] Governor races view

## Podcast
- [ ] Episode player page with 12-topic segment list
- [ ] Andrew/Jenny dual-voice switcher (names preserved)
- [ ] Sidebar topic filter
- [ ] Script drawer (slide-out script reader)
- [ ] Episode archive browser
- [ ] Podcast RSS feed endpoint (/api/rss)

## News (WordPress Headless)
- [ ] WordPress REST API integration (blkpoliticsnow.com)
- [ ] News feed page with category filters (Civil Rights, Elections, Policy, Voting Rights, etc.)
- [ ] Article cards with images, dates, excerpts, links to full articles
- [ ] Server-side caching of WP API responses

## Unified Experience
- [ ] Unified top navigation (News, Election Map, Podcast, Archive) with BPN branding
- [ ] Unified homepage dashboard (3-column: news / election highlights / podcast player)
- [ ] Sticky bottom audio player persistent across all pages
- [ ] Cross-platform search (news + podcast scripts + election races/candidates)

## Admin Dashboard (role-gated)
- [ ] Admin gate (role-based auth, no public exposure)
- [ ] Overview tab (stats across all three platforms)
- [ ] Podcast Pipeline tab (trigger + monitor episode generation)
- [ ] Election Data editor tab (vote totals, ratings, call winners)
- [ ] Audience/analytics tab

## Notifications
- [ ] Subscriber signup (email collection)
- [ ] Notify on new podcast episode published
- [ ] Notify on major race called

## QA / Delivery
- [ ] Vitest tests for routers
- [ ] Visual verification (desktop + mobile)
- [ ] Checkpoint + delivery
