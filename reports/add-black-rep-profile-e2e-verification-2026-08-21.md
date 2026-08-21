# Add Black Rep Profile End-to-End Verification

**Verification date:** August 21, 2026  
**Decision:** The **Add Black Rep Profile** workflow is connected end to end. Source-backed profile creation is restricted to Admin users, validates input before persistence, writes the public profile and immutable addition audit in one database transaction, refreshes the public list, and displays a persisted-save receipt in the Admin editor.

## Verified workflow

| Stage | Verification result |
|---|---|
| Form and client feedback | The form requires name, state, two-letter state code, district/jurisdiction (up to 128 characters), source label, and source URL before enabling **Create source-backed profile**. On success, the parent workspace invalidates the public Black Representation query and displays: “Profile saved. The public Black Representation list and protected addition history refreshed.” |
| Protected access | A non-Admin caller was blocked from the profile-creation procedure before it could reach database persistence. |
| Source guard | An Admin request using an `ftp://` source was rejected with the HTTP/HTTPS source rule. The public list and profile addition-audit ledger counts were unchanged. |
| Public persistence | An existing audited profile was verified through the public Black Representation query: **Marquita Bradshaw**, record #270001, Tennessee Senate jurisdiction, with matching state code, district, and member name. |
| Audit history | The profile addition audit retained source URL, source label, adding administrator, source snapshot, target ID, state code, and district. |

No profile was created, updated, or removed during the check. The verifier currently sees **113** public Black Representation profiles and **2** source-backed profile-addition audit rows.

## Regression correction and validation

Full-suite validation revealed a stale test expectation for Stacey Plaskett. The persisted record is correctly `elected`, not `advanced_to_general`, so the regression now reflects the verified data. The full suite passed **58 files / 182 tests**; TypeScript and production build passed.

The remaining acceptance boundary is visual only: the available verification browser is not signed into the owner account. In the owner session, open **Admin → Black Representation → Add Black Rep profile** and confirm the green receipt after a future real source-backed submission.
