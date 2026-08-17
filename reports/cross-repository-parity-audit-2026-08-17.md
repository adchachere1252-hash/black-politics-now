# Cross-Repository Parity Audit

**Platform:** Black Politics Now  
**Audit date:** August 17, 2026  
**Repositories reviewed:** `election-map-2026` and `daily-podcast`

## Executive Finding

Black Politics Now now contains the **core public data, maps, listener functions, and operational safeguards** from both selected repositories. It is not a pixel-for-pixel or route-for-route copy, because the platform intentionally consolidates features into its Election Center, World Elections, Podcast, Archive, and Admin workspaces. The recent World Elections work closes the former label-coverage gap by restoring the source repository’s full 180-country coordinate catalog.

Two material feature differences remain. The original World Elections experience has separate **results** and **referendums** view modes, while the integrated World page currently presents a globe, country index, calendar list, filters, and country detail drawers but not those two dedicated modes. The original podcast Admin includes subscriber-growth, SEO, show-notes, and embed tooling; Black Politics Now intentionally defers newsletter/subscriber features and has not ported the SEO/embed surface.

## Live Coverage Snapshot

| Dataset | Live Black Politics Now records | Audit interpretation |
|---|---:|---|
| Senate races | 35 | Covers the Election Center’s current Senate universe. |
| House races | 435 | Full House race coverage is present. |
| Governor races | 36 | Full 2026 governor cycle coverage is present. |
| Referendums | 148 | The original election repository’s ballot-measure category is represented in the integrated data model. |
| World Elections | 48 | World tracker records are live, with all 38 distinct tracked country codes covered by the globe label catalog. |
| Daily Brief episodes | 103 | A substantial integrated archive is present. |
| Daily Brief segments | 1,465 | Segment-level listener and script records are present. |

## Election Center Repository: Parity Matrix

| Original repository capability | Integrated Black Politics Now status | Assessment |
|---|---|---|
| Interactive U.S. map, state detail, candidate search, and rating system | Election Center provides Senate, House, Governor, Black Representation, and redistricting map contexts, state detail, search, AP-style ratings, and responsive mobile sheets. | **Met and extended** |
| Senate, House, Governor, and referendum data models | All four data areas are present; Black Representation and Historical Atlas add platform-specific contexts. | **Met and extended** |
| Live election refresh and called-race handling | The public Election Center refreshes on a bounded cadence; the automated DDHQ election engine performs minute-by-minute polling only on active election dates and updates calls safely. | **Met with a deliberate cadence difference** |
| Live ticker across all original categories | The integrated homepage ticker intentionally limits itself to **final Senate and House outcomes** and excludes primary, governor, and referendum items. | **Intentional product divergence** |
| World globe country labels | Full original 180-country centroid catalog, short naming, contextual decluttering, front-hemisphere visibility, tracked callouts, density controls, focus search, and country index are now integrated. | **Met** |
| World Results and Referendums modes | No dedicated World Results or World Referendums modes are present on the integrated World page. | **Confirmed parity gap** |

## Daily Intelligence Brief Repository: Parity Matrix

| Original repository capability | Integrated Black Politics Now status | Assessment |
|---|---|---|
| Source-grounded topic research, scripts, and dual segment voices | Integrated production retains sourced scripts, visible source context, Andrew/Jenny switching, and additional preflight gates. | **Met and hardened** |
| Full-episode audio | The source repository documents one assembled full episode. Black Politics Now now validates and publishes both Andrew and Jenny full episodes for current daily releases. | **Exceeded for current releases** |
| Public player, archive, topic filtering, transcript/script access, and RSS | Integrated Podcast and Archive provide these functions, and `/api/rss` is registered. | **Met** |
| Pipeline controls and quality monitoring | Podcast Ops adds source preflight, morning gate state, 6:30 AM missed-gate alerting, guarded current-date recovery, dual-voice checks, and durable snapshots. | **Met and materially extended** |
| Analytics and audience reporting | Integrated Admin has a privacy-limited Audience & Visits workspace for visits, anonymous sessions, top pages, device mix, and referrers. | **Met with a different model** |
| SEO, show-notes, embed, and newsletter/subscriber tools | These source-repository growth functions are not currently present. Subscriber signup was explicitly deferred for Black Politics Now. | **Intentional deferred gap** |
| Historical Jenny full mixes | The latest two verified episodes have both full mixes. One older August 15 record has no Jenny full-episode URL. | **Archive-completeness gap; not a current release-gate failure** |

## Recommended Implementation Order

1. **World Results and Referendums views.** This is the clearest remaining election-map repository parity item. It can reuse existing source-backed `world_elections` data and preserve the review-only world-refresh safeguard.
2. **Historical Jenny full-mix backfill.** Queue a guarded backfill only for archive dates that have verified scripts and paired segment assets. This improves archive consistency without weakening the current release gate.
3. **Podcast growth tools, only if the product direction changes.** Port show-notes/SEO/embed cards first; defer newsletter capture until subscriber policy, consent language, and notification scope are approved.

## Scope Boundary

> Repository parity should mean that source-backed capabilities and data are represented safely in Black Politics Now—not that legacy routes, refresh intervals, or every deprecated UI surface are copied unchanged.

The audit did not recommend importing legacy placeholder data, autonomous public edits, or subscriber collection without a confirmed policy. Public election and podcast records remain subject to the existing source and human-review safeguards.

## Repository References

1. `election-map-2026/README.md` — documented Election Center capabilities and data categories.
2. `election-map-2026/client/src/pages/WorldElections.tsx` — original World view modes, alert banner, search focus, and labels control.
3. `daily-podcast/README.md` — documented source pipeline, player, RSS, and archive features.
4. `daily-podcast/client/src/pages/Admin.tsx` — original Admin tabs for pipeline, episodes, analytics, SEO, audience, and quality.
5. `black-politics-now/client/src/pages/Elections.tsx`, `client/src/pages/World.tsx`, `client/src/pages/Podcast.tsx`, `client/src/pages/Admin.tsx`, and `server/rss.ts` — integrated platform feature surface.
