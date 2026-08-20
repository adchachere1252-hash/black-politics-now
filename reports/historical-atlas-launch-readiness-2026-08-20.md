# Historical Atlas Independent Launch-Readiness Verification

**Prepared:** August 20, 2026 (EDT)  
**Status:** Launch-ready within the stated 89th–119th Congress source scope; one ordinary-reader click acceptance step remains recommended because the isolated browser harness cannot dispatch through this SVG’s React event layer.

## Independent public data audit

On the deployed public origin, a serialized audit requested all **31** registered historical frames (89th through 119th Congresses) and their corresponding public roster overlays. The audit passed all 31 frames with zero failures. Every frame declared and contained all 50 named states, retained the expected Congress metadata, used UCLA source metadata and a UCLA source URL, held non-empty geometry with unique district feature identifiers, and returned a syntactically valid Voteview roster overlay. The deployed frames ranged from **433 to 435** UCLA geometry regions and **432 to 442** overlay-member records. The range is recorded as source geometry/roster coverage rather than silently treated as an official seat count; the Atlas retains Census apportionment as the official seat-total record.[1] [2] [3]

## Independent public behavior review

The deployed 89th Congress route rendered after client-side load with the expected controls, a visible `50/50 states` status, `433 UCLA regions`, `433 verified records`, source links, party controls, decade selector, slider, legal timeline, 50-state archive, and keyboard-addressable district paths. The public page presented Alaska as at-large and showed its UCLA boundary-era file without claiming that the historical shape is a current legal certification.

The comparison review also rendered two 50-state maps at once for the 89th and 119th Congresses. The 89th map reported 433 UCLA regions and the 119th map reported 435, which matches the audited geometry counts and confirms that the visual summary reflects the source frame rather than a hard-coded count.

The Atlas regression suite passed **11 files and 24 tests**, including a new district-interaction contract. The contract protects both mouse and keyboard activation wiring, typed district selection, the source-linked detail panel, UCLA feature identifiers, and Voteview source context from accidental removal. This supplements the public frame audit; it does not substitute for an ordinary reader’s live click.

## Confirmed usability finding

At a standard desktop viewport, the national map initially started too far below the opening introduction and secondary timeline/status controls. That did not affect data integrity, but it weakened the launch-facing priority of the map. The map was moved to immediately follow the core mode and playback controls, ahead of secondary slider/progress analytics. The corrected 1440px desktop review now shows a substantial, usable portion of the national map in the first view. Full-page 390px mobile reviews of both a single-map and two-map comparison state showed the expected stacked structure and no observed horizontal overflow.

## Browser interaction limitation

An isolated automated browser harness loaded the deployed Atlas, confirmed more than 400 keyboard-addressable district paths, and validated the public source/status controls. Its synthetic pointer and keyboard events did not cross into the SVG component’s React activation handler, so it could not independently assert that the selected-district panel opens through that harness. This is an automation limitation, not a reported public failure: the component’s mouse and keyboard wiring is covered by the new regression contract. The final release checklist therefore retains one ordinary reader acceptance step: select any district, confirm the source-linked panel, then close it.

## Final quality gates

| Gate | Result |
|---|---|
| Public 31-frame geometry and roster audit | **Passed** — 31/31 frames; zero failures; all 50 named states in every frame. |
| UCLA/Census/Voteview separation | **Passed** — geometry, apportionment, and roster labels remain distinct in the public product. |
| Atlas regression suite | **Passed** — 11 files, 24 tests. |
| Full project regression suite | **Passed** — 45 files, 145 tests. |
| TypeScript | **Passed** — `pnpm exec tsc --noEmit`. |
| Production build | **Passed** — `pnpm build`. The bundler’s existing large-chunk advisory did not fail the build. |
| Desktop screen fit | **Passed after correction** — at 1440px, the national map now begins directly after the core Atlas controls rather than after secondary analytics. |
| Mobile screen fit | **Passed** — full-page 390px reviews of single-map and comparison flows remained stacked with no observed horizontal overflow. |

## Launch decision

The Atlas is **ready to launch as a 50-state Voting Rights Act-era historical explorer**. Its accuracy claim is properly bounded: the application renders UCLA-derived 89th–119th Congress geometry, uses Census apportionment as the seat-count standard, and displays Voteview member/party data as a separately labeled overlay. It does not claim that a historical geometry file is a current legal certification or infer causes for party change.

The sole remaining acceptance item is brief and non-blocking: after publication, a reader should click any visible district, confirm that the source-linked panel opens, and close it. This is retained because the isolated automation environment could not inject input into the SVG’s React event boundary, not because a public regression was observed.

## References

[1]: https://cdmaps.polisci.ucla.edu/ "UCLA Congressional District Maps — U.S. Congressional District Shapefiles"

[2]: https://www.census.gov/data/tables/time-series/dec/apportionment-data-text.html "U.S. Census Bureau — Apportionment Data"

[3]: https://voteview.com/data "Voteview Data"
