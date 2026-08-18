# Election Night Primary Simulation Runbook

**Operational date:** August 18, 2026 (EDT)  
**Mode:** Protected administrative rehearsal — **no live source poll, public race write, alert, or publishing action**.

## Purpose and boundary

The platform’s current DDHQ engine is already actively polling the live election date. A direct engine `poll` or `poll-once` command is **not a simulation**: it writes live race fields and can notify the owner when a general-election call appears. Tonight’s simulation must therefore use the protected rehearsal in the Admin Command Center, combined with read-only health checks.

| Validation target | Simulation method | Public-data effect |
| --- | --- | --- |
| DDHQ mapping coverage | Read-only engine `status` output | None |
| Live heartbeat and source health | Inspect Admin Command Center and `election_day_status` | None |
| Election guard continuity | Inspect cron, guarded PID, and recent logs | None |
| Triage workflow | Mark a private rehearsal step and record an example exception | None |
| Research and review handoff | Confirm an investigation and approval remain private and separate from public apply | None |

## Ready-state observed before rehearsal

At 21:03 EDT, the election-day heartbeat reported **active** DDHQ health, **65 mapped and updated races**, **zero failed polls**, and **zero new calls**. The guarded process was present and its most recent minute-by-minute cycles completed 65 updates without an observed error. The five-minute guard also confirmed that the existing polling process was already running, preventing duplicate launch.

## Operator checklist for tonight

1. Sign in as an administrator and open **Admin → Command Center**. Confirm the DDHQ status is **Active**, source health is **Healthy**, and the heartbeat is less than three minutes old. Do not start a command-line poll.
2. Select **Begin rehearsal** in the **Safe practice mode** panel. This creates only a private operational record.
3. Complete **Check heartbeat** after confirming the live status, mapped-race coverage, and recent update summary.
4. Complete **Work triage** using an example coverage or source-review note. Do not edit a race, declare a winner, or select an external publishing action.
5. Complete **Review agent path** by confirming an investigation becomes a private recommendation/proposed change. Do not approve an action for public application during the rehearsal.
6. Complete **Close review** by confirming an approval decision is separate from any public apply step. The rehearsal closes after all four steps are marked.

## Stop and escalation conditions

Pause the rehearsal and use the Command Center’s triage lane if the active heartbeat is older than three minutes, source health is degraded, mapped-race coverage unexpectedly changes, or a new source conflict appears. The manual recovery action is to inspect the election-guard and poll logs; do not manually launch a second polling process while the guarded process is active.

## Rollback and evidence

The rehearsal has no public writes to roll back. Its only durable artifact is the private rehearsal record, which documents the completed steps and any optional note. Keep the current Admin status, the `election_day_status` heartbeat, and the guard/poll logs as the evidence package for the session.

## Completed rehearsal evidence

At **21:18 EDT**, the user-authorized protected rehearsal was completed as private record **#30001**. All four steps—heartbeat, triage, research, and review—were marked complete. The record documents that the exercise used read-only command-center, mapping, heartbeat, and log checks only; it did not invoke DDHQ polling, alter a race or source record, publish a result, or send an owner notification.

Immediately after the private record was saved, the existing guarded poller remained present. Its latest completed polling pass had updated all 65 mapped races with zero errors and zero new calls; the next ordinary polling pass had started normally. The race-call log did not receive a new entry from the rehearsal.
