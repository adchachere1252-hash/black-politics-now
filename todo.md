# Black Politics Now — Project TODO

## Foundation
- [x] Dark-mode professional theme (index.css, fonts, brand tokens)
- [x] Database schema: election tables (senate_races, house_races, gov_races, referendums)
- [x] Database schema: podcast tables (episodes, episode_segments, pipeline_runs)
- [x] Database schema: subscribers table for notifications
- [x] Seed election data from election-map-2026 repo (35 senate, 435 house, 36 gov, 148 referendums)
- [x] Seed podcast data from daily-podcast repo (82 episodes, 1144 segments from live API)

## Election Center
- [ ] Interactive U.S. state-by-state SVG map with AP-style race ratings colors (future enhancement)
- [x] Race detail cards (candidates, votes, pct reporting, called winner)
- [x] Live seat scoreboard (Senate + House)
- [ ] Results ticker (scrolling called races) (future enhancement)
- [x] Referendum tracking (pass/fail status, categories)
- [x] Race search tool
- [x] Governor races view

## Podcast
- [x] Episode player page with 12-topic segment list
- [x] Andrew/Jenny dual-voice switcher (names preserved)
- [x] Episode search/filter
- [ ] Script drawer (slide-out script reader)
- [x] Episode archive browser
- [ ] Podcast RSS feed endpoint (/api/rss)

## News (WordPress Headless)
- [x] WordPress REST API integration (blkpoliticsnow.com)
- [x] News feed page with category display
- [x] Article cards with dates, excerpts, links to full articles
- [ ] Server-side caching of WP API responses (future optimization)

## Unified Experience
- [x] Unified top navigation (News, Election Map, Podcast, Archive) with BPN branding
- [x] Unified homepage dashboard (3-column: news / election highlights / podcast player)
- [x] Sticky bottom audio player persistent across all pages
- [x] Cross-platform search (news + podcast scripts + election races/candidates)

## Admin Dashboard (role-gated)
- [x] Admin gate (role-based auth, no public exposure)
- [x] Overview tab (stats across all three platforms)
- [x] Podcast Pipeline tab (monitor pipeline runs)
- [ ] Election Data editor tab (vote totals, ratings, call winners)
- [x] Audience/analytics tab (placeholder)

## Notifications
- [ ] Subscriber signup (email collection)
- [ ] Notify on new podcast episode published
- [ ] Notify on major race called

## QA / Delivery
- [x] Vitest tests for routers (5 passing)
- [x] Visual verification (desktop + mobile)
- [x] Final checkpoint + delivery
