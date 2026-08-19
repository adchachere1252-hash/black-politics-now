# Ticker Motion and Admin Dashboard Freshness Audit

**Prepared:** August 19, 2026 (EDT)

## Ticker diagnosis and verification

The earlier ticker used a CSS animation that could be suppressed by a motion-preference rule or external style override, allowing the results row to appear stationary. It has been replaced with a `requestAnimationFrame` loop that directly updates the rendered track transform at a consistent 52 pixels per second, wraps after exactly one duplicate-sequence width, and has no pause/resume control.

A direct Chromium DevTools inspection of the rendered local homepage recorded the ticker transform moving from **−49.4px** to **−96.2px** to **−143.0px** over consecutive 900-millisecond samples. This verifies observed movement in the browser rather than relying only on static layout review.

## Admin Dashboard operational freshness

The Admin Overview now rechecks its Election Watch, Daily Brief, World Elections, and research/portrait data every 60 seconds while open. The new **Operational data freshness** monitor displays the latest durable timestamp, state, supporting detail, stale/missing state, and direct link to the relevant Admin workspace. It does not represent a missing timestamp as current.

| Surface | Audited durable state | Last recorded update |
| --- | --- | --- |
| Daily Intelligence Brief | Passed for August 19 | 06:31 EDT |
| Election Watch | Standby, current heartbeat; no active election date | 13:50 EDT |
| World Elections monitor | No source error; 8 changed-source items await human review | 11:04 EDT |
| Morning operational snapshot | Passed | 08:30 EDT |

The World Elections review count is intentionally shown as an Admin review condition, not silently applied public data. The freshness panel directs the administrator to the appropriate workspace for each condition.
