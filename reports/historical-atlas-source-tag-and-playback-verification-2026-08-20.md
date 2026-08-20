# Historical Atlas Source Tag and Playback Verification

**Prepared:** August 20, 2026 (EDT)  
**Scope:** UCLA source disclosure and the public Atlas playback control.

## Source disclosure

Each national and comparison map frame now presents a compact, keyboard-accessible **“Source · UCLA CD Maps”** tag in the map chrome. It links directly to UCLA Congressional District Maps and describes the tag as the source of Congress-specific district geometry. The tag deliberately does not collapse the Atlas data model: the map continues to label Census as the official apportionment standard and Voteview as the separately identified member/party overlay.[1] [2] [3]

## Public playback audit

| Scenario | Result | Evidence |
|---|---|---|
| Standard playback from 89th Congress | Passed | The public browser flow moved from frame 1 / 89th Congress to frame 2 / 90th Congress only after the `50/50 states` validated state was present. |
| Pause behavior | Passed | After Pause at frame 2 / 90th Congress, the visible frame remained unchanged for **5.1 seconds**, longer than the standard 4.5-second interval. |
| Fast mode | Passed | The selector accepted `fast`; playback moved from the 118th to the 119th Congress, showed `50/50 states`, and completed in **3,391 ms**, below the 4.2-second threshold that distinguishes it from the standard interval. |
| Completion behavior | Passed | Playback stopped automatically when the final, validated 119th Congress frame became visible. |
| Restart behavior | Passed | Pressing Play while already on the 119th Congress restarted at the 89th Congress and retained `50/50 states` validation. |
| Source tag in public DOM | Passed | The accessible UCLA geometry-source tag was present during the browser audit. |

## Regression protection

Playback timing and eligibility are now centralized in `atlasPlayback.ts`. A frame may advance only while playback is active, the requested frame is ready, and the displayed Congress equals the requested Congress. The shared guard is used by both the main map and comparison panels. Regression tests cover all 31 Congresses, every 50-state boundary manifest, exact sequence without skipped Congresses, pause/incomplete/transition wait states, slow/standard/fast durations, final-frame completion, and the source tag.

The full project suite passed **46 files and 149 tests**. TypeScript completed without errors. The production build was attempted three times; Vite reached late bundle rendering/compression but the sandbox terminated it for memory pressure before completion. A bounded 768 MB retry produced a confirmed heap-limit error. This is an execution-environment limitation, not an observed Atlas code or browser-flow failure; the focused browser playback audit and all test/type gates passed.

## References

[1]: https://cdmaps.polisci.ucla.edu/ "UCLA Congressional District Maps — U.S. Congressional District Shapefiles"

[2]: https://www.census.gov/data/tables/time-series/dec/apportionment-data-text.html "U.S. Census Bureau — Apportionment Data"

[3]: https://voteview.com/data "Voteview Data"
