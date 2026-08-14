# Historical Atlas Repository Comparison and Verification

**Verification date:** August 14, 2026  
**Compared source:** `adchachere1252-hash/election-map-2026`, `main` at revision `4c0ea8f`  
**Scope:** Repository parity, apportionment accuracy, boundary-archive integrity, active redistricting context, interactions, and responsive presentation.

## Executive finding

The Historical Atlas has retained the original repository’s **complete 50-state apportionment series** and **exact 50-state Lewis boundary manifest**. The prior platform implementation, however, exposed boundary eras as filenames rather than usable geography. This update adds the missing practical layer: a selectable Congress timeline, a state search, direct state-and-Congress links, source transparency, and a real repository-backed historical boundary viewer.

> The Atlas now distinguishes **historical reference geography** from **current legal maps**. It does not present a repository boundary file as a legal certification.

## Repository-to-platform parity

| Asset or capability | Original repository | Platform result | Verification result |
|---|---|---|---|
| Apportionment series | 50 states; seven decennial points from the 89th through 119th Congresses | Same 50 states and seven values per state | Exact parity audit passed. |
| Boundary-era manifest | 50 state entries keyed to Lewis GeoJSON filenames and Congress ranges | Exact byte-for-byte imported manifest | Exact parity audit passed. |
| Seat totals | 435 House seats in each post-census period | 435 in every 1963–2023 platform series | Structural audit passed. |
| State selection | Repository state detail view | Searchable 50-state directory plus `state` URL parameter | Verified for Alaska and Tennessee. |
| Congress selection | Repository 89th–119th map context | 89th–119th timeline slider plus `congress` URL parameter | Verified at 118th and 119th Congress selections. |
| Boundary geography | D3-delivered Lewis district files | Controlled read-only proxy plus client-side state boundary rendering | Verified with Alabama 119th and Tennessee 118th files. |

The deterministic parity audit confirms that the platform’s `atlasHistory.ts` series matches the original repository’s `KNOWN_SEATS` series for every state, and that the imported `atlasBoundaryManifest.ts` is identical to the original `lewisManifest.ts`.

## Accuracy and coverage findings

The platform’s structural audit found **50 apportionment histories**, **50 boundary archives**, and **seven national 435-seat totals** with no malformed values. The 2020 Census apportionment documentation defines apportionment as the allocation of 435 House seats among the 50 states after the decennial census, and its historical table provides the relevant state seat counts through 2020. [1] [2]

The active redistricting watchlist has **16 states**. Every record has a stated reason, method, delegation-before field, and projected impact. Six records do not have a litigation note because litigation is not currently tracked for those entries; the interface explicitly describes those as no litigation note rather than silently treating them as a data failure.

## Presentation and interaction findings

Desktop verification used Alabama at the 119th Congress. The page displayed the 50-state history and archive totals, Alabama’s seven-seat current apportionment, active-state context, the 119th boundary timeline selection, and a legible seven-district map from the repository source. Mobile verification used both Alaska (history-only) and Tennessee (active watchlist). The single-column layout retained state search, timeline controls, map rendering, source links, and archive cards without horizontal clipping.

## Improvements implemented in this verification

| Improvement | Why it matters |
|---|---|
| Searchable state directory | Makes the full 50-state archive practical to navigate rather than a long scroll-only list. |
| Shareable `state` and `congress` URL state | Lets editors and readers link directly to a specific historical view. |
| 89th–119th Congress timeline | Restores the original repository’s historical time dimension in a clear, bounded form. |
| Repository-backed boundary viewer | Replaces filename-only references with usable state-level district geography. |
| Source links and legal-map notice | Separates Census apportionment evidence, repository archive files, and present-day legal-map claims. |
| Bounded boundary proxy | Allows only manifest-shaped historical filenames, uses a short timeout and cache, and is read-only. |

## Remaining gaps and editorial decisions

The original repository also contains a richer full-national map comparison mode, play controls, zoom/pan, and party/member timeline plumbing. Those elements are not automatically carried over because the repository labels party data as coming from Voteview and Clerk of the House feeds, while its map component contains its own static national composition values. A sourced party-control or member-history addition should be built only after the underlying historical source and its update policy are separately verified. [3] [4]

The new state viewer deliberately renders one selected state at a time. This makes the historical archive fast and understandable on desktop and mobile, while avoiding a high-cost 50-state boundary download for every page visit. A future national comparison mode should be separately designed and performance-tested.

## References

[1] [U.S. Census Bureau — Congressional Apportionment](https://www.census.gov/topics/public-sector/congressional-apportionment.html)  
[2] [U.S. Census Bureau — Historical Apportionment Data, 1910–2020](https://www.census.gov/data/tables/time-series/dec/apportionment-data-text.html)  
[3] [Original repository — Historical map comparison implementation](https://github.com/adchachere1252-hash/election-map-2026/blob/main/client/src/pages/MapComparison.tsx)  
[4] [Original repository — State historical detail implementation](https://github.com/adchachere1252-hash/election-map-2026/blob/main/client/src/components/StateDetailPanel.tsx)  
[5] [Jeffrey B. Lewis Congressional District Boundaries repository](https://github.com/JeffreyBLewis/congressional-district-boundaries)
