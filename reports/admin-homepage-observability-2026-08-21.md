# Admin Homepage Health and Release Observability

**Release date:** August 21, 2026  
**Purpose:** Give the administrator a concise, durable view of homepage query health, retry behavior, and GitHub release readiness without exposing visitor identity, request content, or private credentials.

## New Admin Overview controls

| Card | What it shows | Operational meaning |
|---|---|---|
| Homepage API health | Healthy, Retrying, or Needs attention; failed public query count over the last hour; latest query path; retry policy | Homepage election and content queries now retry up to three total attempts using bounded exponential backoff before a durable failure signal is recorded. |
| Release checklist | Same-origin homepage endpoint, retry policy, and live GitHub `main` remote check | The card verifies that the configured GitHub repository endpoint is reachable and reports its latest remote short commit. It explicitly shows **Review** when that remote check is unavailable rather than implying synchronization. |

## Data safeguards

The telemetry table retains only a bounded query path, attempt number, error category, and timestamp. It stores no query payload, URL query string, visitor session value, IP address, account identity, or source content. The homepage health status and release checklist are Admin-only. Public clients may report an error event but cannot read aggregated telemetry or release status.

The telemetry table was deployed empty. No artificial failure was inserted for testing. The Admin card correctly treats that state as healthy once data is returned, with zero failures in the trailing hour.

## Verification

The migration created the `homepage_query_telemetry` table and both time/path indexes. TypeScript passed; focused endpoint and analytics tests passed; the full project regression suite and production build passed. The remaining visual boundary is owner authentication: in the owner session, open **Admin → Overview** and verify both cards load beneath **Operational data freshness**.
