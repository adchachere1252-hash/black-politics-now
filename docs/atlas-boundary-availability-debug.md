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
