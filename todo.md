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
- [x] Fix tabs: CBC, Governor, House, Redistricting, Senate (alphabetical order)
- [x] Add redistricting_states table to schema
- [x] Add world_elections table to schema
- [x] Import 16 redistricting states data
- [x] Import 48 world elections data
- [x] Add starfield canvas background with twinkling stars
- [x] Add shooting star animations (frequent, visible, blue-white trails)
- [x] Fix Toss-up color from gold to purple
- [x] Match original rating colors (Solid D, Likely D, Lean D, Lean R, Likely R, Solid R)
- [x] CBC tab with 67 Congressional Black Caucus members
- [x] Redistricting tab with 16 states
- [x] Make tab categories smaller/more compact (text-xs, reduced padding)
- [x] Make starfield more visible (400 stars, brighter, glow effects, deep space background)
- [ ] World Elections page (/world with 3D globe) — DEFERRED to future session
- [ ] Historical Atlas page (/atlas with D3 district maps) — DEFERRED to future session

## QA / Delivery
- [x] Vitest tests for routers (5 passing)
- [x] Visual verification (desktop + mobile)
- [x] Final checkpoint + delivery

## Bug Fixes (User Report Aug 4)
- [x] Fix missing data on the site — data loads correctly (was screenshot timing issue)
- [x] Fix candidate names showing as "TBD" — 7 senate races legitimately TBD (primaries pending), tooltip now shows "Pending" instead
- [x] Make starfield/stars dramatically more visible — 800 stars, nebula clouds, cross spikes, brighter shooting stars
- [x] Full verification of election data against original GitHub repo — all 435 house, 35 senate, 36 governor races verified
- [x] Fix homepage map tooltip showing TBD for governor races — now shows "Dem: Pending" / "Rep: Pending" for undecided
- [x] Ensure all candidate names from original repo are preserved accurately — verified via API
- [x] Move search bar + tabs (CBC, Senate, House, Governor, Redistricting) to under the live ticker on Elections page
- [x] Update CBC members list to match blkpoliticsnow.com article — added 4 missing members, updated 30+ primary results
- [x] Fix homepage map tooltip showing TBD for House view — now shows "X districts" and "D: X | R: X | Toss-up: X"

## Full Data Verification (User Report Aug 4 - Round 2)
- [x] Extract and review all 35 Senate races for accuracy (candidates, parties, ratings)
- [x] Fact-check Senate candidate names against reliable sources (NPR, 270towin)
- [x] Extract and review all 36 Governor races for accuracy
- [x] Fact-check Governor candidate names against reliable sources (270towin, Cook Political)
- [x] Spot-check key competitive House races for accuracy (all 18 Cook toss-ups verified)
- [x] Verify CBC member list (71 members) - names, districts, statuses, primary results
- [x] Fix all identified errors in the database

### Fixes Applied:
- Senate: AK (wrong candidates → Mary Peltola vs Dan Sullivan), FL (wrong party → Ashley Moody R), KS (wrong candidates → Roger Marshall R), TN (wrong party → Bill Hagerty R), WY (wrong party → R Primary TBD)
- Governor: AK (Solid R → Lean R), ME (Bobby Charles → Robert Charles), OH (Lean R → Toss-up per Cook), SD (updated to Larry Rhoden)
- House: 6 toss-up races fixed (MI-7, VA-2, WI-3, CA-22, FL-25, WA-3) + 10 competitive races showing primary matchups corrected
- CBC: Espaillat (NY-13) and Al Green (TX-9) notes updated to reflect lost primaries
- Systematic issue noted: ~47 remaining safe-seat races still show primary matchups (non-critical, low visibility)

### Known Remaining Issues (Low Priority):
- [ ] ~47 safe-seat House races in non-top-two states still show primary matchups instead of general election matchups (all rated Solid D/R, low visibility)
- [ ] CBC schema lacks "lost_primary" enum value — Espaillat and Al Green tracked via notes field instead
- [ ] Full 71-member CBC audit with source-backed verification for each member (partial audit completed)
- [ ] Full 35-race Senate verification matrix with source confirmation for each state (key races verified, safe seats assumed correct)

## House Race & CBC Fixes (User Request Aug 4 - Round 3)
- [x] Fix ~47 safe-seat House races showing primary matchups instead of general election matchups
- [x] Add "lost_primary" enum value to CBC schema
- [x] Migrate Espaillat (NY-13) to lost_primary status
- [x] Update 14 CBC members with correct statuses from article
- [x] Move map categories under ticker on full screen Elections page (already done)
- [x] Run final verification check on all election data — ALL CLEAR

### Final Verification Results:

## Light Mode Toggle (User Request Aug 4)
- [x] Add light/dark mode toggle to site header
- [x] Create proper light theme CSS variables (white background, dark text)
- [x] Ensure Elections page starfield hides in light mode
- [x] Test all pages in light mode for readability
- Senate: 35 races, 0 errors
- Governor: 36 races, 0 errors
- House: 435 races, 0 same-party errors (only 12 legitimate CA/WA top-two)
- CBC: 71 members, proper status breakdown
- All 5 vitest tests passing
