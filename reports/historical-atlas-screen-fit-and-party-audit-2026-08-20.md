# Historical Atlas Flagship Audit and UCLA Reference Alignment

**Prepared by:** Manus AI  
**Date:** August 20, 2026 (EDT)  
**Scope:** Black Politics Now Historical Atlas, 89th–119th Congresses (1965–2026)

## Executive finding

The Historical Atlas now operates as a **50-state, Congress-by-Congress district explorer** for the Voting Rights Act era forward. It renders the platform’s validated UCLA-derived district geometry in every supported frame, checks that each frame contains all 50 states before it can be displayed as ready, and separates geometry, apportionment, and roster evidence rather than treating them as interchangeable.[1] [2] [3]

The public experience has been strengthened around the actual district record. Readers can move across all 31 Congresses, jump by decade, play validated national frames at an explicit speed, compare two Congresses, inspect an enlarged hover card, and select a district for a source-linked record. The party palette remains aligned to the homepage: **Democratic blue, Republican red, and other/independent purple**. A selected state now receives a stronger outline in Party mode instead of losing the underlying party colors.

## Source model and accuracy boundary

| Data layer | Public use in the Atlas | Accuracy rule |
|---|---|---|
| UCLA Congressional District Maps geometry | Congress-specific district boundaries, district identifiers, state coverage, and boundary-era source links | Geometry is presented as UCLA-derived historical geography; the application preserves its source identifiers and does not edit the shapes in the map interaction.[1] |
| U.S. Census apportionment | Official state House-seat totals for the appropriate decennial cycle | Raw map-region counts do not override the Census seat record; at-large geography can require a different interpretation from a simple polygon count.[2] |
| Voteview House data | Member name, party, party code, district, and Bioguide context when a verified roster match is available | Roster context remains labeled as an overlay. Missing or discrepant matches are disclosed rather than guessed.[3] |
| Black Politics Now editorial context | VRA legal milestones and approved state-era narratives | The Atlas distinguishes sourced legal context from claims about why a particular district or party result changed. |

UCLA documents its collection as digital boundary definitions for every U.S. congressional district in use from 1789 through 2025 and describes its 2.0.0 update through the 119th Congress. The reference treats at-large districts as `0`, identifies historical Indian territories as `-1`, and cautions that a small number of discrepancies may remain. It also explains that the GeoJSON materials carry additional member information and that the project used Census geography for later Congresses and historical county, legal, and cartographic material for earlier work.[1] Black Politics Now intentionally limits this Atlas to the 89th–119th Congresses, where its public mission is to make the Voting Rights Act era more accessible without claiming that the map itself resolves every historical dispute.

## Improvements completed

| Area | Completed enhancement | Reader benefit |
|---|---|---|
| District interaction | Larger hover card with state, district, member, party, and clear selection instruction | Makes each map region understandable before the reader commits to a detail view. |
| District explorer | Source-linked detail panel with district label, Congress years, state apportionment count, UCLA feature identifier, boundary era, verified member/party context, Bioguide identifier when supplied, and direct UCLA/Voteview links | Keeps district geometry, member record, and source provenance visible together. |
| Party map clarity | Party-mode state selection uses a thicker outline while retaining blue/red/purple fills | Preserves the historical party transition evidence during exploration. |
| Visual hierarchy | Clearer 50-state status badge, larger legend markers, refined loading language, and a more prominent Congress period card | Improves scanability without enlarging the map beyond its screen-aware bounds. |
| Navigation | Decade-jump control alongside previous/next, slider, playback, keyboard navigation, legal timeline markers, and comparison controls | Makes a 31-frame historical range faster to use for both casual and research readers. |
| State context | Period-accurate district index uses the selected Congress’s Census apportionment total instead of the modern total | Avoids presenting a current seat count as historical context. |
| Mobile behavior | District selection opens the existing mobile detail sheet with roster and UCLA feature context | Maintains the stacked mobile layout while making district data usable on a small screen. |

## Verification results

| Check | Result | Evidence |
|---|---|---|
| 50-state frame contract | Passed | The loader validates the requested Congress, non-empty geometry, and exactly 50 distinct states before caching a frame. |
| UCLA source integrity | Passed | Atlas source tests and frame-loader tests passed for the registered 31 Congress frames. |
| Party palette contract | Passed | Regression coverage confirms Democratic blue, Republican red, other/independent purple, and member/boundary alternatives use the shared homepage design tokens. |
| District detail contract | Passed | Three new tests confirm at-large labeling, unrecoded other-party labels, and source feature identifier preservation. |
| Atlas regression suite | Passed | **10 files / 22 tests** passed: boundary loader and route, share link, district detail, frame integrity, playback, sources, true-district loader, VRA timeline, and palette. |
| Full project regression suite | Passed | **44 files / 143 tests** passed. |
| TypeScript | Passed | `pnpm exec tsc --noEmit` completed with no errors. |
| Production build | Passed | `pnpm build` completed successfully. The bundler reported its existing large-chunk advisory; it was not a failed build. |
| Desktop visual review | Passed | 1440px-wide full-page review confirmed a screen-fitting map, visible national controls, readable legend, and no observed horizontal overflow. |
| Mobile visual review | Passed | 390px-wide full-page review confirmed the established stacked layout and map/control visibility without observed horizontal overflow. |

## What is deliberately not claimed

The Atlas does **not** certify that a UCLA historical boundary file is the current legal map, does not convert an unavailable roster match into a guessed member, does not infer why party control changed, and does not use a district polygon count to replace the Census apportionment record. These boundaries protect readers from common historical-map errors while preserving useful, inspectable detail.

## Recommended operating standard

Before any future Atlas expansion beyond the 119th Congress or back before the 89th Congress, the platform should retain the same source separation: UCLA or another explicitly named boundary source for geometry; Census for apportionment; a documented roster source for member/party data; and an editor-approved evidence package for explanatory history. Any frame that fails the 50-state integrity condition should remain unavailable rather than silently falling back to a partial map.

## References

[1]: https://cdmaps.polisci.ucla.edu/ "UCLA Congressional District Maps — U.S. Congressional District Shapefiles"

[2]: https://www.census.gov/data/tables/time-series/dec/apportionment-data-text.html "U.S. Census Bureau — Apportionment Data"

[3]: https://voteview.com/data "Voteview Data"
