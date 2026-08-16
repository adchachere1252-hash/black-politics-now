# Black Politics Now: Site, App, Admin, and Candidate-Image Verification

**Date:** August 16, 2026 (EDT)  
**Scope:** Public website, mobile presentation, production availability, build/test health, election-data freshness, candidate-image coverage, and the protected administration surface.  
**Author:** Manus AI

## Executive assessment

Black Politics Now has a strong, differentiated product foundation. The public application routes are available, the production build completes, the type check is clean, and all 56 current regression tests pass. The mobile presentation is coherent across the homepage, Election Center, Daily Intelligence Brief, World Elections, Historical Atlas, and Research Desk. Authentication properly prevents an unauthenticated visitor from viewing Admin content.

The platform is **not yet ready to claim complete candidate portrait coverage**. The audit found 1,098 named candidate or Black Representation profile slots, but only 414 have a populated and reachable image asset. That is **37.7% URL-level coverage**. The most urgent gaps are Governor portraits (4.2% coverage) and House portraits (37.3% coverage). In addition, the audit identified likely wrong image assignments that require human source review. These are material editorial-quality issues, rather than merely cosmetic gaps.

> **Verification boundary.** This audit verifies public route availability, build and test health, displayed responsiveness, data-field completeness, and image URL reachability. It does not certify every candidate’s identity, election status, image license, or the person depicted in each portrait. Those claims require source-by-source editorial review.

| Verification area | Result | Assessment |
|---|---:|---|
| Public production routes checked | 9 of 9 returned HTTP 200 | **Pass** |
| TypeScript check | Clean | **Pass** |
| Production build | Successful, with chunk-size warnings | **Pass with performance concern** |
| Regression suite | 56 of 56 tests passed | **Pass** |
| Mobile visual pages checked | 6 core pages rendered legibly | **Pass with two presentation issues** |
| Candidate image slots with reachable assets | 414 of 1,098 | **Launch blocker for portrait-completeness claim** |
| Unauthenticated Admin access | Explicit sign-in wall shown | **Pass** |
| Authenticated Admin workflow | Not exercised in this session | **Pending owner-session verification** |

## Confirmed strengths

The platform’s strongest aspect is its product depth. The Election Center, Daily Intelligence Brief, World Elections, Historical Atlas, and Research Desk form a coherent public intelligence suite rather than isolated feature pages. Each of the key public routes tested—homepage, Election Center, Podcast, Archive, Search, World Elections, Historical Atlas, Research Desk, and Admin—returned a successful production response.[1]

The mobile experience is materially improved. At a 390 × 844 viewport, the primary public screens maintained readable hierarchy and usable navigation. The homepage’s revised map presentation no longer showed the prior state-detail overlay obstruction in the captured visual pass. The World Elections globe, Atlas overview, Research Desk prompts, and Daily Brief entry point all rendered as focused mobile surfaces rather than compressed desktop panels.

The historical and operational safeguards are also substantial. Regression coverage includes Atlas frame integrity and source loading, playback behavior, source timeline handling, manual-winner evidence requirements, results ticker eligibility, portrait batch boundaries, world-election display states, and admin-only workflows. The current test run passed all 15 test files and all 56 assertions. The production build succeeded as well.

The Admin architecture correctly separates public and protected work. The unauthenticated `/admin` route displayed **Admin Access Required** and a sign-in action. The code has a distinct non-admin denial state, ten explicit workspace tabs, and server tests that reject unauthenticated use of the Command Center, agent execution, change-proposal review, portrait research, and World Elections refresh controls. This is a strong review-first model: the AI agent and portrait workflows produce reviewable artifacts, rather than silently publishing changes.

| Admin strength | Verification evidence |
|---|---|
| Route and role boundary | Unauthenticated live session rendered an Admin sign-in gate; frontend also contains a separate non-admin access-denied state. |
| Deliberate operational coverage | Ten tabs cover Overview, Command Center, Podcast Ops, Election Ops, Black Representation, Atlas & World, Agent Desk, Proposed Changes, Portrait Review, and Audience. |
| Review-first controls | Tests confirm protected agent, change-proposal, command-center, portrait, and World-refresh operations; public callers receive `FORBIDDEN`. |
| Current operating data | Election heartbeat, World-refresh items, agent recommendations, and agent tasks have activity on August 16. |
| Podcast safeguards | The public Daily Brief displayed a dated, 15-segment, 49:40 verified briefing; the Admin panel has source-preflight, script, dual-audio, and release-gate diagnostics. |

## Candidate-image audit

The candidate-image audit inspected every non-empty candidate or profile name in the four public categories. For every populated photo field, it performed a public URL check and validated that the response was recognizable as an image. No populated asset was unreachable or an invalid image response. The defect is therefore **coverage**, not currently broken image URLs.

| Category | Named slots | Reachable image assets | Missing image fields | URL-level coverage |
|---|---:|---:|---:|---:|
| Senate | 70 | 27 | 43 | 38.6% |
| House | 851 | 317 | 534 | 37.3% |
| Governor | 72 | 3 | 69 | 4.2% |
| Black Representation profiles | 105 | 67 | 38 | 63.8% |
| **Total** | **1,098** | **414** | **684** | **37.7%** |

Fourteen Senate, 77 House, and four Governor slots use unresolved or placeholder candidate labels such as `TBD`. Excluding those 95 labels, there are still **553 confirmed Senate, House, or Governor candidates without an image field**. Black Representation adds 38 profile-level image gaps, for **591 confirmed named-person gaps** across the audited datasets.

The production database also contains eleven image URLs shared by multiple display names. Some represent legitimate name variants, such as “Andre Carson” and “André Carson.” However, the following assignments are likely mismatches and must be checked against official portrait sources before any claim of portrait completeness or accuracy:

| Priority | Same current URL attached to | Required resolution |
|---|---|---|
| Critical | Angela Alsobrooks and Gabe Amo | Verify both database fields; retain only the correct Bioguide or official image for each person. |
| Critical | Ashley Hinson and Wesley Hunt | Verify both assignments against official congressional or campaign portraits. |
| Critical | Haley Stevens and Mike Rogers | Verify both assignments against official congressional or campaign portraits. |
| Critical | Brittany Pettersen and Justin Pearson | Verify both assignments; this is a high-risk visual identity mismatch. |
| Critical | David Scott and Robert C. Scott | Verify both assignments; do not rely on display-name similarity. |

The selected `election-map-2026` repository contains a larger source mapping: its candidate-photo file documents 426 named race candidates and 797 total mapping entries including aliases, plus a weekly reachability-check design.[2] [3] That source inventory has not yet been reconciled into the production candidate photo fields. It is an actionable starting point, but must be applied only through verified candidate-to-record matching and editorial review.

## Confirmed shortcomings and errors

### Priority 0 — portrait completeness and probable misassignments

The public product cannot accurately say that every candidate has a photo. Missing fields affect 684 of 1,098 audited slots, and at least five multi-person photo collisions look likely to be wrong. The image checker confirms that inserted assets load; it does **not** confirm that every displayed person is correct. The immediate remediation should be a staged, evidence-backed queue: correct the identified collision pairs first; backfill Black Representation; then Governor; then Senate; then House. Each action should use an official campaign, official government, Bioguide, or licensed source and retain provenance for review.

### Priority 1 — election-map freshness and redundant mobile legend

The mobile Election Center visibly showed **“Last updated Aug 11, 2026, 4:01 PM.”** The underlying tables show the latest Senate and Governor updates on August 11 and the latest House update on August 12. A transparent timestamp is better than a misleading one, but a five-day-old map timestamp weakens the platform’s real-time intelligence promise. The page should distinguish “last editorial record change” from “election engine heartbeat” and surface the current operational heartbeat where appropriate.

The mobile Election Center also showed the AP-style race-rating legend twice beneath the map. This is a clear presentational defect: it consumes high-value screen space and can make the mobile map appear less polished. It should be reduced to a single accessible legend, ideally collapsible or positioned after the summary cards.

### Priority 1 — Admin operational observability is partially unproven

The Admin design is robust in code and test coverage, but the authenticated owner workflow could not be exercised because the browser connection required to access the owner’s signed-in session was not authorized. The full Admin screen should be checked as the owner before release: tab switching, `Refresh sources now`, `Run Election Day research`, rehearsal actions, manual winner confirmation validation, agent review/approval paths, portrait queue actions, and user feedback for failed mutations.

The underlying operational data also exposes real readiness gaps. `pipeline_runs`, portrait submission, and portrait-batch tables each had zero records at audit time. This means the dashboard’s empty states are meaningful but the full create → review → approve flows were not demonstrably populated in the live data. There was one Election Day rehearsal record, last updated August 14. Run and record a fresh rehearsal before the next election event.

### Priority 2 — public performance budget

The production build succeeded, but emitted a bundle-size warning. The main JavaScript chunk is approximately 1.43 MB before compression, or 380.56 KB gzip; several additional feature chunks are also substantial. This is not a functional failure, but it is a performance risk on slower mobile connections. The first optimization pass should inspect the main bundle’s largest dependencies and defer non-critical visual/editorial tools until their routes are visited.

### Priority 2 — World Elections review cadence

The World Elections mobile surface visibly stated **“Calendar data last reviewed Aug 14, 2026.”** The operational data had World-refresh activity on August 16, but the public language appears to be sourced from a dated review marker. Resolve the discrepancy so the public page indicates the most recent human-approved calendar review, while retaining the existing review-only safety boundary.

## Data and security findings

No production route checked returned an HTTP failure. Current development logs did not show a new 4xx/5xx network failure during the visual pass. The log archive does contain an older August 15 governor-race query failure, but the current query audit returned all 36 Governor records. Treat that historical error as a monitoring item rather than a current confirmed outage.

There are zero called or certified Senate records, four called or certified House records, and zero called or certified Governor records in the current tables. This is not intrinsically an error on August 16, 2026, but it reinforces the need for the public map to communicate exact data freshness and election-stage context. Manual winner confirmations already require an HTTPS evidence URL and are covered by regression tests, which is a sound safeguard.

| Area | Strength | Risk or limitation |
|---|---|---|
| Public availability | Nine principal routes returned HTTP 200. | HTTP status does not substitute for a human signed-in workflow test. |
| Auth and access control | Admin gate and protected-procedure regression tests are present. | Owner-session tab/action testing remains pending. |
| Election data | Full Senate, House, and Governor row inventories are present. | Visible map freshness is several days behind the audit date. |
| Podcast | Current dated briefing is present; release gate architecture is strong. | `pipeline_runs` table contains no audit history rows. |
| World Elections | Visual presentation and review-only operation exist. | Public “last reviewed” label needs reconciliation with refresh activity. |
| Historical Atlas | Dedicated integrity, boundary, playback, and source tests pass. | No fault was observed in the current desktop/mobile overview pass; continued source monitoring remains necessary. |

## Recommended remediation sequence

The first release gate should be candidate portrait quality. Correct the five likely wrong image assignments, then use the repository mapping as a source candidate list—not an automatic import—to create evidence-backed portrait review records. Start with the 38 Black Representation profiles, then the 69 Governor image gaps, the 43 Senate gaps, and finally the House queue. Every completed portrait should be checked for identity, provenance, crop, and public URL reachability.

Next, repair the mobile Election Center legend duplication and revise the map freshness model. The user-facing map should show both a clearly named data-record update time and, where useful, the independent DDHQ heartbeat state. This will eliminate ambiguity between “the election engine is alive” and “a particular race record changed.”

Finally, complete a signed-in Admin acceptance pass as the platform owner and record a new Election Day rehearsal. The critical test cases are source refresh, agent research proposal creation, review queue navigation, portrait batch start/progress, manual winner evidence validation, rehearsal step completion, and all associated failure messages. After that pass, address main-bundle code splitting to preserve the mobile experience on slower networks.

## Audit artifacts and references

The attached raw `candidate-image-audit.json` contains one record per named image slot, with the database category, jurisdiction, candidate name, source field, status, resolved URL, HTTP status, content type, and image signature. It is intended for operational follow-up, not for public publication.

[1]: https://blkpolnow-nztxnshf.manus.space "Black Politics Now public platform"
[2]: https://github.com/adchachere1252-hash/election-map-2026 "Black Politics Now Election Map 2026 repository"
[3]: https://github.com/unitedstates/images "United States congressional image collection referenced by the repository"
