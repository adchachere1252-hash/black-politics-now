# Historical Atlas Repository-Parity Notes

**Source repository reviewed:** `/home/ubuntu/election-map-2026-atlas-audit`

## Source Repository Surfaces

The source Atlas implementation centers on `client/src/pages/MapComparison.tsx`. Its observable feature set includes:

- A complete Congress range from the 89th through 119th Congress (1965–2025).
- Independently selectable A/B comparison maps with per-map playback controls and Congress selectors.
- State-detail controls, including a mobile full-screen state-detail presentation.
- Keyboard navigation for Congress changes and state detail.
- District-level map popups carrying Congress-year context.
- Boundary source attribution to UCLA Congressional District Maps, plus party-data attribution to Voteview/UCLA.
- A timeline, Congress selectors, and source-focused attribution in the map footer.

## Integrated Platform Evidence

The integrated implementation is `/home/ubuntu/black-politics-now/client/src/pages/Atlas.tsx`. It already contains visible code paths for:

- All 31 VRA-era Congress frames and 50-state context.
- Two-Congress comparison panels, selectors, and URL state.
- Boundary-era archive selection by state.
- A guided Voting Rights Act legal timeline with source links and the Louisiana v. Callais milestone.
- Historical map overlays, state selection, source badges, and responsive controls.

## Acceptance Result

The comparison found a narrow interaction gap rather than a data or map-coverage gap. The source repository allowed each side of a two-Congress comparison to play independently and supported keyboard movement through Congress frames. The integrated Atlas already had broader source, legal-timeline, overlay, share-link, and archive context, but did not expose those two interaction refinements.

The integrated Atlas now provides independent validated-frame playback in both comparison panels, global left/right Congress navigation outside form controls, an `S` shortcut that opens a focused selected-state detail on mobile, and a mobile state-detail overlay. The existing district hover context continues to show district, verified member/party information when applicable, and UCLA/Voteview provenance.

The Atlas acceptance suite passed all 17 tests across boundary loading, boundary routes, comparison URL state, 31-frame integrity, playback, source integrity, true-district loading, and the VRA timeline. This confirms all 50 states, all 31 VRA-era Congress frames, source context, comparison URLs, and playback support remain intact.

## Source References

1. `/home/ubuntu/election-map-2026-atlas-audit/client/src/pages/MapComparison.tsx`
2. `/home/ubuntu/black-politics-now/client/src/pages/Atlas.tsx`
