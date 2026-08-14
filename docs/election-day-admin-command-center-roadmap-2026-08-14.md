# Original Newsroom Boundary and Election Day Admin Roadmap

## Editorial boundary

The **original Black Politics Now WordPress site remains the primary newsroom**. Its established typography, category structure, and article-led identity should not be replaced by the platform. The platform’s public **News** navigation now returns to `https://blkpoliticsnow.com`; the internal `/newsroom` concept remains unpromoted and is not required for public use.

The platform’s job is to complement the newsroom with tools that are difficult to operate inside a conventional publishing site: the U.S. Election Map, World Elections, Historical Atlas, Daily Brief, research workflow, and protected operations dashboard. Future WordPress integration should be limited to optional, clearly labeled utility links such as **Election Map** or a small, editor-curated “Related intelligence” module.

## Current Election Day strengths

| Existing capability | Election Day value |
|---|---|
| DDHQ date-aware polling guard | Updates mapped general-election results on active dates and detects race calls. |
| Election Ops | Allows protected manual review and race-data correction. |
| Overview | Shows scoreboard context, live reporting state, election-night priority work, and task reminders. |
| Agent Desk and Proposed Changes | Converts research into evidence-backed private proposals rather than automatic public edits. |
| Podcast Ops | Shows Daily Brief release gates and source-preflight health. |
| World refresh and Cook Islands watch | Provides review-only source-change monitoring without public automatic mutation. |

## Priority 0: implement before the next high-volume Election Day

| Control | What it adds | Review boundary |
|---|---|---|
| **Election Day Command Center** | One protected screen combining source heartbeat, latest poll timestamp, mapped-race count, reporting coverage, calls awaiting review, and data exceptions. | It observes and organizes; it does not make calls or publish results. |
| **Race Triage Queue** | A sortable list of delayed, conflicting, unmapped, or unusually stale race records, with owner assignment and source links. | A reviewer confirms every escalation or correction. |
| **Reviewable Correction Drafts** | Convert manual election corrections into a before/after proposal with source evidence, just as the Agent Desk now does. | Approval still requires a separate visible apply action. |
| **Election-Day Runbook Panel** | A timestamped checklist for opening, monitoring, calling, verification, correction, and closeout steps. | Checkboxes record operations; they do not trigger external actions. |

## Priority 1: add after the core command center

| Control | What it adds |
|---|---|
| **Source Conflict Ledger** | Captures disagreements among DDHQ, official state sources, AP-style reporting, and editorial review; tracks the resolution and reason. |
| **Decision Audit Trail** | A consolidated log of who approved a proposed change, race correction, or public status update, with the supporting sources. |
| **Notification Composer** | Prepares an owner-reviewed in-app or push notification draft for a race call or major correction. It never sends without confirmation. |
| **Media Briefing Board** | A private view of confirmed calls, significant shifts, pending verification, and source links for rapid editorial handoff. |

## Priority 2: operational maturity

| Control | What it adds |
|---|---|
| **Role-specific queues** | Separates data verification, editorial, visual, and producer work while keeping final public approval with an administrator. |
| **Post-election reconciliation** | Compares final official results with live feeds and documents corrections, timing, and source performance. |
| **Scenario rehearsal mode** | Uses a non-public training state to rehearse triage, approvals, and notifications without modifying real election records. |

> Recommended next build: **Priority 0 Election Day Command Center**, starting with a source-heartbeat board and race triage queue. This concentrates the existing automation, review queues, and manual controls into one practical operations screen without loosening the platform’s human-approval safeguards.
