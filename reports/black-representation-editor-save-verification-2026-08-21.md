# Black Representation Editor Save Verification

**Verification date:** August 21, 2026  
**Decision:** A real profile-save defect was found and repaired. The existing profile editor submitted the obsolete `cbcStatus` property while the application’s protected contract and database model use `status`. The interface marked the card “Saved” immediately, before the server response, which could make a failed or no-op request appear successful.

## Root cause and correction

| Surface | Previous behavior | Corrected behavior |
|---|---|---|
| Existing profile editor | Read and sent `cbcStatus`; showed a local success state immediately | Reads and sends `status`; waits for the protected mutation to resolve before showing success |
| Existing contest editor | Showed local success before the mutation resolved | Awaits the protected mutation and displays an explicit success or failure message |
| Profile/contest mutation APIs | Accepted arbitrary object data and could silently return when the database was unavailable | Accept only explicit supported fields, reject stale/empty/invalid payloads, throw when the database is unavailable or the target record is absent |
| Add profile / Add race forms | Dismissed after success without a durable visible confirmation | Invalidate public queries and show a green receipt confirming the public list/map ledger and protected addition history refreshed |

## End-to-end verification

The saved verifier used the actual protected Admin procedures with existing records and then re-read the public queries. It re-saved **Maxwell Frost — FL-10** unchanged as a Black Representation profile and the related **FL-10** contest unchanged. Both appeared in the refreshed public contracts with the expected fields:

| Record | Persisted values confirmed |
|---|---|
| Profile | ID 13, Maxwell Frost, FL-10, `won_general` |
| Contest | ID 60005, FL-10, `uncontested`, Maxwell Frost |

No fabricated person, race, result, or public record was inserted during verification. Profile and contest creation remain source-required and transactionally write the immutable `black_representation_addition_audit` record when an administrator creates a new item.

## Validation results

The focused editor tests and router tests passed (**39 tests** across the two relevant files). The complete project suite passed (**56 files / 175 tests**), TypeScript passed, and the production build passed. The deployed Admin route is intentionally protected; the available sandbox browser was not signed in, so final visual confirmation of the green receipt in the owner’s authenticated session remains a short acceptance check after release.
