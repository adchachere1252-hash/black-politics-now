# Governor Candidate Changes Direct Workflow

**Release date:** August 21, 2026  
**Decision:** Governor candidate sourcing now occurs directly in **Admin → Candidate Changes**, the same workspace used for Senate and House candidate records. Election Ops remains an operational monitoring and results-management surface; it is no longer required for Governor candidate sourcing.

## Corrected workflow

| Step | Governor Candidate Changes behavior |
|---|---|
| Find | Choose the **Governor** contest type and search by state or candidate name. |
| Manage | Select **Manage** on the Governor contest card. The editor expands in that same card; it does not redirect to Election Ops. |
| Source | Enter Democratic and Republican candidates, optional office context, source label, HTTP/HTTPS source URL, and private editorial note. |
| Save | The protected Governor procedure updates only the public candidate fields, writes a private immutable history row, then refreshes the Governor query and Governor history query. |
| Confirm | The workspace displays: “Saved. The public Governor record and private source history refreshed.” |

The same server-side HTTP/HTTPS source validation used for Senate and House now protects the Governor procedure. The direct non-destructive verifier re-saved existing candidate data through the protected Senate, House, and Governor paths and confirmed all three public records and histories refreshed.

## Validation

Focused Governor and Candidate Changes tests passed. The non-destructive candidate verifier reported successful Senate, House, and Governor checks. The full project suite passed **58 files / 183 tests**, TypeScript passed, and the production build passed. The only remaining boundary is a brief owner-session visual check: open **Admin → Candidate Changes → Governor**, choose **Manage** on any card, and verify the editor opens inline.
