# Certified Results Archive Readiness

**Prepared:** August 18, 2026 (EDT)

## Current certification state

The live election ledger currently contains **zero** records marked `Certified` across Senate, House, Governor, and Referendum categories. The public archive therefore correctly remains empty. This is intentional: a live result, a DDHQ call, or a primary outcome cannot populate a certification archive.

## Archive contract

The post-certification archive now requires an administrator to provide an election authority name, a valid authority certification URL, a certification statement, a certification date, and an archive key. At creation, the system reads only rows already marked `Certified`, verifies each race record has a winner and a valid result source, copies the exact public result fields into an archive-entry ledger, and calculates a SHA-256 snapshot digest. The application exposes no archive update or deletion procedure.

| Surface | Current behavior |
| --- | --- |
| Public Archive → Elections | Displays only created certified snapshots; shows an honest empty state until certification exists. |
| Admin Command Center | Shows certification eligibility by chamber and enables archive creation only when a Certified ledger is available. |
| Preliminary, called, and primary results | Excluded from snapshot eligibility. |
| Evidence | Archive-level election-authority URL plus per-race result source URL are retained. |

## Visual validation

Desktop and 375-pixel mobile checks confirmed that the Elections archive tab presents an unambiguous certified-only explanation and an accessible no-record state without misleading readers about live results.
