# Change Candidates End-to-End Save Verification

**Verification date:** August 21, 2026 (EDT)  
**Decision:** The Change Candidates save workflow is connected end to end. A protected Governor save was executed through the actual Admin procedure with unchanged Florida data, then verified in the refreshed public contest query and immutable history. Senate and House follow the same protected transaction contract; no live reviewed Senate or House source package was available to make a no-visible-change production write without inventing evidence.

## What the panel saves

| Race type | Form entry | Protected procedure | Public record updated | Private immutable history |
|---|---|---|---|---|
| Senate | Candidate one/two, parties, source label, source URL, editor note | `updateSenateCandidateLog` | `senate_races` candidate fields and source fields | `election_candidate_edits` |
| House | Candidate one/two, parties, source label, source URL, editor note | `updateHouseCandidateLog` | `house_races` candidate fields and source fields | `election_candidate_edits` |
| Governor | Democratic/Republican candidates, office context, source label, source URL, editor note | `updateGovernorCandidateLog` | `governor_races` candidate fields and source fields | `governor_candidate_edits` |

The Senate and House editor performs form validation before mutation, then validates an HTTP/HTTPS evidence URL in the browser. The server repeats the source validation, updates the public contest fields, and inserts the new edit history snapshot. Governor uses the same source-backed pattern through the dedicated Governor editor opened from Candidate Changes.

## Executed persistence check

The end-to-end verifier selected Florida Governor record **#8** with its existing PBS NewsHour / Associated Press source package, submitted the same David Jolly (D) and Byron Donalds (R) values through `updateGovernorCandidateLog`, then queried both the public Governor list and governor candidate-history endpoint. Both checks returned the saved candidate values and the new immutable verification-history entry. No public candidate value was changed during this test.

There were no Senate or House contests with a complete reviewed source package in the current database, so the verifier safely reported those as unavailable rather than inventing an evidentiary source merely to force a live write. Their protected mutation, history, source-validation, and Admin-success receipt contracts are covered by regression tests.

## Usability improvement

Every successful candidate save now produces a visible green receipt in the open editor:

> **Saved. The public [Senate/House/Governor] record and private source history refreshed.**

The form invalidates the public race query and its private history query before showing this message, so the card summary and history list refresh from persisted data rather than reporting a purely local change.

## Validation

The full suite passed **56 test files / 175 tests**. Strict TypeScript and production build passed. Unauthorized callers remain blocked before candidate mutation, and invalid/empty candidate fields or non-HTTP/HTTPS source URLs remain blocked on both client and server paths.
