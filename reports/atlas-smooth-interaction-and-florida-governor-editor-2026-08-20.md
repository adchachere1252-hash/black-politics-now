# Atlas Smooth Interaction and Florida Governor Editor Release

**Prepared:** August 20, 2026 (EDT)  
**Status:** Released after source, workflow, and build validation.

## Historical Atlas improvements

The selected-state treatment no longer redraws every Alabama district with a heavy black border. Party fills remain the public data signal—blue for Democratic, red for Republican, and purple for other/independent—and the selected state is communicated in the compact map-status card instead. This prevents a selection affordance from looking like boundary data.

Playback now performs two distinct steps: it shows the current validated frame for the selected dwell interval, then swaps only after the next canonical UCLA geometry and applicable Voteview overlay have been prepared. The next frame and overlay are preloaded after every successful render. The map no longer resets its zoom or pan whenever Congress changes, page scroll does not unintentionally zoom the map, and panning begins only after the reader has deliberately zoomed in. The reset control remains the explicit way to return to the fitted national view.

| Playback acceptance check | Result |
|---|---|
| Standard advance waits for a ready 50-state frame | Passed |
| Pause held the 90th Congress frame for more than one standard interval | Passed |
| Fast mode reached, rendered, and stopped at the 119th Congress | Passed in 4.914 seconds |
| Restart from final frame returned to the 89th Congress | Passed |
| Current party-map surface | 435 paths, zero internal fracture candidates |

## Protected Florida Governor candidate log

Admin → Election Data Editor → Governors now includes **Manage candidates** for each governor contest. It requires a Democratic candidate, Republican candidate, source label, and valid source URL. It can record each candidate’s office context and a private editor note. A save writes the public Governor record and an immutable private change-history entry; it cannot call a winner or alter election results.

Florida’s Governor record now lists **David Jolly (D)** and **Byron Donalds (R)** as the 2026 general-election candidates. The correction is linked to PBS NewsHour / Associated Press reporting published August 19, 2026, which states that Donalds won the Republican nomination and Jolly won the Democratic nomination.[1] The prior record and the verification rationale are preserved in the manual-edit audit history.

## Validation

The reviewed schema migration `0034_cold_risque.sql` adds only source fields to `governor_races` plus the new `governor_candidate_edits` audit table and index. Database verification confirmed the Florida public record and audit entry. Atlas palette, loader, playback, and candidate-log tests passed; the full suite passed **51 files / 160 tests**; TypeScript and the production build passed. The production bundle retains only non-blocking chunk-size warnings.

## Reference

[1]: https://www.pbs.org/newshour/politics/gop-rep-donalds-will-run-against-democrat-jolly-in-floridas-race-for-governor "PBS NewsHour / Associated Press — Donalds and Jolly Florida Governor nominations, August 19, 2026"
