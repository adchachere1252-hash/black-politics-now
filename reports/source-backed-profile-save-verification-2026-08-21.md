# Source-Backed Black Representation Profile Save Verification

**Verification date:** August 21, 2026 (EDT)  
**Decision:** The **Create source-backed profile** action is wired to save fully when the required form fields contain valid information. The workflow creates the public Black Representation profile and its immutable audit record in one database transaction; it does not merely close the form.

## Exact save path

| Step | Verified behavior |
|---|---|
| Form validation | The button remains disabled until a name, state, two-letter state code, district/jurisdiction, source label, and source URL are provided. |
| Protected request | Clicking **Create source-backed profile** calls `createProfile.mutate(input)` against an Admin-only procedure. |
| Server validation | The procedure enforces allowed party, office, status, role, and stage values; it rejects invalid source URLs before an insert begins. |
| Atomic persistence | The helper inserts the public `cbc_members` row and a `black_representation_addition_audit` snapshot in one database transaction. |
| Admin refresh | A successful response invalidates the Admin Black Representation query and closes the create form. |
| Public map availability | The public Black Representation query reads all `cbc_members` rows, so the saved profile becomes available to the map on its ordinary data refresh. |

The protected route was specifically checked in both directions. A non-Admin caller is rejected with `FORBIDDEN` before it can call the profile helper. An Admin caller supplying an `ftp://` source is rejected with “A source URL must use HTTP or HTTPS” before any insert begins. The helper itself normalizes the state code, records the source label/URL, and writes the immutable addition-audit snapshot in the same transaction.

No fabricated profile was inserted solely for testing. That preserves the public record and means your first real source-backed profile will be a meaningful editorial addition rather than test data.

## Validation

The focused Admin authorization and profile-save contract tests passed. The final complete suite passed **55 test files / 172 tests**, TypeScript passed, and production build passed. The owner-side visual acceptance remains: sign in, complete the form with a real sourced candidate, and after clicking **Create source-backed profile** confirm that the form closes and the person appears in the Black Representation Editor and map after its normal refresh.
