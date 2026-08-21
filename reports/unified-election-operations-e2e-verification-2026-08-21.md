# Unified Election Operations End-to-End Verification

**Release date:** August 21, 2026  
**Decision:** The former top-level **Results Control Room**, **Candidate Changes**, and **Candidates** entries are now one protected **Election Operations** workspace. Existing legacy query links for `results`, `candidateChanges`, and `candidates` resolve to the unified workspace rather than reaching a dead or duplicated surface.

## Unified operating model

| Section | Purpose | Protected safeguards retained |
|---|---|---|
| Candidate directory | Find Senate, House, Governor, and Black Representation candidate records; continue to portrait or profile work | Candidate directory remains read-only for election data and routes portrait actions through the approved review workflow |
| Candidate sourcing | Manage Senate, House, and Governor general-election candidate records with source label, HTTP/HTTPS source URL, private note, public refresh, and immutable candidate history | Cannot call a winner or change vote totals; non-Admin access and non-web source protocols are blocked |
| Results & conflicts | Review returns, source freshness, manual winner confirmation, source conflicts, and the immutable confirmation ledger | A mapped candidate and cited HTTP/HTTPS evidence are required before a human can confirm a public call |

**Election Day Command Center** remains a distinct Election Night coordination and rehearsal surface, not a duplicate candidate or results dashboard.

## Non-destructive end-to-end evidence

The unified workspace uses the prior protected contracts unchanged. The Election Ops verifier confirmed a 35-Senate, 435-House, and 37-Governor public board; non-Admin candidate updates were blocked; invalid FTP evidence did not change public records or private candidate histories; and 8 source conflicts remain available for review. The results verifier reconciled all 507 board records, rejected an unmapped winner without mutation, and confirmed Wesley Bell’s Missouri 1 public call matches its stored source record. No candidate, race, vote total, call, conflict, or audit record was created or changed.

## Validation

The unified navigation and source-contract tests passed. The full suite passed **59 files / 184 tests**, TypeScript passed, and the production build passed. The remaining acceptance step is visual only: in the owner session, open **Admin → Election Operations**, switch through the three sections, and confirm the Candidate Directory’s **Open candidate sourcing** action selects the sourcing section without leaving the workspace.
