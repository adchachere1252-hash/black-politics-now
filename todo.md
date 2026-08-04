# Black Politics Now — Project TODO

## Foundation
- [x] Dark-mode professional theme (index.css, fonts, brand tokens)
- [x] Database schema: election tables (senate_races, house_races, gov_races, referendums)
- [x] Database schema: podcast tables (episodes, episode_segments, pipeline_runs)
- [x] Database schema: subscribers table for notifications
- [x] Seed election data from election-map-2026 repo (35 senate, 435 house, 36 gov, 148 referendums)
- [x] Seed podcast data from daily-podcast repo (82 episodes, 1144 segments from live API)

## Election Center
- [x] Interactive U.S. state-by-state SVG map with AP-style race ratings colors
- [x] Race detail cards (candidates, votes, pct reporting, called winner)
- [x] Live seat scoreboard (Senate + House)
- [x] Results ticker (scrolling called races)
- [x] Referendum tracking (pass/fail status, categories)
- [x] Race search tool
- [x] Governor races view

## Podcast
- [x] Episode player page with 12-topic segment list
- [x] Andrew/Jenny dual-voice switcher (names preserved)
- [x] Episode search/filter
- [x] Script drawer (slide-out script reader)
- [x] Episode archive browser
- [x] Podcast RSS feed endpoint (/api/rss)

## News (WordPress Headless)
- [x] WordPress REST API integration (blkpoliticsnow.com)
- [x] News feed page with category display
- [x] Article cards with dates, excerpts, links to full articles
- [x] Server-side caching of WP API responses

## Unified Experience
- [x] Unified top navigation (News, Election Map, Podcast, Archive) with BPN branding
- [x] Unified homepage dashboard (3-column: news / election highlights / podcast player)
- [x] Sticky bottom audio player persistent across all pages
- [x] Cross-platform search (news + podcast scripts + election races/candidates)

## Admin Dashboard (role-gated)
- [x] Admin gate (role-based auth, no public exposure)
- [x] Overview tab (stats across all three platforms)
- [x] Podcast Pipeline tab (monitor pipeline runs)
- [x] Election Data editor tab (vote totals, ratings, call winners)
- [x] Audience/analytics tab (placeholder)

## Notifications
- [ ] Subscriber signup (email collection) — DEFERRED per user request
- [ ] Notify on new podcast episode published — DEFERRED per user request
- [ ] Notify on major race called — DEFERRED per user request


## Election Center Enhancements (Phase 2)
- [ ] Fix tabs: Governor, House, Redistricting, Senate (remove President, add World link)
- [ ] Add redistricting_states table to schema
- [ ] Add world_elections table to schema
- [ ] Import 16 redistricting states data
- [ ] Import 48 world elections data
- [ ] Add starfield background image to election map area
- [ ] Add TwinklingStars SVG animation component
- [ ] Add ShootingStar animation component
- [ ] Fix Toss-up color from gold to purple (#7c3aed)
- [ ] Match original rating colors (Solid D, Likely D, Lean D, Lean R, Likely R, Solid R)
- [ ] World Elections page (/world with 3D globe) — DEFERRED to future session
- [ ] Historical Atlas page (/atlas with D3 district maps) — DEFERRED to future session

## QA / Delivery
- [x] Vitest tests for routers (5 passing)
- [x] Visual verification (desktop + mobile)
- [x] Final checkpoint + delivery
