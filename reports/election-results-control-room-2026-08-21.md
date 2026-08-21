# Election Results Control Room

**Release date:** August 21, 2026  
**Purpose:** A protected Admin workspace for watching stored election returns, evaluating source readiness, confirming a winner only with cited evidence, reviewing source conflicts, and retaining an immutable human operator record.

## Operational workflow

| Step | Control Room behavior | Safety boundary |
|---|---|---|
| Monitor | Combines Senate, House, and Governor records with reporting percentage, stored vote totals, source age, source-engine heartbeat, and explicit zero-return states | Reading the workspace does not poll a source, call a race, or change public data |
| Review | Shows durable source-health and data-quality conflicts beside the return board | A conflict remains a review prompt, not a result update |
| Confirm | Lets an Admin select only a currently mapped D/R/I candidate and supply a source label, valid HTTP/HTTPS source URL, and optional private note | The action sets the public call only after explicit human submission; unmapped candidates and missing/invalid sources are rejected |
| Record | Stores the prior public value, winner, source, operator, note, and timestamp in `election_result_confirmations` | The confirmation row is append-only in application workflows and supports later reconciliation |

## Delivered workspace

The **Results Control Room** tab is available in Admin navigation beside the Election Day Command Center. It refreshes its snapshot every 30 seconds while open and supports chamber, text, and reporting-only filters. Each row keeps scheduled records visible without inventing a percentage before returns are stored. When a cited result is confirmed, the Admin sees a green receipt only after the public queries and private control-room record have refreshed.

The implementation reuses the existing source-conflict queue and Election Day heartbeat rather than creating a duplicate monitor. It adds one non-destructive database table, `election_result_confirmations`, with indexes for race history and recent activity. The migration was applied and its schema and indexes were confirmed in the database.

## Verification

Focused tests confirm that the control room returns its consolidated race, conflict, and activity contract only to Admin users; non-admin callers are blocked; and an unmapped candidate is rejected before a public race or audit row can change. The full suite passed **58 files / 179 tests**. TypeScript and production build also passed. The sandbox browser is not signed into the owner account, so the remaining visual acceptance step is to open **Admin → Results Control Room** in the owner’s session and review the first live confirmation form without submitting a result.
