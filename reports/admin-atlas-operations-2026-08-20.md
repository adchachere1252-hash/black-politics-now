# Admin Atlas Operations Release Record

**Prepared:** August 20, 2026 (EDT)  
**Status:** Released for protected Admin use.

## Delivered controls

| Control | Admin behavior | Public boundary |
|---|---|---|
| Frame health | Shows all 31 Congress frames, registered asset status, 50-state coverage, unique boundary-file count, and overlay contract. | No map geometry or roster record can be edited. |
| Guarded playback check | Runs a deterministic contract check for sequence, frame readiness, pause, completion, restart, and slow/standard/fast timing. Each result is saved with initiating administrator, timestamp, summary, and details. | The check reads source contracts only; it never changes public data. |
| Editorial notes | Saves a state/Congress-scoped draft with a named source and URL; an administrator explicitly approves or returns it to draft. | Only approved notes are queried by the matching public Atlas state/Congress record. Drafts, creator data, reviewer status, and operational audits remain private. |

## Source integrity

The workspace makes the three Atlas layers visible without conflating them: UCLA Congressional District Maps supplies geometry, Census supplies apportionment totals, and Voteview supplies the House roster overlay.[1] [2] [3] The health and playback controls cannot overwrite any of those source layers.

## Verification evidence

The schema migration created `atlas_operations_audits` and `atlas_editorial_notes` with scoped lookup indexes; no editorial notes or audit events were seeded. Regression coverage verified 31 ready frames, 50-state coverage per frame, playback completion, readiness and pause gates, explicit speed intervals, Admin-only health access, and public-note field filtering. The full suite passed **47 test files / 152 tests**, TypeScript passed, and the production build passed.

The source-linked public Atlas was visually rechecked after the approved-note query was added. The persistent browser session did not hold an Admin login, so protected visual acceptance should be performed by the owner after sign-in; the protected-router test confirms the authorization boundary.

## References

[1]: https://cdmaps.polisci.ucla.edu/ "UCLA Congressional District Maps — U.S. Congressional District Shapefiles"

[2]: https://www.census.gov/data/tables/time-series/dec/apportionment-data-text.html "U.S. Census Bureau — Apportionment Data"

[3]: https://voteview.com/data "Voteview Data"
