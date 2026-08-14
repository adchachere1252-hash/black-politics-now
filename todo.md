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
- [x] Subscriber signup (email collection) — Deferred by user decision; not part of this verified scope
- [x] Notify on new podcast episode published — Deferred by user decision; not part of this verified scope
- [x] Notify on major race called — Deferred by user decision; not part of this verified scope


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
- [x] Consider Reserved Hosting if measured response time becomes a practical concern — Deferred by user decision; autoscale remains in use

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
- [x] Publish and verify the focused News-page-only concept preview

## Full Platform Verification (Aug 11)
- [x] Establish current production baseline for routes, response behavior, and client/server diagnostics
- [x] Verify all public routes, responsive layouts, navigation, and core interactive workflows
- [x] Verify election, podcast, WordPress News, World Elections, Historical Atlas, search, RSS, and admin data contracts
- [x] Verify cloud-computer automation schedules, recent task logs, DDHQ mapping, and election-engine status
- [x] Resolve confirmed verification findings and rerun targeted checks
- [x] Document and deliver the full-platform verification results
- [x] Restore missing full-episode and segment audio assets for the current Daily Intelligence Brief run and verify public playback
- [x] Correct the verified July 31 Daily Intelligence Brief segment-count mismatch or restore its missing segments before public playback verification
- [x] Repair the Daily Intelligence Brief generator’s silent short-script fallback so newly generated episodes contain the intended full-length editorial scripts
- [x] Prevent broken public play actions for episodes whose verified full-length audio asset is unavailable
- [x] Assess and recommend a lightweight homepage placement for World Elections and the Historical Atlas without displacing the core News–map–podcast dashboard

## Homepage Discovery Rail
- [x] Prepare the user-provided Selma march image for a respectful Historical Atlas feature card
- [x] Add a subtle spinning-globe treatment to the World Elections feature card without increasing first-view load significantly
- [x] Implement and verify the two-card homepage discovery rail beneath the existing three-column dashboard — superseded by the user-approved single framed lower preview strip
- [x] Create and publish a direct visual example of the homepage discovery rail for review before changing the default homepage
- [x] Revise the homepage example to align with the user-provided compact editorial dashboard benchmark
- [x] Rebuild the homepage example to closely follow the supplied reference’s three-column dashboard and single framed lower preview strip
- [x] Replace the schematic World Elections globe in the homepage example with a more authentic slowly rotating geographic globe
- [x] Compare and, if better, reuse the original election-map repository globe in the homepage example
- [x] Inventory all relevant election-map and Daily Intelligence Brief repository data, assets, and dashboard capabilities
- [x] Compare the repository inventory against the current platform and document every verified covered item, intentional exclusion, and missing capability
- [x] Integrate any verified missing dashboard-relevant repository capability before promoting the homepage example

## Approved Dashboard Promotion & Daily Brief Recovery
- [x] Promote the approved reference-aligned dashboard from preview to the default desktop homepage
- [x] Preserve the existing stacked mobile homepage layout while applying the desktop-only dashboard promotion
- [x] Restore verified full-length Daily Intelligence Brief scripts and playable audio for the affected current episode run
- [x] Verify public desktop and mobile homepage behavior plus Daily Brief playback after promotion
- [x] Ground Daily Intelligence Brief scripts in live source feeds before regenerating the affected episode run
- [x] Remove the Friday short-script fallback so every published Daily Brief segment passes the full-length editorial quality gate
- [x] Add durable morning-run publish gates, automatic retries, and clear failure logging for Daily Intelligence Brief generation and audio assembly
- [x] Reconnect safely after long model runs and persist resumable Daily Brief drafts so an interrupted morning run does not discard completed verified segments
- [x] Validate stripped spoken-word length against each Daily Brief segment duration before audio publication
- [x] Keep incomplete Daily Brief runs out of public latest-episode selection until verified full audio is available
- [x] Update the promoted desktop dashboard’s Daily Brief panel to display and play the latest verified episode instead of a fixed preparation placeholder

## Professional Dashboard Refinement
- [x] Audit the current World Elections and Historical Atlas dashboard previews against original repository functionality and professional newsroom standards
- [x] Rebuild the World Elections dashboard preview with meaningful repository-derived live global-election data and polished globe interaction
- [x] Rebuild the Historical Atlas dashboard preview with richer repository-derived historical context and a dignified Selma treatment
- [x] Apply intentional light-mode design to the entire dashboard, including maps, imagery, typography, borders, and interactive states
- [x] Verify the refined dashboard on desktop and mobile in both dark and light modes
- [x] Fit the desktop dashboard into a deliberate no-scroll viewport while keeping full page navigation available through dedicated routes
- [x] Preserve the existing mobile stacked, scrollable interface while enforcing the desktop no-scroll dashboard constraint

## Dashboard Composition Refinement
- [x] Expand the desktop Latest News module into the prior Reporting Desk area and remove the dashboard John Lewis legacy module
- [x] Keep the Daily Intelligence Brief panel in its current desktop dashboard position
- [x] Add Senate, House, and Governor controls to the desktop homepage map with tab-correct notes-enabled state details
- [x] Retain World Elections and Historical Atlas as dashboard previews rather than replacing the Daily Brief panel
- [x] Transform the World Elections globe into a bright, authentic visual focal point on the dashboard
- [x] Verify the refined desktop dashboard and preserved mobile layout before publication
- [x] Clarify the Historical Atlas panel as a Selma, voting-rights history, representation, apportionment, and redistricting briefing with a cleaned-up visual treatment

## Simplified Editorial Dashboard
- [x] Remove duplicate lower Latest News and Podcast Archive modules, then fill the primary Latest News and Daily Intelligence Brief columns with richer real content
- [x] Rename the Historical Atlas dashboard context from Selma to Voting Rights Act (VRA) and clarify its historical-map purpose
- [x] Rebuild the World Elections globe as a complete authentic Earth with stable dark-light texture and lighting treatment
- [x] Add selective editorial imagery to the dashboard without compromising the single-screen hierarchy
- [x] Verify the simplified dashboard in dark and light modes while preserving the stacked mobile layout

## Featured Global & Historical Intelligence
- [x] Audit DDHQ election-engine activity, data mappings, database changes, and race-call logs for last night’s election update
- [x] Replace the manual election-night polling requirement with a date-aware, lock-safe autonomous DDHQ polling guard and automatic recovery logging
- [x] Capture autonomous poll-cycle output in durable logs so election updates and failures remain auditable
- [x] Expand the World Elections window into a richer featured global-intelligence view using live repository data
- [x] Expand the Voting Rights Act / Historical Atlas window into a more creative historical-and-redistricting feature view using repository context
- [x] Verify and publish the expanded global and historical feature treatment in the one-screen desktop dashboard

## Balanced Dashboard Panels
- [x] Move the substantial World Elections globe and global metrics beneath the Daily Intelligence Brief to eliminate the right-column empty space
- [x] Create an image-led Voting Rights Act and Historical Atlas feature beneath Latest News using the Selma march image and historical-redistricting context
- [x] Verify the newly balanced four-panel dashboard in dark and light desktop modes while preserving the mobile stack
- [x] Add professional loading placeholders for News, Atlas, World Elections, podcast, and map data so the dashboard never appears blank while live queries settle

## Globe, Mobile Theme & AI Agent Direction
 - [x] Enlarge the World Elections globe by reallocating a measured portion of Daily Brief panel space while keeping essential briefing controls visible
 - [x] Reframe the Selma march image as an atmospheric Voting Rights Act background treatment in the Historical Atlas panel
- [x] Extend and verify the black-white theme behavior across the mobile app experience
- [x] Design a source-grounded Black Politics Now AI research and navigation agent, including product recommendations and safety boundaries — Deferred until after this verification task by user decision

## Final Verification & Accuracy Audit
- [x] Establish current production baselines for the dashboard, public routes, live data feeds, and production diagnostics
- [x] Verify desktop and mobile layouts in black and white modes, navigation, map controls, state-note dialogs, and playback workflows
- [x] Verify manual admin entry for elections, Black Representation, race notes, vote totals, candidate details, and podcast pipeline controls
- [x] Verify election, news, World Elections, Historical Atlas, podcast, RSS, and election-automation data accuracy and freshness
- [x] Correct confirmed accuracy, visual, interaction, or manual-entry issues and rerun targeted checks
- [x] Document and deliver the final verification and accuracy report before AI-agent work resumes
- [x] Resolve or explicitly annotate the 21 House records with incomplete candidate fields after source review
 - [x] Correct historical Daily Brief verification states so episodes without verified full or segment audio are not marked as fully passed
 - [x] Add editable race notes to the Senate, House, and Governor manual Election Ops forms so public state-detail notes can be maintained without database access
 - [x] Apply a documented source hierarchy that uses each state’s Secretary of State or equivalent official elections office as secondary corroboration for U.S. candidate, ballot, result, and certification facts
 - [x] Correct the election guard’s stale-date match so it never keeps DDHQ minute polling active for yesterday’s election date
 - [x] Record an explicit mobile dark-mode verification pass for Home, Elections, Podcast, World, and Atlas
 - [x] Reconfirm the current protected Election Ops and Podcast Ops controls through the available authenticated-regression contract and document the access limitation for browser-level editing
 - [x] Confirm the completed verification report file and source-hierarchy documentation are present in the project
 - [x] Explicitly annotate every remaining House record with a blank opponent as pending primary, open primary, or ballot certification
 - [x] Diagnose and resolve the production homepage HTTP 500 response observed during final verification
 - [x] Complete remaining project-side verification in the healthy preview and repeat live-domain checks once hosting recovers
 - [x] Verify and correct any unauthenticated Admin dashboard visibility so all operational content and mutations remain role-gated — Interactive preview showed the expected Admin Access Required gate; an earlier screenshot used an authenticated capture context

## AI Research Agent & Continuous Improvement
- [x] Run a complete Historical Atlas launch verification for apportionment, boundary eras, redistricting context, sources, interactions, and responsive presentation
- [x] Diagnose and restore today’s autonomous Daily Intelligence Brief update while preserving full-audio publication gates
- [x] Replace the outdated Meta News research source key that prevented sufficient fresh Tech News coverage for today’s Daily Brief
- [x] Add visible official and editorial source links to every World Elections country detail drawer
- [x] Add next-30-days and regional filters to the World Elections explorer
- [x] Add the user-approved 30-minute Cook Islands Verified Watch that creates review-only Admin alerts when authoritative reporting changes
- [x] Correct the Cook Islands watch lookup to use the platform’s stored CK country code
- [x] Verify the Cook Islands August 12, 2026 election record against authoritative reporting and update its status or notes as needed
- [x] Run a full source-backed completeness and freshness audit for every World Elections record
- [x] Enrich World Elections country details missing candidate or key-issue context after source verification
- [x] Correct the standalone World Elections freshness indicator so it reflects the latest source-audit update
- [x] Normalize double-encoded World Elections detail JSON so every country drawer renders candidates and key issues
- [x] Make the standalone World Elections globe the page’s primary immersive beacon of hope and country-exploration entry point
- [x] Replace the empty lower World Elections information panel with concise live global-election signals
- [x] Rebuild the World Elections globe as a realistic luminous global beacon that invites country-by-country exploration
- [x] Audit World Elections clarity, visual hierarchy, data depth, and reader utility against a global political-intelligence standard
- [x] Develop a prioritized redesign recommendation for the global experience before implementation
- [x] Add clear country outlines to the spinning World Elections globe without compromising Earth texture or marker readability
- [x] Replace all public uses of “Battlefield” with neutral political-journalism terminology
- [x] Add an interactive search control to the homepage election map
- [x] Verify and document World Elections data freshness and update state
- [x] Run and document a complete strengths-and-gaps verification of World Elections and Historical Atlas
- [x] Run a complete candidate-image and roster coverage audit for Senate, House, Governor, and Black Representation records
- [x] Validate every stored or repository-fallback candidate portrait URL before finalizing the image audit
- [x] Align the portrait audit with the live Black Representation override map so final coverage counts are exact
- [x] Add a concise World Elections globe status panel to the protected Admin Overview if it improves operational monitoring
- [x] Make Podcast Ops operational by surfacing today’s publication gate, current episode, recent runs, and actionable recovery state
- [x] Make the Daily Intelligence Brief dashboard segment list independently scrollable
- [x] Reallocate Daily Brief space to expand the World Elections and Voting Rights Act/Historical Atlas dashboard panels
- [x] Clarify and verify the Agent Desk approval-to-task handoff, including what the agent can and cannot do after approval
- [x] Define and implement the Historical Atlas’s launch purpose with complete repository coverage and a prioritized expansion plan
- [x] Restore the Historical Atlas build after adding the repository boundary-era archive
- [x] Complete four legitimate-source recovery passes for the remaining 73 named candidates and two abbreviated or incomplete labels; retain transparent placeholders where no conflict-free portrait exists
- [x] Integrate six validated Black Representation portrait sources and retain the AR-2 Chris Jones namesake exclusion
- [x] Correct Historical Atlas messaging so it does not imply party-control or representative timelines exist in the current repository data
- [x] Lower and reframe the desktop election map so Washington and the full U.S. geography are visible without top crowding
- [x] Make Latest News independently scrollable within its dashboard panel
- [x] Add useful chamber-specific election intelligence beneath the map that changes for Senate, House, and Governor views
- [x] Restore the homepage map-control order to Governor, House, and Senate
- [x] Audit Historical Atlas repository coverage, document what is represented on the website, and close verified content gaps
- [x] Complete final launch-readiness visual, data, automation, and interaction verification
- [x] Correct the Daily Brief generator’s invalid processing verification status so today’s autonomous episode can resume safely
- [x] Correct today’s saved Daily Brief segment-duration mismatch so the verified 41-minute episode can complete audio publication safely
- [x] Give the desktop homepage election map sufficient top spacing and visual hierarchy without crowding map controls
- [x] Separate the Historical Atlas/Voting Rights Act panel from the Latest News panel to prevent visual collision
- [x] Increase the John Lewis/Selma background image visibility in the light theme while preserving legible panel copy
- [x] Add a Black Representation profile-detail drawer with article-backed election context
- [x] Add a visible last-updated timestamp to the Election Center map
- [x] Add verified, in-progress, or review-needed completion badges to every Daily Brief archive date
- [x] Include incomplete Daily Brief records in the public archive so every stored date can show its completion badge
- [x] Blend the John Lewis/Selma image into the Voting Rights Act background treatment without competing with panel content
- [x] Expand the homepage election map to fill the middle dashboard column while retaining its controls and state dialogs
- [x] Audit and confirm autonomous election-day polling, race-call, and recovery behavior
- [x] Repair the failed Research Desk run and verify a successful review-only recommendation cycle
- [x] Reconcile Daily Intelligence Brief day-by-day dates and public status presentation with verified audio availability
- [x] Correct the Michigan Black Representation profile that incorrectly identifies John James as the gubernatorial candidate
- [x] Remove the redundant Black Representation advanced, runoff/pending, and retiring summary cards from the public tab
- [x] Perform focused image verification on the Black Representation and U.S. Election Center views
- [x] Extract and map the supplied Black Politics Now primary-results article to Black Representation platform records
- [x] Compare article-backed primary outcomes and representation notes against the current Black Representation ledger
- [x] Apply verified Black Representation corrections with article provenance and rerun data and regression checks
- [x] Correct Black Representation summary metrics so advanced, runoff, and retiring counts reflect the updated profile ledger
- [x] Add due-date reminder states to the Admin dashboard for overdue and upcoming Agent Desk tasks
- [x] Add owner-specific filters to the compact Election-Night Priority queue
- [x] Add a one-click Review now action from the Overview priority queue to the matching Agent Desk recommendation
- [x] Diagnose and correct the failed Admin-triggered Agent Desk research run shown in the dashboard
- [x] Set role-based default owners for editorial and data-quality recommendations
- [x] Add optional due dates to approved Agent Desk follow-up tasks
- [x] Add a compact Election-Night Priority queue to the Admin Overview tab
- [x] Remove visible globe grid lines while retaining detailed Earth geography and election markers
- [x] Brighten and correct the mobile World Elections globe so it is recognizable as Earth in both themes
- [x] Make the mobile World Elections Earth screen-filling with clearer geographic detail while preserving readable election markers
- [x] Add Agent Desk recommendation filters for status, category, priority, and owner
- [x] Add recommendation ownership and a human-approved approval-to-task workflow
- [x] Add a safe election-night priority mode for faster, review-only Agent Desk recommendations
- [x] Implement the approved Autonomous Research Desk model: continuous research and cited recommendations, with no automatic publishing, election-record mutation, or public alerting
- [x] Define reader-facing AI research scope, approved source context, citation rules, and answers that must be declined or escalated
- [x] Build a source-grounded reader chat experience using verified Black Politics Now news, election, podcast, historical-atlas, and World Elections data
- [x] Ensure chamber-wide Research Desk questions retrieve the requested Senate, House, or Governor platform summary rather than unrelated keyword matches
- [x] Convert internal Research Desk citations to safe absolute URLs so rendered source links are usable
- [x] Add a protected improvement queue that stores AI-generated data-quality and editorial recommendations for human approval
- [x] Add safe recurring research runs that produce reviewable recommendations without directly publishing content or altering election records
- [x] Test, document, and visually verify the AI agent and its protected operations controls
- [x] Resolve the stale public deployment so the published domain includes the new Research Desk route and current navigation

## Final Verification & Accuracy Audit (Historical Duplicate)
The following earlier duplicate checklist is retained as project history. The expanded checklist immediately above is the active audit scope.
- [x] Establish current production baselines for the dashboard, public routes, live data feeds, and production diagnostics — Historical duplicate; completed in active audit above
- [x] Verify desktop and mobile layouts in black and white modes, navigation, map controls, state-note dialogs, and playback workflows — Historical duplicate; completed in active audit above
- [x] Verify election, news, World Elections, Historical Atlas, podcast, RSS, and election-automation data accuracy and freshness — Historical duplicate; completed in active audit above
- [x] Correct confirmed accuracy, visual, or interaction issues and rerun targeted checks — Historical duplicate; completed in active audit above
- [x] Document and deliver the final verification and accuracy report before AI-agent work resumes — Historical duplicate; completed in active audit above

## Daily Brief Reliability Safeguards (Aug 14)
- [x] Add a mandatory all-topic source preflight before the 6:00 AM Daily Brief generation begins
- [x] Add an early locked recovery path when preflight fails, so source gaps are repaired before the standard generation window
- [x] Strengthen and quality-screen Tech News fallback queries while retaining the resumable `03_meta_news` key
- [x] Verify the safeguard with an automated source-preflight test and document the operational behavior

## Podcast Ops Editorial Control Room (Aug 14)
- [x] Expand the protected Podcast Ops tab with current-run health, publication-gate timeline, source-preflight visibility, audio diagnostics, recovery guidance, and recent-run history
- [x] Add regression coverage for the operational Podcast Ops data contract and verify the protected dashboard presentation

## Research Desk Task Execution (Aug 14)
- [x] Allow an administrator to assign a bounded approved task to the Research Desk agent with scope, source requirements, and due date
- [x] Execute assigned research or analysis tasks into a source-cited work package that is returned as ready for human review
- [x] Preserve the no-autopublish, no-election-record-mutation, and no-public-alert boundaries throughout agent task execution
- [x] Add protected API and interface regression coverage for agent task execution and review handoff

## Intelligence Operations Sequence (Aug 14)
- [x] Create and complete a live bounded Research Desk task as a cited, ready-for-review work package
- [x] Add a dated, source-audited World Elections refresh workflow with protected review-first updates
- [x] Build an administrator review queue for candidate portrait submissions, provenance review, and safe approval or rejection
- [x] Test, document, and visually verify the completed operations sequence

## Homepage Historical Atlas Coverage (Aug 14)
- [x] Correct the homepage Historical Atlas summary to state the complete 50-state archive while separately identifying the 16-state active redistricting watchlist
- [x] Verify the corrected homepage Atlas presentation and preserve the mobile layout

## Historical Atlas Repository Comparison and Improvement (Aug 14)
- [x] Compare the current Historical Atlas data, assets, and interactions against the original election-map-2026 repository
- [x] Re-verify all 50 apportionment histories, boundary-era archives, active redistricting context, source transparency, and responsive state interactions
- [x] Implement prioritized Atlas improvements supported by the repository comparison
- [x] Produce a complete Historical Atlas findings report with strengths, gaps, remediation, and remaining editorial decisions

## Original Newsroom Platform Upgrade (Aug 14)
- [x] Translate the supplied original Black Politics Now news-site reference screens into a refined editorial design system for the platform
- [x] Build a newsroom-focused public landing page that preserves the original site’s category-led, typography-forward identity and connects to platform intelligence tools
- [x] Preserve the current mobile stacked experience while validating the rebuilt newsroom layout on desktop and mobile
- [x] Produce a prioritized platform-wide upgrade recommendation covering newsroom, intelligence products, trust, audience, and operations

## Election Guide World Elections Verification (Aug 14)
- [x] Compare the World Elections country calendar, dates, and statuses against the published Election Guide reference
- [x] Document confirmed matches, source discrepancies, and any review-first corrections recommended for the public map

## Original WordPress Newsroom Visual Recommendation (Aug 14)
- [x] Produce a visual concept that upgrades the existing Black Politics Now WordPress newsroom while preserving its category-led editorial identity
- [x] Explain the recommended homepage hierarchy, theme treatment, and selective platform-feature placements without proposing a WordPress rebuild
- [x] Include a prominent homepage and navigation destination that directs readers to the live Election Map

## Editor-Confirmed News Links and AI Chatbot Example (Aug 14)
- [x] Build a review-first example that connects selected WordPress stories to relevant Election Map, Historical Atlas, World Elections, or Daily Brief records
- [x] Build a viewable public Research and Intelligence Agent example that presents guided questions, source-cited answers, evidence gathering, and ready-for-review recommendations
- [x] Verify the preview route on desktop and mobile, with no automatic article linking or public record mutation

## Research Agent Preview Route Repair (Aug 14)
- [x] Diagnose and correct the reported live 404 on `/intelligence-example`
- [x] Verify the repaired published route directly and provide the working link

## Original Homepage Redesign and Agent Change Proposals (Aug 14)
- [x] Replace the rejected agent-demo direction with a faithful original-style Black Politics Now newsroom homepage design and a clear Election Map return path
- [x] Resolve the original-style newsroom feed loading shell so authentic WordPress stories render promptly in the rebuilt layout
- [x] Extend Agent Desk so an approved agent task returns an evidence-backed, structured proposed-change package for human review rather than only a research memo
- [x] Support explicit proposed article-to-record links, data-correction drafts, and editorial-copy drafts that an administrator can approve or reject individually
- [x] Add a dedicated protected Proposed Changes page with before/after views, evidence, target details, and Approve, Reject, or Request Revision controls
- [x] Preserve no-autopublish, no-election-record-mutation, and no-WordPress-change safeguards until the administrator explicitly approves a proposed change
- [x] Verify the corrected homepage and Agent Desk proposed-change review flow on desktop and mobile
