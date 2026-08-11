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
- [x] World Elections page (/world with lazy-loaded 3D globe)
- [x] Historical Atlas page (/atlas with lazy-loaded district-map explorer)

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
- [x] ~47 safe-seat House races — FIXED (all corrected in earlier session)
- [x] CBC schema "lost_primary" enum — ADDED (migration applied, Espaillat and Al Green updated)
- [x] Full 71-member CBC audit superseded by a source-backed 104-profile Black Representation audit, including reverse article-to-profile reconciliation
- [x] Run the full 35-race Senate verification matrix with source confirmation for each state and apply material corrections
- [x] Resolve the remaining pending-primary and nominee-format differences identified by the post-matrix comparison
- [x] Re-run the 35-state Senate audit against the live API and require a zero-discrepancy result before marking the matrix complete (35/35 aligned; 0 discrepancies)

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

## User Requests (Aug 5)
- [x] CBC map should show only CBC member states/districts, not full election map
- [x] Fix Ohio map color — verified Toss-up (purple) is CORRECT for both Senate and Governor 
- [x] Map click popup: show all House elections for a state when clicked (Dialog popup)
- [x] Senate Dem section on map — replaced with tab-aware rating counts (Safe D/Lean D/Toss-up/Lean R/Safe R)
- [x] Daily Intelligence Brief: generated 9 episodes (Jul 28-Aug 5) with AI scripts based on real news
- [x] Make Latest News font smaller to fit more headlines (text-xs, 8 items, compact layout)
- [x] Investigate automating map/data updates — documented Heartbeat cron approach
- [x] Redesign "Latest News" click-through to upscale BPN homepage (View All → blkpoliticsnow.com)
- [x] Update Chuck Edwards (NC-11) — race updated to Toss-up, Edwards withdrew
- [x] Full data verification against both GitHub repos — all data accounted for
      Note: Core data (35 senate, 435 house, 36 gov, 148 referendums, 91 episodes) all present. Omitted tables: senators (bios in race records), pinned_key_races (using ticker), fec_fundraising (no UI), candidate_photos (inline), episode_notes (not used)
- [x] Make stars small and not glaring (completed in previous checkpoint)
- [x] Michigan Senate primary: Updated to Abdul El-Sayed (D) after Aug 5 primary win
      Note: "View All" links to blkpoliticsnow.com; individual article cards still link to their WordPress posts

## User Requests (Aug 5 - Round 2)
- [x] Verify Texas rating — Lean R (Senate: Talarico vs Paxton), Solid R (Governor: Abbott). Both CORRECT, shows red.
- [x] Fix ticker RESULTS icon — now has red pulsing dot, distinct background/border, clearly separated from scrolling text
- [x] Fix slow site loading — added keep-alive ping every 5 min from cloud computer (cold→1.5s, warm→0.33s)
- [x] Regenerate podcast episodes in correct 40-min format with 13 topics from daily-podcast repo (Jul 28-Aug 5)
- [x] Update cloud computer automation script to use correct format
- [x] Explain cloud computer automation (delivered in message)

## Admin Dashboard & Real-Time Engine (Aug 6)
- [x] Build /admin page with race editing UI (Senate, House, Governor, CBC)
- [x] Add manual race call functionality (set winner, party)
- [x] Add DDHQ sync status display in admin
- [x] Fix election engine polling errors (House race candidate field mapping)
- [x] Add daily race discovery cron job on cloud computer
- [x] Add frontend LIVE indicator when polling is active
- [x] Add auto-refresh (60s) on election night
- [x] Update DDHQ race mapping for Aug 4 primary results

## Homepage Popup & Full Verification (Aug 9)
- [x] Add state click popup to homepage map
- [x] Add DDHQ sync status panel to admin dashboard (Overview tab shows mapped races, live status, cloud computer info)
- [x] Complete end-to-end verification of Elections, Podcast, Admin, and Search pages
- [x] Fix Podcast page subtitle (was "12 topics. 12 minutes." → now "13 topics. ~40 minutes.")

## Black Representation Article Integration (Aug 11)
- [x] Expand the Black Representation schema for article-backed primary, runoff, vote-total, source, and redistricting records
- [x] Complete a record-by-record reconciliation of the 74 article election records against the source article
- [x] Reconcile each existing Black Representation profile to article mentions, aliases, or documented out-of-scope status (92 article mentions/aliases; 1 documented retainer)
- [x] Perform reverse article-roster-to-profile reconciliation to document every article person, alias, omission, and intentional retainer (11 newly added profiles; 104 total tracked profiles)
- [x] Import article-backed primary and runoff results, general-election opponents, and source URLs
- [x] Verify every imported election-record source link is accessible and correct the NJ-3 naming discrepancy (74/74 links reachable)
- [x] Audit every imported election record’s substantive fields against its cited result source (winner, runner-up, vote totals, percentage, status, and general opponent) — regional audit found no substantive discrepancies
- [x] Update the Black Representation tab, map popups, and expanded cards with result details and source links
- [x] Rename and expand the admin editor to support Black Representation election records
- [x] Verify the public Black Representation view and renamed admin workspace render cleanly, with API-level regression coverage for all election records
- [x] Verify the public Black Representation view and administrative editor render the complete 74-record ledger
- [x] Verify direct public and admin workspace routes render the complete Black Representation dataset
- [x] Verify every article-backed election row passes the public data contract and protected administrative mutation regression suite
- [x] Run browser-level public presence and source-link audit for all 74 article-backed election rows
- [x] Run browser-level administrative editor control audit and protected mutation regression for all 74 article-backed election rows
- [x] Verify per-record public display of status, vote/percentage, opponent, and available editorial context for all 74 rows (74/74 individual election cards passed)
- [x] Run a real authenticated browser edit-and-persistence audit against the Black Representation admin workspace (edit persisted after reload and original source URL was restored)

## Platform-Wide Verification (Aug 11)
- [x] Establish live-production baseline: response timing, health, and client/server errors (HTTP 200; production logs clean; warm API/RSS requests measured at ~2.2–3.3s)
- [x] Verify Home, Senate Election Center, Black Representation, Podcast, Archive, Search, and light-mode routes on desktop and mobile viewports
- [x] Verify Governor, House, and Redistricting Election Center tabs in the live site-wide pass
- [x] Verify the Not Found route content and themed rendering in both light and dark modes
- [x] Explicitly test the Not Found Go Home escape action in dark mode
- [x] Fix Election Center tab-route handling and redistricting empty-state behavior found during live verification
- [x] Make the Not Found page theme-aware
- [x] Resolve stale primary-era reporting that incorrectly triggers LIVE mode or appears on scheduled/general House races
- [x] Verify core public workflows: navigation, map state popups, race-card expansion, search, podcast playback controls, RSS, and source links
- [x] Verify admin access, editors, data contracts, election totals, news cache, podcast archive, and Black Representation ledger
- [x] Verify cloud-computer cron jobs, recent logs, DDHQ mapping, and keep-alive behavior
- [x] Resolve material platform-wide verification issues and re-run targeted checks
- [x] Investigate production response latency and document the appropriate hosting solution (Autoscale retained; Reserved Hosting deferred by user decision)
- [ ] Consider Reserved Hosting if measured response time becomes a practical concern (DEFERRED by user decision)

## World Elections & Historical Atlas (Aug 11)
- [x] Reuse the imported World Elections dataset with country-code coordinates for the globe explorer
- [x] Run and document a full 48-record World Elections integrity audit (48 distinct records; no missing country, code, contest, date, status, or duplicate-key errors)
- [x] Build the lazy-loaded /world route with globe navigation, country selection, election detail cards, and accessible non-3D fallback
- [x] Build the lazy-loaded /atlas route with historical-atlas overview, state selection, district context, and existing redistricting records
- [x] Add navigation entries without increasing the initial homepage visualization bundle
- [x] Add World Elections public API regression coverage
- [x] Add Historical Atlas data regression coverage and automated UI checks for both standalone routes
- [x] Verify desktop/mobile rendering for both standalone routes
- [x] Verify keyboard interaction, source data, and browser-level lazy-loading behavior for both standalone routes

## Black Politics Now News-Section Visual Mockups (Aug 11)
- [x] Create premium Black Politics Now News-section mockups focused on reporting, editorial categories, and article discovery
- [x] Compare several desktop news-hub directions while retaining the established dark-and-gold BPN identity
- [x] Validate the generated News-section mockups and present a recommended direction for implementation
- [x] Create an Original Style, Elevated News mockup that retains the original compact dark-and-gold BPN newsroom identity
- [x] Add a direct live-platform preview route for the Original Style, Elevated News mockup
- [x] Preserve John Lewis as a respectful, permanent mission anchor in the revised News-section visual direction
- [x] Create a restrained News enhancement concept that preserves the original Black Politics Now newsroom layout and applies only selective polish
- [x] Document a comparison of all News mockup directions against reporting hierarchy, editorial categories, and article discovery
- [x] Record and surface the final recommended News direction and next implementation scope in-project
- [x] Create a cohesive full-site Black Politics Now visual concept spanning News, Election Center, World Elections, Historical Atlas, and Podcast
- [x] Reduce John Lewis’s visual weight to a restrained, dignified supporting presence in the full-site direction
- [x] Publish and verify a direct full-site concept preview
- [x] Extract the current Black Politics Now article-led News page structure and adapt it as the News-only refinement baseline
- [x] Design a sophisticated News-page-only concept with real article treatment, a World Elections map slot, and a Selma Historical Atlas feature
- [x] Keep John Lewis as a subtle supporting detail within the News page rather than a dominant visual
- [ ] Publish and verify the focused News-page-only concept preview
