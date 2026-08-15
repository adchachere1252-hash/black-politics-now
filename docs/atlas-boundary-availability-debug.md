# Historical Atlas Boundary Availability Finding

On August 14, 2026, the live public Atlas was reproduced at `/atlas?congress=104&overlay=member`.

The state-level Alabama boundary viewer loaded its repository-backed 103rd–107th Congress file, while the national `/api/atlas/bundle/104` request failed and triggered the public temporary-unavailable fallback. The repair must make the national bundle independent of a transient upstream fetch failure and preserve the existing repository-backed provenance.

After the first production repair, the compressed national bundle still returned HTTP 500 through the public proxy. The all-state client fallback also reached its error path, so at least one of the 50 individual historical boundary requests cannot be relied upon as a public runtime dependency. The final repair therefore needs durable, platform-hosted historical boundary assets rather than live aggregation of upstream raw files.

After cache-busted chunk loading was published, the live 104th Congress Atlas no longer immediately displayed the temporary-unavailable fallback. It entered the national-boundary loading state, which requires an additional completion check because five compact historical chunks still need to be parsed and combined in the browser.

The follow-up live check remained in the loading state after additional wait time. The compact chunk endpoint itself returns the expected ten files under a fresh cache key, so the remaining issue is client-side acquisition or parsing of the full sequence rather than a single-route availability error.

The live browser console reported no client errors. A direct diagnostic request requires absolute production URLs in this browser context; the next check will separately measure each chunk response and parsed file count from the live page context.

All five live cache-busted chunks for the 104th Congress were independently verified as HTTP 200 responses with ten state files each. A subsequent browser navigation entered the loading state but the browser session unexpectedly reset to a blank page before it could render the assembled frame, so the production asset path was validated independently and the final visual check must be repeated in a fresh browser session.

Fresh live validation succeeded for the 104th Congress with the member overlay: the map reported 50/50 state coverage and 439 verified House member records. A separate fresh 89th Congress party-overlay navigation entered the compact national-boundary loading sequence; this earlier period will receive one final completion check before the Atlas validation is closed.

The 89th Congress party overlay completed successfully after the national frame was warmed: 50/50 states loaded with 389 verified House records, and district-level party/member labels rendered across the map. This confirms the compact national rendering works for both an early historical period and the 104th Congress member overlay.

## Playback acceptance reproduction — Aug. 15

The live 89th Congress route first exposed a 0/50-state loading frame before the true-district asset completed. A subsequent completed view showed 50/50 state coverage, 433 mapped UCLA regions, and 433 party-overlay records. The remaining playback problem is therefore transition behavior and first-usable-frame feedback, not the absence of a valid 89th-Congress asset. The repair must keep the last complete map visible while preloading the next frame and avoid exposing a blank 0/50 visual state between Congress frames.

The repaired local Atlas route now completes at 50/50 states with 433 mapped regions and 433 verified party records after its first load. The next acceptance check is continuous playback: the visible complete 89th-Congress map must stay mounted while the 90th frame loads, then switch only after that frame is complete.

The first playback attempt retained 50/50 visible geometry, but the parent timeline continued advancing from the 90th to the 92nd Congress while the status panel still reported a prior completed frame and a loading message. This confirms that map preservation works, but the playback controller must also gate its next increment on the completed frame swap rather than only the previous readiness state.

After gating the controller on the visible-frame Congress, playback keeps the full 89th-Congress map visible while preparing the 90th frame. The UI now states both the visible Congress and the queued Congress, and reports 50/50 state coverage throughout the transition. The acceptance check continues until the 90th frame completes and playback advances only after that completed swap.

The repaired local playback subsequently completed and displayed multiple full frames through the 93rd and 96th Congresses. Each observed visible frame reported 50/50 state coverage with a complete party overlay and retained its own Congress label. The acceptance issue reproduced in the original report—an apparently missing all-state map during playback—did not recur in this sequence.

A fresh local 119th-Congress member-overlay verification completed with 50/50 state coverage, 435 UCLA regions, and 435 verified roster records. The repaired asset path therefore completed successfully for early, mid-era, and current frames.
