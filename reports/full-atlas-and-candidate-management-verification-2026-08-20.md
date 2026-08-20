# Full Atlas and Candidate Management Verification

**Verification date:** August 20, 2026 (EDT)  
**Decision:** The current Atlas and protected Governor candidate-management release passed the defined technical and public interaction gates. The new Candidate Changes workspace is included in this release for clear authenticated-owner acceptance.

## Atlas source and rendering verification

The full canonical asset audit fetched and decoded all **31** UCLA shared-topology Congress frames. Each passed its metadata and shared-arc contract and contained **50** named states. Historical region totals ranged from 433 to 435 according to the era’s apportionment context; the current 119th frame contains 435 regions and 2,712 shared arcs. The loader also derives one state exterior for every validated state, so state limits are drawn from the same source topology as the district lines rather than from an unrelated overlay.

| Atlas verification | Result |
|---|---|
| Canonical UCLA frames fetched and decoded | 31 of 31 passed |
| State exteriors derived from source topology | 50 per frame passed |
| Current party map | 435 paths, 0 internal fracture candidates |
| High-detail 113th member frame | 435 paths, 50/50 states, 0 fracture candidates after ready-frame wait |
| Real pointer district selection | Passed; Alabama District 1 opened focused UCLA/Voteview detail |
| State/district visual hierarchy | Passed; warm-graphite state limits remain distinct from fine district lines |

The first automated 113th frame screenshot recorded the normal loading state before its 8.4 MB source frame completed decoding. A direct browser readiness audit then waited for the validated 50/50-state condition and confirmed the full 435-path map. This is not a render failure; the map does not display its surface until the frame is ready.

## Playback and interaction verification

The browser playback journey opened the 89th Congress, verified the UCLA source tag, advanced to the 90th, paused stably beyond one standard interval, reached and automatically stopped on the 119th using fast mode, and restarted at the 89th. Fast completion was **5.432 seconds**, within the documented 7-second validated-frame budget that allows for high-detail source transfer and decoding. The verified pointer path delivered `pointerdown`, `pointerup`, and `click` to an interactive district and focused the selected source-detail landmark.

## Candidate management verification

Manual candidate changes are now discoverable through **Admin → Candidate Changes**. The workspace has a plainly labeled “Change candidates” heading, searchable Governor contest cards, and a dedicated Florida Governor shortcut. Selecting **Manage Florida candidates** opens the existing protected source-backed editor, where both candidate names, source label, source URL, office context, and private editorial reason can be changed. The save procedure requires an administrator, validates the source URL, updates the public Governor record, and writes immutable audit history.

The Florida record was queried directly after the update: it contains David Jolly (D), Byron Donalds (R), the PBS NewsHour / Associated Press source URL, and one audit entry. Protected-router and component regression tests verify that unauthorized callers cannot update the candidate log and that the visible Candidate Changes navigation and Florida shortcut remain present.[1]

## Quality gates and limitation

The full suite passed **51 test files / 160 tests**. Strict TypeScript and the production build passed; build output contains only non-blocking JavaScript chunk-size warnings. The sandbox browser does not have the owner’s authenticated Admin session, so the protected visual screenshot is not available in this environment. The Admin route, component contract, protected mutation, database persistence, public record, and authorization tests all passed. The required owner acceptance is concise: sign in, choose **Candidate Changes**, choose **Manage Florida candidates**, inspect the source card, and save a source-backed edit if one is needed.

## Reference

[1]: https://www.pbs.org/newshour/politics/gop-rep-donalds-will-run-against-democrat-jolly-in-floridas-race-for-governor "PBS NewsHour / Associated Press — Florida Governor nominations, August 19, 2026"
