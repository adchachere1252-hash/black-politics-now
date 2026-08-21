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

## Original Newsroom Boundary and Election Day Admin Roadmap (Aug 14)
- [x] Document the decision to preserve the original WordPress newsroom and limit platform integration to optional utility entry points
- [x] Restore the primary platform News navigation to the original Black Politics Now WordPress newsroom while leaving any internal concept route unpromoted
- [x] Assess the current Admin dashboard against Election Day command-center needs and identify practical missing controls
- [x] Deliver a prioritized Election Day Admin roadmap for user approval before implementing new operations features

## Election Day Command Center and Agent Research Controls (Aug 14)
- [x] Build a protected Election Day Command Center with source heartbeat, race triage, reviewable correction drafts, and operational runbook
- [x] Add an AI-assisted portrait research workflow that produces source-backed private portrait proposals for review only
- [x] Add a protected Run research now action on Proposed Changes to trigger a fresh source-cited agent research pass
- [x] Verify every new control remains administrator-only and cannot make public changes without explicit approval

## Command Center Intelligence Agent (Aug 14)
- [x] Add a protected Election Day Intelligence Agent that investigates selected operational triage conditions and prepares evidence-backed private proposals
- [x] Expose explicit agent-review controls within Command Center without race calls, public mutations, alerts, or automatic publishing
- [x] Verify the Command Center agent is administrator-only and submits output to Proposed Changes for human review

## Election Day Readiness Sequence (Aug 14)
- [x] Run one bounded Command Center agent investigation and confirm its private proposal is ready for review
- [x] Confirm named default Data Desk and Editorial Desk ownership for Election Day triage and agent tasks
- [x] Add a protected rehearsal workflow that exercises triage, research, and review steps without modifying live public records
- [x] Prevent the Admin tab bar from widening the mobile page while keeping all protected destinations reachable by local horizontal scrolling
- [x] Validate and document the completed Election Day readiness sequence

## Homepage Typography Alignment (Aug 14)
- [x] Replace competing homepage display typography with the same clear editorial font treatment used by Latest News
- [x] Verify the unified homepage type hierarchy remains legible on desktop and mobile

## Platform-Wide Typography Standardization (Aug 14)
- [x] Replace remaining competing fonts across public intelligence features and protected Admin panels with the Latest News editorial type treatment
- [x] Preserve the distinct Black Politics Now wordmark while unifying headings, cards, controls, tables, and operational content typography
- [x] Verify the complete type system across public pages and Admin dashboard at desktop and mobile breakpoints

## Navigation Icon Consistency (Aug 14)
- [x] Add matching understated icons to News, Podcast, and Archive so every top-level navigation destination has a consistent visual marker
- [x] Verify the unified navigation remains legible on desktop and mobile

## Live Portrait Research Run (Aug 14)
- [x] Run the AI portrait-research agent for one remaining candidate photo gap and return any source-backed proposal to private review
- [x] Verify no portrait or public profile is changed without explicit administrator approval

## Alphabetized Top-Level Navigation (Aug 14)
- [x] Reorder all top-level platform destinations alphabetically while preserving the wordmark and matching icons
- [x] Verify the alphabetical header order remains readable on desktop and mobile

## Site Strengths and Weaknesses Review (Aug 14)
- [x] Review the public homepage, Election Map, World Elections, Historical Atlas, Daily Brief, and Research Desk experiences
- [x] Review the protected Admin operations, Election Day controls, and human-approval safeguards
- [x] Deliver prioritized strengths, weaknesses, and launch-readiness recommendations

## Launch-Readiness Hierarchy and Discovery Improvements (Aug 14)
- [x] Add a concise public mission statement that explains the reporting-to-record purpose of the platform
- [x] Add a compact protected Needs Decision Now lane that prioritizes urgent Admin review work
- [x] Add provenance-first portrait-source discovery that collects official candidate source pages for private review before portrait research runs
- [x] Strengthen Podcast and Archive editorial entry points with featured content, topical filters, and clearer ways to find what changed today
- [x] Verify the public and protected improvements on desktop and mobile

## Tech News Brief Source Transparency (Aug 14)
- [x] Persist verified Tech News source links with each Daily Intelligence Brief Tech segment
- [x] Display concise, source-linked Tech Brief citations and source-verification context in the public Podcast experience
- [x] Preserve the Daily Brief publication and audio-completion gates while validating Tech source rendering

## Admin Candidate Performance Display (Aug 14)
- [x] Add a clear protected Democratic and Republican candidate-performance display with vote share, totals, reporting, lead margin, and called/preliminary state
- [x] Verify the display is sourced from stored election data and does not represent non-reporting races as live results

## Homepage Black Representation Map (Aug 14)
- [x] Add a Black Representation view to the homepage Election Map using the existing trusted profile and election-record data
- [x] Preserve chamber views and state/map interactions while making the Black Representation view readable on mobile

## Historical Atlas Full-Map Time Travel (Aug 14)
- [x] Compare the current Historical Atlas with the repository’s full-map boundary explorer and identify reusable data and interaction patterns
- [x] Add a full historical U.S. map with clear forward/backward era navigation and state-level historical boundary changes
- [x] Add accessible context and responsive controls without removing the Atlas’s Voting Rights Act and apportionment interpretation
- [x] Verify Historical Atlas accuracy, time navigation, desktop/mobile layout, and regression coverage

## Historical Atlas Comparison and Verified Overlays (Aug 14)
- [x] Compare two selected Congresses side by side with independently readable historical map panels
- [x] Add repository- and Voteview-backed historical party and member overlays with explicit source attribution and unavailable-data states
- [x] Verify boundary geometry, Congress controls, party/member data mapping, responsive presentation, and regression coverage

## Reporting-to-Power Intelligence Layer (Aug 14)
- [x] Create a source-backed public context layer that connects Black Politics Now reporting to relevant active races, governing institutions, and Historical Atlas records
- [x] Preserve the editorial boundary: show verified links and context only, with no automated claims or publication of unreviewed relationships

## World Elections Live Status Correction (Aug 14)
- [x] Verify Zambia’s current election status and source date against the World Elections records
- [x] Correct the public next-election ranking so a voting or results event is not displaced by a stale upcoming watch
- [x] Verify World Elections source links, status language, and homepage globe callout after the correction

## Homepage World Elections Live Alignment (Aug 14)
- [x] Apply the shared live-event ranking to the homepage World Elections callout
- [x] Verify Zambia and future results-pending events automatically replace stale upcoming labels on the homepage

## Historical Atlas Complete Playback (Aug 14)
- [x] Audit and verify all 50 states across every Historical Atlas playback Congress
- [x] Synchronize playback with national boundary changes, verified party/member overlays, and selected-state historical context
- [x] Make the Atlas playback state and coverage visible, accurate, and responsive

## Historical Atlas Boundary Availability Repair (Aug 14)
- [x] Reproduce and diagnose the full-map boundary bundle failure on the public Atlas
- [x] Add a resilient, repository-grounded boundary-bundle fallback that keeps the national map available
- [x] Verify the Atlas across multiple Congresses and overlays without the temporary-unavailable fallback

## Historical Atlas Final Launch Focus (Aug 14)
- [x] Limit final launch work to Historical Atlas reliability, completeness, and verification; defer unrelated feature expansion

## Power Context Removal (Aug 14)
- [x] Remove the public Power Context route, page, and shared navigation entry without affecting existing news, election, or Atlas workflows

## Historical Atlas Interpretation Enhancements (Aug 14)
- [x] Add a concise source-backed guided timeline of landmark Voting Rights Act map changes
- [x] Add shareable URLs for two-Congress comparisons with clear copied-link feedback
- [x] Use the user-approved source-checked archive context label for selected state boundary eras; do not claim editor approval
- [x] Verify source labeling, comparison URL behavior, accessibility, responsive design, and regression coverage

## Historical Atlas Source-by-Source Accuracy Audit (Aug 14)
- [x] Verify all 50 state boundary-era mappings and national map coverage against the UCLA repository files
- [x] Verify party/member overlay interpretation against the documented Voteview dataset contract
- [x] Verify Voting Rights Act timeline and state-note statements against authoritative primary or institutional sources
- [x] Correct or remove any Atlas claim that does not meet the source-evidence standard before publication

## Historical Atlas Full 50-State VRA View (Aug 14)
- [x] Make the central Atlas view explicitly show and describe the full 50-state national map from the Voting Rights Act era forward

## Historical Atlas Strict Launch-Readiness Review (Aug 14)
- [x] Independently audit historical boundary provenance, coverage, and map geometry fidelity
- [x] Independently audit Voteview overlay semantics and the Voting Rights Act timeline source claims
- [x] Independently audit all-state map UX, timeline/comparison interactions, mobile clarity, and load behavior
- [x] Correct verified launch blockers and document remaining limitations without claiming launch readiness prematurely

## Historical Atlas True District Geometry (Aug 15)
- [x] Validate UCLA Congress-by-Congress historical district shapefiles against official apportionment totals for all VRA-era frames
- [x] Convert and prepare a fast, source-preserving 89th–119th Congress district-geometry dataset for the public Atlas
- [x] Replace aggregated state-era map frames with validated per-Congress district boundaries and revalidate overlays, performance, and accessibility

## Historical Atlas Speed and Usability (Aug 14)
- [x] Reduce time-to-first-usable national map frame through accurate progressive loading and caching
- [x] Simplify Atlas controls and map status language so users can quickly understand state selection, timeline, and comparison actions
- [x] Preserve source-count transparency while preventing inaccurate geometry or feature totals from being presented as House-seat totals

## Admin Portrait and Election Operations Enhancements (Aug 15)
- [x] Add an immediate-start bulk workflow for all current missing portrait submissions with visible progress, failure reporting, and no automatic public changes
- [x] Expand Admin Election Ops with an authenticated manual winner-selection workflow that clearly distinguishes manual review from automated calls
- [x] Add a homepage ticker with concise, mission-appropriate language

## Homepage Results Ticker Eligibility (Aug 15)
- [x] Restrict homepage ticker entries to verified U.S. Senate and House general-election or special-election outcomes; exclude all primary results

## Manual Winner Confirmation Source Evidence (Aug 15)
- [x] Require a valid source URL before an administrator can confirm a Senate, House, or Governor winner
- [x] Persist and display the manual-call source link alongside the result without automatic public race calls
- [x] Verify validation, protected access, display behavior, and regression coverage

## Homepage Map Control Order (Aug 15)
- [x] Alphabetize the Black Rep, Governor, House, and Senate map controls on desktop and mobile homepages

## Historical Atlas Playback Acceptance Repair (Aug 15)
- [x] Reproduce the incomplete-state playback rendering across early, middle, and current Congress frames
- [x] Fix frame loading and playback state so every transition visibly renders the full 50-state map
- [x] Verify continuous desktop and mobile playback through multiple frame transitions before publishing

## Atlas, Globe, and Homepage Review Controls (Aug 15)
- [x] Add in-site homepage palette review controls so color directions are visible without external preview links
- [x] Correct the desktop homepage globe alignment within its World Elections card
- [x] Add a compact Admin Atlas and World Elections operations view with map-frame and source-refresh status
- [x] Add slower Atlas playback controls with clear speed settings and a readability-first default
- [x] Implement verified-data homepage globe refresh so the card automatically re-ranks human-approved World Elections records
- [x] Add additional homepage palette directions to the in-site color review

## Bright Gold Contrast Tuning (Aug 15)
- [x] Brighten the established gold accent in dark and light themes while preserving election party and toss-up colors

## Historical Atlas Playback Progress (Aug 15)
- [x] Add a visual progress bar that shows the visible Atlas Congress frame out of all 31 frames
- [x] Keep queued-frame loading status distinct from completed frame progress during playback
- [x] Verify playback progress is synchronized on desktop and mobile

## Refined Gold Glimmer Treatment (Aug 15)
- [x] Restore a refined gold accent direction and add a restrained glimmer treatment to non-map brand accents
- [x] Preserve election-party colors and respect reduced-motion preferences
- [x] Verify gold contrast and glimmer clarity across desktop and mobile

## Active Navigation Gold Glow (Aug 15)
- [x] Add a quiet gold glow to active desktop and mobile navigation states only
- [x] Verify inactive navigation remains calm and responsive layouts preserve contrast

## Unified Historical Atlas Visual System (Aug 15)
- [x] Apply the Historical Atlas charcoal-and-gold visual treatment consistently across public pages and the Admin dashboard
- [x] Preserve all election-party, toss-up, and results-status colors as functional data colors
- [x] Verify color contrast, light/dark behavior, and responsive visual consistency

## Historical Atlas Functional Review and Louisiana v. Callais (Aug 15)
- [x] Verify 50-state map loading, playback, comparison, overlays, source links, and mobile behavior end to end
- [x] Verify Louisiana v. Callais primary-source context and add a precise Voting Rights Act timeline entry
- [x] Correct any verified Atlas functional issue and report remaining limitations without overstating readiness

## Historical Atlas Timeline and Comparison Context (Aug 15)
- [x] Add labeled progress-bar markers for source-backed legal timeline events
- [x] Add a one-click comparison workflow using the currently selected state
- [x] Add clear institutional source badges to the timeline cards
- [x] Verify markers, state comparison, source badges, and responsive behavior

## Homepage Historical Atlas Visual Parity (Aug 15)
- [x] Replace homepage-specific dark surfaces, borders, and accents that prevent visible parity with the Historical Atlas charcoal-and-gold treatment
- [x] Verify the desktop and mobile homepages visibly match the Historical Atlas visual system while preserving functional election colors

## Platform-Wide Historical Atlas Light Palette (Aug 16)
- [x] Make the Historical Atlas warm ivory background, black typography, and refined gold accents the default visual system across public pages and Admin
- [x] Preserve the separate light/dark toggle and all functional Democratic, Republican, toss-up, and election-status colors
- [x] Verify platform-wide visual consistency and responsive contrast

## Historical Atlas Light System Default (Aug 16)
- [x] Make the Atlas warm ivory, black, and refined gold visual system the default for new visitors while retaining optional dark mode
- [x] Migrate existing stored dark preferences once to the Atlas light presentation while preserving later explicit dark-mode choices

## Exact Homepage-to-Atlas Light Palette Parity (Aug 16)
- [x] Remove homepage-only ivory gradients, panel tints, and accent overrides that differ from the Historical Atlas light page
- [x] Verify the homepage matches the Atlas warm ivory surface, card, border, and refined gold colors exactly on desktop and mobile

## Exact Homepage-to-Atlas Gold Accent Parity (Aug 16)
- [x] Replace pale homepage gold accent overrides with the exact deeper ochre-gold used by the Historical Atlas
- [x] Verify wordmark, labels, buttons, borders, icons, and active controls match the Atlas gold on desktop and mobile

## Mobile Map Detail Overflow Repair (Aug 16)
- [x] Replace the off-screen mobile selected-state card with a fully visible responsive detail treatment
- [x] Verify Black Representation, Governor, House, and Senate state details do not obstruct or overflow the mobile map
- [x] Ensure Alaska and every other state remain fully visible within the mobile map frame
- [x] Clamp desktop edge-state popups so Alaska and every selected state detail remain fully visible

## Atlas Color Parity Follow-up (Aug 16)
- [x] Compare the rendered Homepage and Historical Atlas style sources to identify the remaining visible color mismatch
- [x] Apply the exact Historical Atlas warm-ivory and deep-ochre visual values to the homepage without changing functional map colors

## Full Platform and Candidate Image Verification (Aug 16)
- [x] Verify public site and mobile-app workflows, responsive layouts, navigation, data views, and error states
- [x] Audit Senate, House, Governor, and Black Representation records for candidate-image presence, reachability, and visible rendering readiness
- [x] Verify protected Admin dashboard tabs, permissions, queues, operations controls, and Election Day readiness workflows
- [x] Identify confirmed strengths, shortcomings, data errors, broken assets, and prioritized remediation work in a source-grounded report

## Private GitHub Export Preparation (Aug 16)
- [x] Inspect the current Git state and determine the correct private GitHub destination for the Black Politics Now application
- [x] Prepare a clean, documented project export without environment secrets, local build outputs, or transient audit data
- [x] Create or update the approved private GitHub repository and verify the pushed branch

## Verification Findings Remediation (Aug 16)
- [x] Verify and correct the five likely cross-candidate portrait mismatches with source evidence
- [x] Create review-safe portrait backfill work for all remaining confirmed candidate image gaps
- [x] Remove the duplicate mobile Election Center rating legend while preserving an accessible legend
- [x] Clarify the public election map freshness display using record-update and operational-heartbeat context
- [x] Complete an owner-authenticated Admin dashboard acceptance pass across protected operational workflows
- [x] Re-run complete regression, type, data, and responsive verification after remediation
- [x] Stage five source-verified portrait corrections for private human review without changing public records
- [x] Apply the five staged portrait corrections after an administrator reviews and approves each source package
- [x] Validate all protected Admin workspace queries through a non-destructive admin-equivalent application context

## Portrait Review Workspace Completion (Aug 16)
- [x] Add visible queued, in-progress, ready-for-review, blocked, and completed batch filters to Portrait Review
- [x] Add a detail workspace for each research finding with candidate target, portrait preview, and linked source evidence
- [x] Add explicit approve and reject controls that preserve the existing review-before-public-change safeguard
- [x] Verify the protected Portrait Review workflow on desktop and mobile with regression coverage

## Fresh Admin Dashboard Verification (Aug 16)
- [x] Verify Admin route protection, all dashboard workspaces, live data, and controlled operations without changing public data
- [x] Audit Portrait Review, Command Center, Agent Desk, Podcast Ops, Election Ops, and Atlas & World workflows for weak or incomplete behavior
- [x] Inspect desktop and mobile Admin usability, navigation, error states, and empty states
- [x] Fix the confirmed Portrait Review React key warning and recheck the Admin console
- [x] Deliver a candid, prioritized Admin dashboard verification report with recommendations

## Admin Election Status Accuracy Repair (Aug 16)
- [x] Replace the false live-engine badge that relies on historical percentage fields with the authoritative election heartbeat mode
- [x] Verify the Overview and Command Center present consistent election-engine status on desktop and mobile

## Portrait Review Live Access Correction (Aug 16)
- [x] Diagnose why the live Admin Portrait Review workspace is not visibly reachable from the dashboard navigation
- [x] Add a direct, visible path to the active portrait batch filters and review workspace
- [x] Verify the live route on desktop and mobile, including the active-batch status controls

## Visual Portrait Approval Workflow (Aug 16)
- [x] Identify which research findings contain a verified image URL and source URL sufficient to create a portrait submission
- [x] Add a protected review-only conversion from an evidence-backed research finding to a pending visual portrait submission
- [x] Show the candidate portrait, source evidence, and explicit approve or reject actions in the selected finding detail
- [x] Clearly label research-only findings with no usable image evidence as not approval-ready
- [x] Verify the visual portrait approval workflow on desktop and mobile with regression coverage

## Portrait Proposal Visibility Correction (Aug 16)
- [x] Inspect live active-batch records to confirm why no image-backed proposal is visible in Portrait Review
- [x] Make every finding’s evidence status and next action visible without requiring a hidden eligibility condition
- [x] Add a clear entry path from a research-only finding to the existing image-and-source portrait submission form
- [x] Reclassify current and future portrait research with no source proposal as evidence-needed rather than review-ready
- [x] Verify the live proposal-to-approval interface on desktop and mobile using a source-backed review package

## Admin Controls and Copy Audit (Aug 16)
- [x] Repair the dead Open active research batch control so it moves directly to the active batch workspace
- [x] Inventory every Admin action, navigation link, form control, status label, and informational-only element
- [x] Verify and correct confirmed control failures, unclear labels, and missing user feedback across desktop and mobile
- [x] Deliver a candid Admin controls report distinguishing working functions, informational status, deferred functionality, and outstanding gaps

## Strict Safe-Action Admin Verification (Aug 16)
- [x] Execute every non-destructive Admin navigation, filtering, refresh, and private-review control through the protected application surface
- [x] Verify safeguards for approval, publication, race-call, automation, and other public-impact controls without executing them
- [x] Verify desktop and mobile feedback for successful, blocked, empty, and error states across all Admin workspaces
- [x] Deliver a complete click-by-click Admin control status matrix
- [x] Record any control that cannot receive literal browser interaction and verify its protected application procedure instead

## Homepage Autonomy and Black Representation General-Election Audit (Aug 16)
- [x] Verify the current homepage data-refresh paths, trigger cadence, and approved-record safeguards
- [x] Compare viable background-refresh approaches and document the selected operational model
- [x] Add a bounded in-page refresh for homepage election and Black Representation data while preserving approved-record safeguards
- [x] Audit Black Representation candidates against official 2026 primary and runoff outcomes for general-election advancement
- [x] Prepare source-backed status updates and identify candidates that remain pending, contested, or require manual review
- [x] Validate the homepage displays only approved, current Black Representation data after updates

## Operational Readiness Upgrade (Aug 16)
- [x] Verify homepage data-refresh health and surface a clear refresh status panel in Admin
- [x] Add an all-candidates Admin workspace for Senate, House, Governor, and Black Representation candidate coverage and portrait status
- [x] Repair the homepage mini-globe Africa rendering defect without changing the globe’s country data or interactions
- [x] Verify the Daily Intelligence Brief’s latest complete episode has both Andrew and Jenny audio for every required segment
- [x] Confirm the daily guard and recovery workflow fails safely when either voice is incomplete
- [x] Re-run technical, visual, and operational verification across the new Admin and homepage features

## Homepage Andrew-to-Jenny Playback Verification (Aug 16)
- [x] Inspect the homepage Daily Brief voice-switching implementation and current segment-audio selection rules
- [x] Verify Andrew and Jenny segment URL resolution, direct audio availability, and switch-state behavior
- [x] Add a visible homepage Andrew and Jenny selector and preserve segment position when switching an active track
- [x] Repair any confirmed homepage voice-switching defect and test desktop and mobile playback selection
- [x] Document the verified homepage dual-voice result

## Autonomous Dual-Voice Full Episodes and Podcast Recovery (Aug 16)
- [x] Add a verified Jenny full-episode asset alongside Andrew’s daily full episode
- [x] Require both full-episode assets and all paired segment assets before a Daily Brief is marked ready for public playback
- [x] Make the public homepage and Podcast page full-episode control honor the selected Andrew or Jenny voice
- [x] Add an Admin Podcast Operations recovery console with voice-specific status and safe manual repair controls
- [x] Add a durable Admin recovery request queue that the existing daily automation consumes and records as completed or held
- [x] Verify automatic morning generation, safe recovery behavior, and manual repair safeguards without publishing incomplete audio

## Complete Candidate, Portrait, and Agent Editorial Workflow (Aug 16)
- [x] Add direct download controls for both Andrew and Jenny full Daily Brief episode files
- [x] Make every Admin candidate row actionable with portrait coverage, evidence, research, and review entry points
- [x] Rebuild Portrait Review around clear research, evidence-needed, pending visual review, approved, and rejected states
- [x] Restore and verify the Proposed Changes Run research control with clear progress and result feedback
- [x] Audit current AI-agent utilization, identify unused safe capacity, and add the highest-value practical agent controls
- [x] Verify all candidate, portrait, proposed-change, download, and agent workflows on desktop and mobile

## Daily Brief Structure and Agent Operations Upgrade (Aug 16)
- [x] Audit the current Daily Brief segment sequence, greeting and closing coverage, script/audio duration integrity, sources, and homepage player context
- [x] Add official-source lead suggestions for all evidence-needed portrait candidates and surface a daily agent summary on Admin Overview
- [x] Persist a durable morning operational snapshot from the existing Daily Brief production workflow
- [x] Add precise active segment title, ordinal, and progress context to the homepage and persistent audio player
- [x] Display the existing opening greeting and closing as playable first and last Daily Brief segments instead of hiding them from homepage lists
- [x] Require source context for editorial analysis segments while retaining opening and closing as structured listener guidance
- [x] Enforce a Daily Brief structural gate requiring a greeting, 13 editorial segments, and a closing before daily publication
- [x] Verify all Daily Brief segments have source context, correct sequence, paired audio, and independent greeting/closing playback
- [x] Deliver a complete Daily Brief production workflow and recommendations report

## Agent Workflow Re-Audit and Completion (Aug 16)
- [x] Verify whether portrait research, Daily Brief automation, candidate actions, downloads, and Proposed Changes research are visibly usable in the live interface
- [x] Identify missing agent handoffs, approval controls, and progress feedback that prevent a complete portrait or podcast workflow
- [x] Add a candidate-detail action workspace with photo evidence, private AI research, pending-review, and decision entry points
- [x] Restore a direct Run research now action in the empty Proposed Changes workspace with explicit task handoff feedback
- [x] Repair confirmed incomplete or hidden actions and add the highest-value safe agent controls
- [x] Verify complete candidate-to-portrait-decision, podcast-operations, and Proposed Changes workflows on desktop and mobile
- [x] Deliver candid agent-use findings and prioritized operational recommendations

## Simplified AI Portrait Review Desk (Aug 16)
- [x] Replace fragmented portrait operations with a candidate-first AI image review queue
- [x] Present image candidates as visual evidence cards with source links and a single explicit approve or deny decision
- [x] Keep technical research and evidence-needed states in background status rather than the primary decision flow
- [x] Verify the simplified candidate-to-search-to-decision workflow on desktop and mobile

## Bulk Portrait Review and Candidate Image Status Accuracy (Aug 16)
- [x] Audit mapped candidate images for reachability and distinguish verified, missing, and needs-verification states
- [x] Conduct a visual candidate-to-image identity audit for every reachable candidate portrait and route uncertain assignments to review
- [x] Remove the confirmed Steve Cohen Tennessee portrait from the unrelated California 50 candidate record
- [x] Make All Candidates labels reflect verified image availability rather than a stored or fallback URL alone
- [x] Add a bulk AI portrait review queue that supports individual visual approve or deny decisions without automatic publication
- [x] Add bulk AI image-search start and sequential pending-image review controls to the candidate-first Portrait Review desk
- [x] Replace the misleading Photo mapped wording with conservative Image missing, Needs verification, or Review image statuses
- [x] Block bulk approval when a proposed image preview cannot load and clearly mark that review item as image unavailable
- [x] Verify bulk review progress, photo-status labels, and responsive actions on desktop and mobile

## Repository-Grounded Portrait Identity Recheck (Aug 16)
- [x] Deferred by user decision — remaining identity checks will be completed through the manual Portrait Review workspace
- [x] Preserve the repository-grounded manifest and conservative Needs verification state for manual review
- [x] Keep automatic public image changes blocked until an administrator explicitly approves source-supported visual evidence
- [x] Retain the unresolved review queue rather than representing these portraits as verified

## Admin Site Engagement and Visits (Aug 16)
- [x] Define privacy-preserving anonymous visit and engagement metrics for the public site
- [x] Add page-view persistence and protected Admin engagement summary procedures
- [x] Replace the deferred Audience workspace with an Admin engagement dashboard for visits, unique sessions, top pages, devices, and recent activity
- [x] Test the anonymous tracking pipeline and visually verify responsive Admin analytics views

## Autonomous World Elections Source Monitoring (Aug 16)
- [x] Add a scheduled, authenticated source-monitoring endpoint for World Elections that cannot alter public records
- [x] Schedule daily baseline monitoring with a higher-frequency check for the rolling 30-day election window and voting-day records
- [x] Surface the schedule cadence, last run, and review-only recommendations in Admin Atlas & World operations
- [x] Verify the schedule registration, public-data safeguards, and Admin visibility after deployment

## Daily Intelligence Brief Recovery (Aug 17)
- [x] Diagnose why the August 17 guarded Daily Brief run did not publish
- [x] Run the existing lock-safe recovery guard and require the full sourced Andrew/Jenny publication gate
- [x] Confirm the public episode, both full voice files, and the durable Admin operational snapshot are current
- [x] Record the cause and prevention status for the missed scheduled run

## Daily Intelligence Brief Safeguards (Aug 17)
- [x] Send an owner alert when the Daily Brief has not passed its full publication gate by 6:30 AM ET
- [x] Persist and display the latest source-preflight readiness state in Admin Podcast Ops
- [x] Add a protected one-click current-date recovery control that only queues the existing guarded recovery workflow
- [x] Verify alert idempotency, role protection, recovery queue safety, and responsive Podcast Ops presentation

## Daily Intelligence Brief Safeguards End-to-End Verification (Aug 17)
- [x] Reconfirm the deployed current-date preflight, dual-voice publication, and durable 6:30 gate assessment
- [x] Re-run non-destructive alert and empty-queue worker checks to validate idempotency and guard boundaries
- [x] Reconfirm Admin role protection and current-date recovery queue behavior without creating test recovery data
- [x] Report verified behavior and any remaining production limitation transparently

## World Elections Country Labels (Aug 17)
- [x] Compare the original repository globe’s country-label behavior and geographic data with the current World Elections globe
- [x] Add repository-grounded country labels and selected-country explorer context without obscuring globe interaction
- [x] Verify label coverage and responsive desktop/mobile readability for the World Elections experience

## World Elections Label Strict Acceptance Check (Aug 17)
- [x] Compare original repository label coverage and interaction expectations with the deployed globe implementation
- [x] Revalidate all live country labels, marker selection, and drawer behavior without relying only on static tests
- [x] Correct the confirmed full-catalog implementation gap and retest the globe

## World Elections Full Country-Label Parity (Aug 17)
- [x] Port the original repository’s full 180-country centroid and short-label catalog to the World Elections globe
- [x] Apply the original decluttering and callout policy while preserving bright tracked-election labels and subdued contextual labels
- [x] Verify full-catalog coverage, clickable tracked-country labels, and desktop/mobile readability before publishing

## World Elections Explorer Controls (Aug 17)
- [x] Add a label-density control for full context, election focus, and minimal views
- [x] Allow country search and index selection to rotate and focus the globe on the selected country
- [x] Add a compact all-country index beside the globe with tracked-election status and globe-focus actions
- [x] Verify Explorer controls, keyboard access, desktop/mobile layouts, and full label coverage before publishing

## Cross-Repository Parity Audit (Aug 17)
- [x] Inventory the other selected repositories and identify their public features, source data, and parity candidates
- [x] Compare each repository with the live Black Politics Now implementation and distinguish complete parity from deliberate scope differences
- [x] Verify material repository-grounded gaps and prioritize safe improvements without inventing unsupported data
- [x] Deliver a clear parity matrix and recommended implementation order

## Full Legacy-Surface Repository Parity Program (Aug 17)
- [x] Create a complete legacy-surface inventory for both selected repositories and map each item to an integrated platform destination
- [x] Build dedicated source-backed World Results and World Referendums views
- [x] Port the original World Elections alert and remaining deterministic explorer surfaces
- [x] Port remaining Daily Intelligence Brief listener, editorial, quality, search, and Admin operations surfaces
- [x] Backfill only source-verified historical Jenny full episodes; one eligible August 15 mix was rebuilt and 85 records remain safely held for missing provenance
- [x] Deferred by user direction — subscriber digest will remain out of scope until an outbound delivery configuration is selected
- [x] Run code, data, responsive visual, operational, and repository-parity acceptance checks across the reviewed repositories

## Daily Intelligence Brief Embed Route Repair (Aug 17)
- [x] Verify the public Podcast link uses the registered `/embed` route; no repair was required
- [x] Verify the standalone player’s voice choice, audio action, responsive framing, and public route registration

## Historical Atlas Repository Parity (Aug 17)
- [x] Inventory the Historical Atlas repository’s map frames, timeline, state-detail, comparison, and source surfaces against the live Atlas
- [x] Correct the confirmed Atlas interaction gaps without weakening the verified UCLA boundary and legal-event provenance
- [x] Verify all 50 states, all 31 VRA-era frames, playback controls, comparison URLs, and responsive source context before final acceptance

## Mobile App and Election Banner Verification (Aug 17)
- [x] Confirm whether the mobile election banner has motion, reduced-motion behavior, and accessible interaction states
- [x] Verify responsive public routes: home, election map, World Elections, Historical Atlas, podcast, archive, and Research Desk
- [x] Verify protected Admin routes and safe mobile controls without publishing or changing production records
- [x] Correct confirmed mobile defects and document the final app acceptance result

## Daily Intelligence Brief Post-July 27 Accuracy and Flow Audit (Aug 17)
- [x] Preserve the pre-July archive state and inventory the original repository’s historical coverage contract without modifying scripts or segments
- [x] Audit every post-July 27 episode for opening/closing order, editorial segment count, approved-topic adherence, source provenance, dual-voice assets, and duration consistency
- [x] Examine post-July scripts and source packages for topic drift, unsupported assertions, duplicate coverage, and flow defects
- [x] Compare findings to the original repository contract, correct only confirmed evidence-backed defects, and produce a dated audit report
- [x] Replace the misleading public “Audio preparation” wording on structurally incomplete post-July archive drafts with an explicit archive-integrity hold disclosure

## Daily Brief Benchmark Standard and Editorial QA Scorecard (Aug 17)
- [x] Formalize the original pre-July episode contract as measurable structure, topic, source, flow, duration, and dual-voice quality gates
- [x] Score every post-July episode against the benchmark without rewriting source-incomplete history
- [x] Surface a protected Editorial QA Scorecard in Podcast Ops with episode-level gate evidence and clear hold reasons
- [x] Require the benchmark standard in future Daily Brief publication and recovery safeguards
- [x] Test the scorecard, future-publication gate, and responsive Admin presentation

## Daily Brief Preservation and Remediation Clarification (Aug 17)
- [x] Reconfirm the original pre-July archive records remain metadata- and URL-identical to the source repository baseline
- [x] Separate post-July releases actually rebuilt to the standard from records only classified as integrity holds
- [x] Deliver the verified distinction without claiming a held historical draft was remediated

## Dated Daily Brief Reconstruction and Autonomous Quality Program (Aug 17)
- [x] Snapshot the July 28–August 17 archive records and preserve a reversible audit trail before historical reconstruction
- [x] Collect date-appropriate source packages for every held historical Daily Brief and exclude dates that cannot meet the sourcing standard
- [x] Rebuild held briefs in guarded batches with complete scripts, topic flow, paired Andrew/Jenny segments, and verified full mixes
- [x] Audit every reconstructed release against the 100-point benchmark and retain explicit holds for any date that cannot pass
- [x] Harden daily preflight, publication, alert, recovery, and QA monitoring so future briefs cannot publish below the benchmark
- [x] Deliver the reconstructed-archive coverage and remaining evidence-gap report

## Historical Reconstruction Audio-Gate Propagation (Aug 18)
- [x] Ensure a paired-audio synthesis failure causes the reconstruction runner to hold the date rather than reporting it complete
- [x] Repair and re-run the held August 10 audio path only after the source and script package remain intact
- [x] Verify the reconstruction report distinguishes fully rebuilt dates from source-passed records still awaiting audio completion

## Historical Reconstruction Generation Timeout (Aug 18)
- [x] Ensure a stalled sourced-script generation cannot block a serialized reconstruction batch indefinitely
- [x] Hold and preserve the stalled July 28 date until its bounded generation retry can complete with the frozen source package
- [x] Resume only verified remaining dates after the runner reports an explicit pass or hold outcome

## Historical Reconstruction Frozen-Source Recheck (Aug 18)
- [x] Ensure a retry uses its persisted passed source package instead of re-querying and invalidating dated evidence
- [x] Re-run the held August 14 reconstruction only after the frozen source-package guard is enforced
- [x] Verify retries retain the exact reviewed source evidence that passed the initial preflight

## World Elections Globe Label Visibility (Aug 17)
- [x] Increase country-label contrast and small-country callout readability while retaining tracked-election visual priority
- [x] Verify label visibility at desktop globe size without obscuring navigation or country selection
- [x] Verify the lighter label treatment at mobile globe size before publication

## Election Night Launch Readiness (Aug 18)
- [x] Verify real-time DDHQ polling, tracker heartbeat, live race coverage, and autonomous election-night behavior
- [x] Verify and refresh Zambia’s World Elections result from authoritative sources and approved record workflow
- [x] Reduce World Elections globe size so desktop and mobile layouts fit without clipping
- [x] Remove the U.S. Election Map from the mobile app while retaining website-only U.S. map access
- [x] Improve Black Representation map naming and audit ratings so no race is misleadingly shown as Toss-up
- [x] Verify the reconstructed August 17 Daily Intelligence Brief remains fully published in both voices
- [x] Add the requested Manus recognition mark at the lower-right screen edge without obscuring content
- [x] Run and publish desktop/mobile Election Night launch-readiness checks and checklist

## UCLA District Geometry & Election Night Simulation (Aug 18)
- [x] Inventory the validated UCLA Congress-by-Congress geometry source, current Historical Atlas renderer, and homepage House-map color tokens
- [x] Document the exact visual mismatch between the district geometry and homepage House election map
- [x] Identify and tighten unused lower-page whitespace without breaking the desktop single-screen dashboard or mobile stacked layout
- [x] Apply the shared House-map rating palette and legend semantics to the UCLA district-geometry display without changing verified boundaries
- [x] Verify congressional district geometry, accessibility, interactions, and desktop/mobile rendering after the visual alignment
- [x] Define the simulation date, race scope, no-public-write guardrails, success criteria, and rollback path
- [x] Validate the election guard, DDHQ mapping, database heartbeat, logs, and owner-alert path in review-safe simulation mode
- [x] Execute the protected four-step rehearsal directly with a durable private record and no public race, source, alert, or publishing action
- [x] Run the controlled election-night simulation without changing public results or sending unintended notifications
- [x] Publish the completed simulation checklist, manual operator steps, and exception-handling instructions
- [x] Verify the completed UCLA geometry, layout, and simulation-readiness changes are committed and synchronized to the selected private GitHub repository

## Election Night Visibility and Reconciliation (Aug 18)
- [x] Inventory the live heartbeat, race, triage, and source-review fields available for public-safe and Admin-only operations views
- [x] Audit the homepage results ticker’s eligibility, data refresh, animation, pause control, and responsive website/mobile rendering
- [x] Repair any confirmed ticker-banner defects and verify reliable website and mobile-app behavior without showing primary outcomes
- [x] Add a compact public Election Night status strip that exposes source health, polling cadence, coverage, and result-call status without disclosing private operations
- [x] Add a compact protected source-conflict review queue that prioritizes discrepancies while preserving human approval before any public correction
- [x] Generate a source-grounded post-election reconciliation report with coverage, calls, exceptions, and follow-up actions
- [x] Add regression coverage and verify desktop/mobile public and Admin rendering for the new election operations surfaces
- [x] Run production checks, save the published checkpoint, synchronize the selected private GitHub repository, and deliver the completed checklist

## Post-Certification Results Archive (Aug 18)
- [x] Inventory final-result fields, existing source-evidence controls, and public archive routes before defining the certification archive contract
- [x] Add immutable archive tables and a protected Admin certification workflow that requires an authority source and cannot archive preliminary returns
- [x] Implement certified Senate, House, Governor, and referendum ledger snapshots with source evidence and certification metadata; no live snapshot was created because no current records are Certified
- [x] Add public archive discovery and a responsive archive detail view that clearly distinguishes certified records from live or preliminary election data
- [x] Add regression coverage for public-safe reads, Admin-only certification, certification-source requirements, and immutable archive snapshots
- [x] Run responsive verification, full release checks, publish the checkpoint, synchronize private GitHub, and deliver the completed archive checklist

## Homepage Map Scale and Organic Ticker Flow (Aug 18)
- [x] Audit the desktop and mobile homepage map containers to identify the oversized footprint without changing the three-column desktop dashboard or mobile stacked layout
- [x] Reduce the homepage map visual footprint while preserving the full map, state interaction, legend, and accessible search controls
- [x] Remove the ticker’s visible pause/resume button and repair the motion track for smooth, continuous, organic flow on website and mobile app
- [x] Verify the refined homepage map and ticker behavior across desktop and mobile, then run regression checks, publish, synchronize GitHub, and deliver the completed checklist

## Daily Operations and Primary-Election Recap (Aug 19)
- [x] Audit today’s Daily Intelligence Brief source preflight, full Andrew/Jenny publication state, and automation logs
- [x] Diagnose why the results ticker appears stationary despite the continuous-flow release and repair any confirmed desktop/mobile issue
- [x] Verify the homepage World Elections card identifies the correct next election and country from current reviewed records, then refresh only through safeguarded review workflows if stale
- [x] Reconcile last night’s primary-election guard, race mapping, heartbeat, update, call, error, and notification records without treating primary outcomes as public general-election results
- [x] Produce an evidence-based operational recap and complete the public/Admin validation, release checks, publication, GitHub sync, and checklist

## August 18 Primary-Election Outcomes Recap (Aug 19)
- [x] Identify all jurisdictions and contests that held August 18 primaries, special primaries, or runoffs
- [x] Gather official election-authority results and independent reporting for each confirmed notable outcome
- [x] Reconcile reported outcomes against the platform’s primary winner fields without publishing primary outcomes to general-election-only surfaces
- [x] Write and deliver a clearly sourced public recap that separates confirmed winners, ongoing counts, and platform operations

## Public Map Verification (Aug 19)
- [x] Verify current homepage U.S. map ratings, results timestamp, and the intentional exclusion of primary outcomes from general-election surfaces
- [x] Verify current homepage World Elections card data, Cook Islands completed context, and Bangladesh next-election context
- [x] Correct any confirmed freshness or display defect without representing primary returns as general-election calls, then deliver the completed map checklist

## Public U.S. Primary Results Map (Aug 19)
- [x] Locate the internal August 18 primary-outcomes recap and reconcile each public-map entry to source-backed result evidence
- [x] Add a clearly labeled Primary Results map view that is visually and semantically separate from General Election ratings, calls, and certified results
- [x] Display result-level source links, preliminary/official status, and last-updated context without overstating unresolved counts
- [x] Verify desktop/mobile map behavior, run regression checks, publish, synchronize GitHub, and document where the new public primary map is available

## Live Results Ticker Motion Repair (Aug 19)
- [x] Inspect the deployed ticker’s computed animation, reduced-motion state, layout width, and current result payload on desktop and mobile
- [x] Replace any unreliable CSS-only motion path with a resilient continuous animation that visibly advances without a pause/resume control
- [x] Verify observed motion over time on desktop and mobile, run regression checks, publish the fix, synchronize GitHub, and document the completed repair

## Admin Dashboard Accuracy and Timeliness (Aug 19)
- [x] Audit freshness, source state, and failure conditions for Admin Overview, Election Ops, World Elections, Podcast Ops, Agent Desk, Candidate and Portrait Review, and Audience data
- [x] Add consistent freshness labels, last-success timestamps, stale/degraded states, and clear next-action guidance to relevant Admin Dashboard workspaces
- [x] Validate protected Admin data paths, timed refresh behavior, and no-data/error states across desktop and mobile
- [x] Run regression checks, publish the Admin accuracy release, synchronize GitHub, and document the completed dashboard checklist

## Black Representation Primary-Results Comparison (Aug 19)
- [x] Preserve the provided article and its WordPress URL as a read-only comparison source; do not edit, rewrite, move, or alter either
- [x] Extract all Black Representation candidates, districts, outcomes, and status claims from the provided August 18 primary-results article
- [x] Compare article claims against current Black Representation members and election records, identifying missing, stale, or inconsistent entries
- [x] Verify material differences using official election authorities or independent reporting before editing any public map record
- [x] Apply only evidence-supported Black Representation map updates with status, source, and timestamp context
- [x] Validate the desktop primary and Black Reps map views, run checks, publish, synchronize GitHub, and deliver the comparative audit checklist

## Black Representation State Comparison and Timeline (Aug 19)
- [x] Inventory existing Black Representation views, public data contracts, and source-status fields
- [x] Add a state-level comparison dashboard for tracked people, contest transitions, source coverage, review needs, and recent activity
- [x] Add visible Source reviewed, Article reference, and Source review badges to Black Representation records and profile detail
- [x] Add a primary-to-general record timeline with stage labels, dates, state focus, and source links
- [x] Verify responsive public views and source safeguards, run regression checks, publish, synchronize GitHub, and document the completed feature checklist

## Launch Cleanup: Remove Public Primary Map (Aug 19)
- [x] Identify every public Primary Results map tab, legend, summary, source panel, and related launch-facing copy
- [x] Remove the public Primary Results layer while preserving the general-election map, Black Representation records, and internal primary evidence
- [x] Verify desktop/mobile launch surfaces no longer expose a primary map, run checks, publish, synchronize GitHub, and document the completed cleanup

## Admin AI Research Task Repair (Aug 19)
- [x] Trace the Admin AI research button through its protected procedure, persisted task or recommendation state, and worker/agent execution path
- [x] Identify the actual failure mode from runtime, network, and database evidence without creating unintended public changes
- [x] Replace unavailable AI research controls with deterministic evidence packages and official-source portrait review, with protected regression coverage and clear Admin completion feedback
- [x] Validate Admin AI research task creation and completion, run checks, publish, synchronize GitHub, and document the completed diagnostic checklist

## Black Representation Election Corrections and Candidate Removal (Aug 19)
- [x] Verify Wisconsin governor, U.S. Virgin Islands governor, South Carolina governor, South Dakota Senate, Texas 31, and Texas 33 claims from the user’s uploaded material
- [x] Compare each verified outcome to current Black Representation profiles and contest records, retaining unresolved or conflicting claims for review
- [x] Apply only independently supported Black Representation candidate, contest, status, vote, opponent, and source corrections
- [x] Add protected candidate-removal controls with explicit confirmation, documented reason, dependency-aware safeguards, and no accidental bulk deletion
- [x] Validate corrected public records and Admin deletion controls, run checks, publish, synchronize GitHub, and deliver the completed correction checklist

## Daily Intelligence Brief Spoken Structure Repair (Aug 19)
- [x] Audit current full Andrew/Jenny assembly order, greeting and closing assets, segment scripts, and source-backed spoken-introduction coverage
- [x] Define and enforce a detailed spoken structure: full-episode greeting, segment title/introduction, editorial transition, source-grounded reporting, and closing
- [x] Repair the assembly and generation path so both full voices include audible structural breaks rather than a continuous monologue
- [x] Validate transcript, segment order, Andrew/Jenny full mixes, duration, and public playback; run checks, publish, synchronize GitHub, and document the editorial repair

## Comprehensive Launch Reliability Pass (Aug 19)
- [x] Re-verify the Admin Research Desk action end-to-end and confirm its deterministic evidence-package method creates a reviewable result without unavailable AI dependencies
- [x] Re-verify that relevant Admin save actions persist to the public homepage data surfaces and correct any confirmed disconnect
- [x] Remove the launch-facing Election Watch strip and reclaim its homepage space without changing the underlying election monitor or Admin Command Center
- [x] Diagnose and remove the Africa globe black artifact while preserving live World Elections data, country outlines, and globe interactions
- [x] Add accurate text-to-speech pronunciation guidance for Anthropic in Daily Intelligence Brief scripts and voice generation
- [x] Remove unfulfillable listener requests from Daily Intelligence Brief segment endings and preserve only editorial transitions or closings
- [x] Separate Global Political Briefs from American Political Briefs with a source-grounded non-U.S. editorial requirement and remove misplaced American-only reporting
- [x] Audit the University of Texas item in today’s Daily Brief, remove it if it is not directly relevant, and retain source-grounded replacement coverage
- [x] Analyze every August 19 Daily Intelligence Brief segment against the Natural Disaster and Extreme Weather standard for sourcing, structure, global relevance, transitions, and listener utility
- [x] Validate desktop/mobile homepage and protected Admin behavior, both full voices, tests, build, checkpoint, GitHub sync, and completed analysis checklist

## Candidate Removal Discoverability (Aug 19)
- [x] Locate the current protected Black Representation profile and contest removal controls within the Admin candidate workflow
- [x] Add a clear candidate-list action and guidance that opens the safeguarded removal flow without enabling accidental deletion
- [x] Verify the visible removal path, confirmation requirements, audit behavior, tests, build, checkpoint, and delivery checklist

## Candidates-Level Management and Save Verification (Aug 20)
- [x] Verify the Candidates tab visibly presents Manage / delete profile for Black Representation candidate cards and opens the matching protected record
- [x] Verify a protected candidate save persists to the shared public data contract and reaches the homepage within the documented 60-second refresh interval
- [x] Repair any confirmed Candidates-level management or save-propagation defect, run checks, publish, and deliver the completed verification checklist

## Daily Intelligence Brief Status Check (Aug 20)
- [x] Verify today’s source preflight, greeting and segment structure, Andrew/Jenny full-episode URLs, durations, and passed publication state
- [x] Report the verified completion status or identify the exact guarded recovery action required

## Guarded Daily Brief Recovery (Aug 20)
- [x] Refresh the blocked Global Economy source preflight using fresh, independent coverage without weakening source-quality rules
- [x] Run the current-date guarded generation, dual-voice audio, and full publication gates only after the source preflight passes
- [x] Verify the complete Andrew/Jenny release, segment structure, duration, and source evidence before reporting recovery completion

## Historical Atlas Map Fit and Party Transitions (Aug 20)
- [x] Audit Historical Atlas screen fit, party overlay semantics, and shared homepage red/blue/purple color tokens
- [x] Prioritize the national map in the desktop and mobile layouts so its full 50-state frame is visible without excessive introductory whitespace
- [x] Default to and clearly label a verified Party transitions overlay using Democratic blue, Republican red, and purple other/independent colors
- [x] Validate historical party-switch comparison behavior, responsive screen fit, tests, build, publication, and the completed map checklist

## UCLA-Referenced Historical Atlas Flagship Upgrade (Aug 20)
- [x] Audit UCLA Congressional District Maps reference features against current Atlas district coverage, controls, state access, party transitions, and source disclosures
- [x] Verify all 50-state Congress-by-Congress frame coverage and identify any missing, clipped, or ambiguous district presentation
- [x] Add source-verified district detail, state exploration, transition comparison, and visual refinements needed for a flagship public Atlas
- [x] Validate UCLA-aligned accuracy, 50-state presentation, desktop/mobile usability, tests, build, publication, and detailed completion report

## Independent Historical Atlas Launch-Readiness Verification (Aug 20)
- [x] Independently verify UCLA reference alignment, 31-frame registry, all-frame 50-state coverage, geometry identifiers, party overlays, and Census apportionment contracts
- [x] Verify district-selection source-detail wiring, playback, comparison, keyboard controls, loading/error states, and shareable URL behavior; document the isolated SVG-input harness limitation and ordinary-reader acceptance step
- [x] Complete launch-visible desktop and mobile review for screen fit, labels, legends, controls, accessibility, and overflow; correct the confirmed map-priority issue only
- [x] Run final tests, TypeScript, build, production checks, and publish a plain-language launch-readiness decision with all remaining limitations

## Atlas Source Tag and Playback Verification (Aug 20)
- [x] Add a map-visible, accessible UCLA source tag that distinguishes geometry from Census apportionment and Voteview overlays
- [x] Verify playback sequencing from the 89th through 119th Congress, including validated-frame readiness, pause, restart, speed selection, and completion behavior
- [x] Verify the playback controls in desktop and mobile layouts, run final quality gates, publish the update, and document the sandbox production-build memory limitation

## Admin Atlas Operations (Aug 20)
- [x] Add Admin-only Atlas frame-health status with 31-frame, 50-state, geometry, party-overlay, source-boundary, and verification-history visibility
- [x] Add a guarded Admin playback check that records start, readiness, pause, speed, final-frame completion, and restart outcomes without changing public map data
- [x] Add editor-approved historical notes with state/Congress scope, source links, draft/approved visibility, public presentation, and full audit metadata
- [x] Verify protected Admin access, public source boundaries, desktop/mobile workflow, regression tests, build, publication, and Atlas Operations completion report

## Atlas Playback and Full-Page Launch-Blocking Verification (Aug 20)
- [x] Trace and exercise the Admin “Run playback check” mutation through authorization, execution, database persistence, refetch, and visible success/error feedback
- [x] Independently verify all 31 UCLA frame assets, 50-state/region coverage, district boundary fidelity signals, party/member overlays, apportionment context, and source disclosures
- [x] Verify every public Atlas mode and control: main/comparison playback, pause/restart, speed, timeline, state and district detail, notes, keyboard access, share links, loading, and error states
- [x] Complete desktop/mobile visual, accessibility, responsiveness, performance, test, build, and production verification; correct confirmed defects and publish a transparent launch-quality report

## Atlas Continuous Reliability Review (Aug 20)
- [x] Run a fresh independent verification of deployed source-frame health, public district interaction, playback, Admin operations, responsive display, tests, and production build
- [x] Define a safe recurring Atlas verification workflow with deterministic source checks, browser interaction checks, performance thresholds, durable evidence, and owner alerts
- [x] Define AI-agent responsibilities for evidence synthesis and issue triage while retaining human approval for geometry changes, historical interpretation, and public editorial notes
- [x] Publish a practical recurring reliability recommendation and the new verification decision

## Atlas National Renderer Rebuild — Screenshot-Confirmed Defect (Aug 20)
- [x] Reproduce and trace the incomplete party-map rendering shown in the owner screenshot, including white triangular gaps, broken surfaces, and any geometry simplification or projection loss
- [x] Replace the defective national geometry rendering pipeline with one that preserves all UCLA Polygon and MultiPolygon rings, holes, and inset geometry without artificial gaps
- [x] Preserve verified source metadata, party/member overlays, district interaction, playback, comparison, state detail, and responsive controls through the renderer rebuild
- [x] Require desktop/mobile viewport acceptance, all-frame source-topology validation, and surface-gap measurement across boundary, party, member, early, modern, and comparison frames; document the full-page capture-tool limitation

## Independent Deployed Atlas Verification After Canonical Renderer Release (Aug 20)
- [x] Verify every deployed canonical topology asset for retrieval, gzip decoding, UCLA metadata, 50-state coverage, unique district keys, shared arcs, and source-safe feature counts
- [x] Measure material internal gaps in deployed party, boundary, and member rendering across early, middle, and current Congresses, with representative state and national inspection
- [x] Exercise deployed playback, comparison, direct district detail, source links, keyboard access, loading/error behavior, and mobile layout independently of the prior local validation
- [x] Run final regression/build gates, document all evidence and limitations, correct any confirmed remaining defect, and publish a fresh verification decision

## Atlas Selected-State Color Correction (Aug 20)
- [x] Remove gold selected-state district fills so party, boundary, and member data colors are never overridden
- [x] Retain selection awareness through an outline-only accessible indicator and clear selected-state text
- [x] Verify party, boundary, and member overlays and publish the color correction

## Public Atlas Fracture Remediation (Aug 20)
- [x] Reproduce the screenshot-confirmed triangular fractures in the exact public party-map asset and identify its active asset URL, data format, and renderer path
- [x] Remove or invalidate any stale simplified frame path and enforce canonical shared-boundary geometry for all public party-map frames
- [x] Add a visible-map gap gate that fails on internal non-water fractures at desktop map scale and verify the deployed party map has none
- [x] Verify the actual public desktop map, playback, selected state, and party colors; run full quality gates and publish only after the fractures are gone

## Live Production Atlas Defect — Owner-Confirmed (Aug 20)
- [x] Reproduce the owner-confirmed live 119th party-map fractures using the production route and capture the served JavaScript bundle, map-asset URL, and rendered SVG evidence
- [x] Replace the active production fracture path with a renderer that cannot expose independently simplified neighboring district edges
- [x] Add a production-visible regression gate that distinguishes water surfaces from interior district fractures and blocks release on a fracture
- [x] Directly inspect the repaired production map at the affected desktop size and publish only after the owner-facing surface is complete

## Atlas Reliability and Florida Governor Candidate-Race Editor (Aug 20)
- [x] Remove heavy black selected-state district outlines and replace them with a restrained, non-distracting selected-state indicator
- [x] Rebuild Atlas playback around preloaded next frames, stable map transforms, explicit frame-ready transitions, and safe speed pacing without visible hitches
- [x] Stabilize fit-to-page, zoom limits, reset behavior, and selection transitions so the national map does not jump or unexpectedly resize
- [x] Add a protected Admin candidate-race editor that lets an administrator manually create, update, attach, detach, and review candidate records for a specified contest
- [x] Verify and update the Florida Governor contest so Byron Donalds and David Jolly appear as its manually managed general-election candidates with source-backed context
- [x] Verify desktop/mobile Atlas behavior, Admin authorization and persistence, public candidate presentation, tests, build, and a completed release checklist

## Atlas State-Border Hierarchy and Direct Candidate Management (Aug 20)
- [x] Add an accurate state-border overlay above district fills, with clear visual hierarchy that does not override party, member, or boundary data
- [x] Verify state-border alignment across current and historic Atlas frames, plus desktop and mobile readability
- [x] Make Admin candidate changes easier to find and operate from a direct candidate-management entry point, while retaining source requirements and audit history
- [x] Verify protected candidate persistence, public Governor display, regression tests, production build, and the completed checklist

## Full Atlas and Candidate Management Verification (Aug 20)
- [x] Re-verify all 31 canonical topology frames, 50 source-derived state exteriors, party/boundary/member overlays, source tags, and internal-gap safeguards
- [x] Re-verify real public playback, pause, speed, restart, zoom, pan, reset, district detail, comparison, share URL, loading/error, desktop, and mobile behavior
- [x] Re-verify direct Candidate → Governor candidate-log handoff, Admin-only authorization, source validation, Florida persistence, audit history, and public Governor display
- [x] Re-run full tests, TypeScript, production build, and direct production checks; document the decision and any remaining limitation

## Admin Candidate Management Discoverability Fix (Aug 20)
- [x] Add a first-class, plainly labeled Admin candidate-management workspace visible from the dashboard navigation and Election Ops
- [x] Add an explicit Florida Governor candidate-management shortcut that opens the source-backed editor with the current Donalds–Jolly record
- [x] Verify the route is discoverable through the Admin contract and its protected save path; source validation and audit history remain mandatory, and the public Governor record persists

## Full Senate, House, and Governor Candidate Race Management (Aug 20)
- [x] Add source-backed manual candidate-log fields and immutable audit history for Senate and House contests without affecting vote, rating, or winner fields
- [x] Add Admin-only Senate and House candidate-log procedures with required source labels, source URLs, and private edit reasons
- [x] Expand Candidate Changes with searchable Senate, House, and Governor tabs, direct contest editors, source cards, and audited change history
- [x] Verify public candidate display, protected authorization, source validation, persistence, regression tests, production build, and a complete release checklist

## Admin Race Creation, Black Representation Additions, and White Atlas State Boundaries (Aug 20)
- [x] Add protected Admin creation flows for new Senate, House, Governor, and Black Representation races with required identity, jurisdiction, status, and source evidence
- [x] Add protected Admin creation flow for Black Representation candidate profiles and link them to manually created contests for public map display
- [x] Verify no creation flow can alter certified results or publish an unsupported record; retain immutable audit evidence for manual additions
- [x] Apply and validate white source-derived state separators in Atlas party, boundary, and member modes without obscuring district geometry or party colors
- [x] Verify Admin creation, public Black Representation display, Atlas desktop/mobile contrast, tests, build, and release checklist

## Homepage Map Freshness, Alaska Primary Context, and Automation Audit (Aug 20)
- [x] Verify the homepage map’s declared general-election scope, current Alaska data, public timestamp, and map-to-Admin data contract
- [x] Compare the current Alaska record with official primary evidence and add only clearly labeled primary context that does not alter general-election ratings, calls, ticker eligibility, or certified results
- [x] Verify autonomous refresh scheduling, last-success evidence, failure behavior, and clear Admin freshness/primary-review visibility
- [x] Verify homepage and Admin display, tests, production build, and publish a source-backed freshness decision

## Candidate Creation and Portrait Workflow End-to-End Verification (Aug 20)
- [x] Verify new Senate, House, Governor, and Black Representation candidate/race creation from Admin through protected persistence, source audit, and public display contracts
- [x] Verify portrait submission, preview, review, approval, rejection, storage, replacement, and public image refresh contracts without adding fabricated records or images
- [x] Repair the managed-storage portrait submission defect and add regression coverage for the fixed path
- [x] Run full tests, TypeScript, build, public/administrative workflow checks, and publish a transparent verification decision

## Source-Backed Black Representation Profile Save Verification (Aug 21)
- [x] Verify the exact Create source-backed profile form validates all required fields and submits to the protected profile-creation procedure
- [x] Verify successful profile creation writes the Black Representation record and immutable addition-audit evidence, then appears in the public map query
- [x] Verify unauthorized, incomplete, or invalid-source submissions cannot save; repair any confirmed defect and publish the save decision

## Black Representation District / Jurisdiction Length Validation Fix (Aug 21)
- [x] Expand the protected profile and contest district/jurisdiction validation to support legitimate long labels consistently with database storage
- [x] Improve the Admin form guidance and field limits so a user can understand and enter a valid jurisdiction without raw validation failure
- [x] Verify valid long jurisdictions save through profile and contest creation while unsupported/oversized values remain blocked safely

## Change Candidates Panel End-to-End Save Verification (Aug 21)
- [x] Verify Senate, House, and Governor candidate-change forms validate source-backed inputs and call the intended protected save procedures
- [x] Verify successful saves update the public contest record, append immutable edit history, and refresh the Admin panel state
- [x] Verify unauthorized, invalid, and failed submissions cannot publish candidate changes; add visible save receipts and release the validated workflow

## General-Election Candidate Outcomes (Aug 19)
- [x] Verify Maxwell Frost’s Florida 10 unopposed general-election status with official and independent sources
- [x] Add Won General Election and Lost General Election values to the Black Representation candidate-status schema and protected Admin dropdown
- [x] Update Maxwell Frost’s separate Black Representation record with the official status, source, and unopposed context while preserving the reference article unchanged
- [x] Verify public and Admin candidate-status presentation, run release checks, publish, synchronize GitHub, and document the completed outcome workflow

## Connected Admin Feature Verification (Aug 16)
- [x] Verify Command Center, Election Ops, Agent Desk, Proposed Changes, Podcast Ops, Atlas & World, Black Representation, and Audience operate through protected data paths
- [x] Verify Admin desktop and mobile navigation, loading states, empty states, and error states after the portrait workflow upgrade
- [x] Record and remediate any confirmed functional defects before publishing the completed verification

## Homepage Warm Editorial Palette Review (Aug 15)
- [x] Add Antique Brass, Champagne Ivory, and Muted Plum to the in-site homepage color comparison
- [x] Capture and share the warm editorial palette directions for user selection before changing the live palette
