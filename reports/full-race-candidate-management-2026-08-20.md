# Full Race Candidate Management Release

**Prepared:** August 20, 2026 (EDT)  
**Status:** Released for protected Admin use.

## Delivered workflow

The Admin **Candidate Changes** workspace now manages the three public contest types in one place: Governor, Senate, and House. Administrators select the desired tab, search by state, district, contest, or candidate name, and open **Manage** for an individual contest. Senate and House logs support the two listed ballot candidates, each party affiliation, a source label, source URL, and a private explanation of the edit.

Each saved candidate log updates the corresponding public race record but deliberately does not change ratings, vote totals, reporting percentages, manual calls, or certified results. The procedure requires an Admin session and a valid source URL. Every successful Senate or House update writes a separate immutable `election_candidate_edits` row containing the contest identity, new values, source package, editor, private note, and a JSON snapshot of the prior value. Governor logs continue to use their established separate audit ledger.

| Race type | Public candidate fields updated | Private immutable audit history | Source required |
|---|---|---|---|
| Governor | Democratic and Republican candidates, context, source | `governor_candidate_edits` | Yes |
| Senate | Candidate one and two names/parties, source | `election_candidate_edits` | Yes |
| House | Candidate one and two names/parties, source | `election_candidate_edits` | Yes |

## Verification

The database migration adds only nullable candidate-source fields to Senate and House races and the new audit table/index; it does not alter existing public records. Schema inspection confirmed all four source columns and the full 15-column audit ledger are available. Router and component regression tests verify Admin-only mutation, source URL validation, source-backed history, and the three visible race tabs. The full suite passed **52 test files / 163 tests**. TypeScript and production build passed; bundle-size warnings remain non-blocking.

## Admin use

Open **Admin → Candidate Changes**, select **Senate**, **House**, or **Governor**, search the contest, choose **Manage**, provide both candidates and parties plus a source package, then save. The public Election Center receives the updated candidate record on its regular refresh; the private history remains available within that contest’s candidate log.
