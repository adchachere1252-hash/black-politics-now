# Election Update Autonomy Audit — August 12, 2026

## Finding

The review found that the DDHQ election engine had a valid mapping inventory and had written election-record updates on August 11, but the continuous minute-by-minute polling loop was **not running automatically**. The scheduled automation only ran daily race discovery; it did not launch the engine’s `poll` process. There were no documented race calls in the race-call log during the reviewed period.

| Audit area | Before remediation | Verified remediation |
| --- | --- | --- |
| DDHQ mappings | 65 mapped contests: 4 Senate, 9 Governor, and 52 House | Retained and used by the guard |
| Last-48-hour database activity | 15 Senate, 30 House, and 16 Governor records had recent updates; no new calls were recorded | Guard writes fresh updates on active election dates |
| Live polling | Required a manual `election-engine.mjs poll` launch | Date-aware guard evaluates active dates every five minutes |
| Duplicate protection | No scheduled owner for the polling loop | PID tracking plus `flock` prevent duplicate loops |
| Audit trail | Discovery log existed; continuous poll output was not captured | Poll cycles write to `logs/election-poll.log`; guard actions write to `logs/election-guard.log` |

## Current Autonomous Behavior

The cloud host now runs `run-election-guard.mjs` every five minutes. On an active primary, runoff, or general-election date, the guard starts one detached DDHQ polling process and records its process identifier. That process polls every 60 seconds, updates the mapped races, and keeps primary outcomes separate from public general-election calls. After the active date window closes, the guard stops its owned polling process.

The remediation was live-tested on August 12. The guard identified the August 11 election date, launched the DDHQ process, and the durable poll log recorded a completed cycle of **65 updated mapped races, zero errors, and zero new general-election calls**.

## Dashboard Publication Verification

The expanded World Elections and Voting Rights Act panels were verified in the local dashboard with 48 tracked elections, 25 upcoming contests, and the live-count field. The first published-domain refresh following the dashboard release continued to serve the preceding dashboard bundle, which displayed an obsolete regional metric. After the updated bundle propagated, the published homepage confirmed the corrected **48 tracked**, **25 upcoming**, and live-count display, alongside the Voting Rights Act feature window.

## Operational Limits

The guard only polls races that DDHQ has mapped. Daily discovery continues to refresh those mappings. Primary calls remain stored as primary outcomes rather than being shown as general-election calls; this protects the public map from misrepresenting the stage of a contest.
