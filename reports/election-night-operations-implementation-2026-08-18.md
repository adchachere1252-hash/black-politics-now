# Election Night Operations Implementation Notes

**Prepared:** August 18, 2026 (EDT)

## Public status boundary

The public status strip reads only the existing durable `election_day_status` heartbeat. It shows the operating mode, source-health state, mapped-versus-updated race coverage, call count for the current cycle, and a local-time freshness indicator. It exposes neither credentials, private triage details, rehearsal records, source URLs awaiting review, nor any control that can alter a result.

## Ticker diagnosis and repair

The original ticker duplicated its item list but animated the full flex row without an isolated viewport or accessible explicit pause control. On narrow displays, that made the strip appear to run out of room and made its motion harder to control. The repaired ticker now has a fixed viewport, a width-sized looping track, a slower mobile cadence, hover/focus pause behavior, an explicit pause/resume button, and a reduced-motion horizontal-scroll fallback. Its eligibility guard still excludes races marked **Primary** or **Primary Runoff**.

Desktop and 375-pixel mobile visual checks confirmed the result row, control, and public Election Night strip remain visible without horizontal page overflow. The strip showed the active DDHQ heartbeat with 65 of 65 mapped races updated, zero calls in the current cycle, and an update time of 9:29 PM during verification.

## Protected source-conflict boundary

The Admin-only queue joins only pending `source_watch` and `data_quality` recommendations with any degraded heartbeat signal. Each item gives a summary, evidence, and suggested next action but has no result-writing, alerting, or publishing capability. Public corrections remain subject to the existing human review and source-evidence controls.
