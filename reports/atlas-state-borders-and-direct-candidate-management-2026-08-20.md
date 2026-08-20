# Atlas State Borders and Direct Candidate Management

**Prepared:** August 20, 2026 (EDT)  
**Status:** Released after visual, source-contract, regression, and production-build checks.

## State-border hierarchy

The Historical Atlas now derives one exterior for each of the 50 states by merging each state’s districts directly from the same canonical UCLA shared topology used for the party, boundary, and member layers. The overlay is rendered above fine district strokes with a warm-graphite line that is visibly stronger than district boundaries without becoming a heavy black selection border. It does not assign any color, seat, party, or member to the state exterior.

The current 119th party-map review showed 435 district paths, all 50 source-derived state exteriors, zero internal fracture candidates, and a clear distinction between the finer congressional district lines and state limits. The same loading contract is enforced for every Congress frame.

## Direct candidate management

Admin → Candidates now offers a **Manage Governor candidate log** entry when the Governor category is active. It carries the current candidate/state search into Admin → Election Ops → Governors, opens the Governor editor, and filters the contest list. Administrators can then use **Manage candidates** in the focused contest to update the Democratic candidate, Republican candidate, source label, source URL, office context, and private reason for the change. Each source-backed edit remains audit logged and is reflected in the public Governor record after save.

The Florida contest remains the checked example: David Jolly (D) and Byron Donalds (R), with the PBS NewsHour / Associated Press source retained in the contest and its immutable audit entry.[1]

## Validation

TypeScript passed. The targeted state-border loader and candidate-log tests passed, followed by the full suite of **51 test files / 160 tests**. The production build passed; only non-blocking chunk-size warnings remain.

## Reference

[1]: https://www.pbs.org/newshour/politics/gop-rep-donalds-will-run-against-democrat-jolly-in-floridas-race-for-governor "PBS NewsHour / Associated Press — Florida Governor nominations, August 19, 2026"
