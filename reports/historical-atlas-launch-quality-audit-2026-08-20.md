# Historical Atlas Launch-Quality Audit

**Audit date:** August 20, 2026 (EDT)  
**Scope:** Public Historical Atlas and its protected Admin Atlas Operations controls.  
**Decision:** **Approved for release after the corrections recorded below.**

## Executive finding

The Atlas now passes the applicable source, frame, playback, interaction, visual, accessibility, test, and build gates for its defined Voting Rights Act-era scope: the 89th through 119th Congresses. The audit did not recast any district geometry, party history, member record, or apportionment record. It corrected two renderer and usability defects in the surrounding application code.

| Area | Independent result | Decision |
|---|---|---|
| UCLA source geometry | All 31 live FeatureCollections returned HTTP 200 and passed metadata, identifier, polygon, and 50-state checks. | Pass |
| District fidelity | The renderer was corrected to remove only large d3 composite-projection clip surfaces, while retaining valid UCLA rings—including rectangular districts. | Pass after correction |
| Voteview overlay | All 31 overlay endpoints returned HTTP 200 with valid source metadata and member records. | Pass, with one disclosed source-export gap |
| Playback | Standard advance, Pause hold, fast completion, final-frame stop, and restart were exercised in a browser. | Pass |
| District detail | A real SVG pointer sequence opened the selected-district landmark, focused it, and exposed UCLA feature and Voteview source context. | Pass after usability correction |
| Admin playback check | Protected procedure executed, persisted a passed audit, returned the same latest audit after refetch, and now displays a persistent completion card. | Pass after feedback correction |
| Release gates | TypeScript passed; 49 test files / 155 tests passed; production build passed. | Pass |

## Verified source contract

UCLA documents district definitions for every U.S. congressional district used from 1789 through 2025 and explains that its older boundaries combine historical county, legal, and cartographic material, while later files increasingly rely on Census boundary sources.[1] The public Atlas uses a deliberately narrower 89th–119th Congress frame set. The all-frame audit confirmed the following for every delivered Congress.

| Geometry contract | Result |
|---|---|
| FeatureCollection type and matching Congress metadata | 31 of 31 passed |
| Named states in each frame | 50 of 50 passed |
| Unique UCLA feature IDs and state/district identifiers | 31 of 31 passed |
| Usable Polygon or MultiPolygon geometry | Every delivered feature passed |
| Feature count matching frame metadata | 31 of 31 passed |
| UCLA source URL retained in metadata | 31 of 31 passed |
| Voteview overlay endpoint and valid records | 31 of 31 passed |

The source audit observed one **non-geometry** roster exception: Voteview’s 90th Congress export does not contain a record keyed to `NY-18`. The Atlas leaves that district visible as UCLA geometry and correctly renders “No verified House member match” rather than manufacturing a person or party. At-large records use the established Voteview fallback keys where present. This is a transparent source-boundary limitation, not a map-boundary failure.[2]

## Confirmed defects and repairs

The audit found renderer clip surfaces in 80 projected path outputs across Congresses 99 through 114. D3’s composite Albers projection can append large full-map or inset rectangles to a valid district path. Those rectangles are projection artifacts—not UCLA boundary rings. Earlier cleanup removed large clip surfaces; an interim broad change exposed the effect visually, which verified the diagnosis. The final implementation removes only rectangles at or above the full-surface threshold and retains ordinary rectangular district rings. A regression test now protects both cases.

The audit also confirmed that selecting a district updated the detail state but left its panel far below the map, making the action appear inactive to a reader. The selected source-linked detail section now has a stable landmark, receives focus, and scrolls into view after selection. A real browser pointer sequence verified the presence of the focused panel with its UCLA feature ID and Voteview source context.

The protected Admin playback procedure already produced a valid deterministic result, but the interface did not make the result sufficiently obvious. The workspace now retains a completion card with pass/fail status, audit number, summary, timestamp, and durable-history refresh. Query ordering now breaks timestamps ties by audit ID, ensuring that the result just returned is the result shown.

## Playback and public controls

| Control | Evidence |
|---|---|
| Source tag | Visible and linked to UCLA Congressional District Maps |
| Standard playback | Advanced from frame 1 / 89th Congress only after validated readiness |
| Pause | Held frame 2 / 90th Congress unchanged beyond a standard interval |
| Fast playback | Reached 119th Congress in 3.408 seconds using the selected fast setting |
| Completion | Automatically stopped at the final frame |
| Restart | Play from the final frame restarted at the 89th Congress |
| District selection | Real pointer delivery reached the selected-district panel, which received focus |
| Comparison | Side-by-side comparison paths and source-tagged maps rendered in verification |
| Responsive review | Desktop boundary, party, member, and comparison views plus mobile stacked views reviewed |

## Remaining non-blocking considerations

The Atlas is intentionally a **national historical explorer**, not a legal boundary adjudication tool. Readers must use linked UCLA/Census/underlying source material for legal or precinct-level work. The current 31-frame scope begins in the VRA era; it does not claim full 1789–2025 coverage even though UCLA’s archive is broader. The production build completed successfully but reported non-blocking bundle-size warnings; future performance work can further split non-Atlas shared application chunks.

The protected Admin interface requires a signed-in owner for its final visual acceptance. Its authorization, mutation, durable persistence, and refetch behavior were validated through the protected router and an end-to-end Admin caller. The owner’s recommended acceptance click is now straightforward: open **Admin → Atlas & World → Atlas Operations**, choose **Run playback check**, and confirm the persistent green audit card and newest history entry.

## References

[1]: https://cdmaps.polisci.ucla.edu/ "U.S. Congressional District Shapefiles — UCLA Congressional District Maps"

[2]: https://voteview.com/data "Voteview Data"
