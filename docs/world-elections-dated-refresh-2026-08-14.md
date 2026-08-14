# Dated World Elections Refresh Workflow

**Activated:** August 14, 2026  
**Schedule:** Daily at 13:15 UTC  
**Schedule identifier:** `G4uu9TFTFqcxx5uikbzd68`

## Purpose and boundary

The refresh examines a bounded set of dated World Elections records that are either within 30 days after, or 120 days before, their listed election date. It retrieves up to three already-stored source links for each selected record, stores a source fingerprint and timestamp, and compares the evidence with the preceding review.

> The workflow **never changes a public election date, status, candidate, result, source link, or country drawer automatically**. A changed source creates a private Data Desk recommendation for human review.

## Operational behavior

| Control | Implemented behavior |
|---|---|
| Execution size | At most 12 records per daily run, keeping the job within the two-minute callback budget. |
| Source handling | Captures up to three stored source URLs per record with a seven-second request timeout. |
| First review | Stores a baseline fingerprint without creating unnecessary alerts. |
| Subsequent change | Creates a review-only source-watch recommendation, with high priority for a record marked “Voting Today.” |
| Missing sources | Records the missing-source condition in private audit metadata; it does not invent or substitute a source. |
| Public data | Remains unchanged until an editor reviews evidence and applies a manual update. |

The Admin Overview’s **Global Elections Desk** displays the latest run summary, outstanding changed-source count, and a protected “Refresh sources now” control. The initial manual baseline checked 12 dated records and found no changed or missing source links.
