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

## Initial Parity Hypothesis

The integrated Atlas appears to carry the source repository’s major public surfaces and adds editorial/legal provenance. The remaining acceptance work must specifically test the source repository’s interaction-level features: independent comparison playback, keyboard operation, selected-state mobile detail, district popup/source behavior, and all-frame/all-state coverage. No gap should be declared or remediated until this direct comparison is complete.

## Source References

1. `/home/ubuntu/election-map-2026-atlas-audit/client/src/pages/MapComparison.tsx`
2. `/home/ubuntu/black-politics-now/client/src/pages/Atlas.tsx`
