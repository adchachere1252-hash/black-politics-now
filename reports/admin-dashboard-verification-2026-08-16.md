# Black Politics Now — Fresh Admin Dashboard Verification

**Audit date:** August 16, 2026  
**Scope:** Protected Admin dashboard, operational data paths, active queues, responsive layouts, and non-destructive control boundaries.  
**Method:** Read-only route and query inspection, desktop and mobile rendered checks, a production build, TypeScript validation, the full Vitest suite, runtime-console review, and live operational database summaries. No race result, portrait, source record, automation setting, or public content was changed during this audit.

## Executive conclusion

The Admin dashboard is **functionally substantive rather than decorative**. Its protected workspaces load real operational records; election edits require privileged access and winner evidence; portrait review separates research from public mutation; and the dashboard exposes meaningful queues for World Elections, Research Desk work, podcast operations, and Election Day readiness. The fresh audit also found and corrected two concrete defects: Portrait Review was difficult to reach in the live navigation, and Overview incorrectly showed the election engine as live whenever a historical race had percentage data.

The dashboard is not yet operationally complete. The clearest remaining weaknesses are queue triage, evidence-quality signaling in portrait research, task ownership deadlines, and a mismatch between the breadth of the Admin surface and the small-screen navigation model. These are workflow and observability gaps, not evidence of uncontrolled public mutation.

## Verification coverage and result

| Area | Result | Evidence observed | Assessment |
|---|---:|---|---|
| Protected route and permission boundary | Passed | The Admin route presents authentication and role gates; protected tRPC procedures remain covered by the Admin acceptance and router tests. | Strong |
| Workspace inventory | Passed | Overview, Command Center, Podcast Ops, Election Ops, Black Representation, Atlas & World, Agent Desk, Proposed Changes, Portrait Review, and Audience all render as distinct workspaces. | Strong |
| Portrait research safety | Passed | The active 168-target batch is private; 42 findings are ready to inspect, 4 are in progress, and 122 remain queued. Public portrait mutation still requires the separate provenance submission review. | Strong |
| Portrait Review discoverability | Repaired | Admin navigation now wraps on desktop, retains a stable `?tab=portraits` route, includes a persistent **Open Portrait Review** action, and surfaces the 42 ready findings on Overview. | Repaired |
| Portrait Review rendering | Repaired | Two React list-key warnings were identified in the console and corrected. A fresh rendered check added no further Portrait Review key warning. | Repaired |
| Election engine status | Repaired | Overview previously marked the engine live from historical percentage fields despite a `standby/unknown` heartbeat. The badge now follows the authoritative heartbeat and correctly shows **Standby**. | Repaired |
| Podcast operations | Passed with observability gap | The latest brief and publication gates render; the dashboard keeps a brief held unless source, scripts, dual voice assets, and full audio pass. The run-history panel can be empty even when operations exist. | Mixed |
| Agent Desk and change review | Passed with backlog | Current data contains 51 open tasks, 50 ready-for-review tasks, 14 approved source/change proposals, and one revision request. | Mixed |
| Atlas & World operations | Passed with review backlog | The World desk renders real source-refresh items; the current snapshot contains 12 changed items awaiting human review. | Mixed |
| Desktop and mobile layout | Passed with navigation limitation | The desktop tab strip now wraps. On mobile, the persistent Portrait action provides a reliable shortcut, but the full horizontal tab strip still requires scrolling to reach non-leading workspaces. | Mixed |
| Technical verification | Passed | Production build, TypeScript, and all 62 Vitest tests passed after the status correction. | Strong |

## Confirmed strengths

The dashboard has a credible **human-in-the-loop safety architecture**. Portrait research produces private work packages, agent work produces reviewable changes, World Elections source refreshes route changed signals into review, and Election Ops requires evidence for a manual winner call. These layers materially reduce the risk of an autonomous component silently changing a public election or candidate record.

The **Election Day model is appropriately separated**. Command Center and heartbeat records provide operational context, while public race displays and manual calls retain separate constraints. The false-live display was a presentation defect, not a proof that the engine was polling outside its configured window; it is now corrected to reflect the actual heartbeat mode.

The **Portrait Review pathway is now usable**. The Admin overview exposes the batch count, the direct button opens the workspace, status filters make the 168-target batch inspectable, and each selected finding shows the target and its research package. The five previously reviewed portrait decisions remain visible as auditable recent decisions.

## Confirmed shortcomings and operational risks

### 1. “Ready for review” is broader than “source proposal ready”

The active ready-for-review list contains items with **zero source proposals** when the research package found insufficient supporting evidence. This is safe, but the label can make an editor expect a usable image candidate. The current detail pane correctly says not to create or approve a portrait from such an item, but the queue needs a stronger outcome distinction.

### 2. Backlogs lack a decision-time model

There are 51 open Agent Desk tasks, 50 ready-for-review tasks, and 12 World source-change review items. The Overview task-reminder panel currently reports no overdue or upcoming work because no open task has a due date. This makes the dashboard informative but not yet a reliable daily operations queue.

### 3. Mobile Admin navigation remains horizontally dense

The direct Portrait shortcut resolves the most urgent discoverability issue. However, the complete tab set is still horizontally scrollable on a small screen. An operator can reach every tab, but the dashboard does not yet provide a compact mobile workspace chooser or an explicit “more workspaces” control.

### 4. Podcast reliability is visible, but run-level auditability is incomplete

Podcast Ops shows the current release gates and latest episode diagnostics. When pipeline-run records are unavailable, however, the history panel can be empty even though an episode/preflight record exists. This weakens post-incident diagnosis: an editor can see a held or verified state but may not see the preceding attempt timeline.

### 5. Standby heartbeat source health is not yet informative

The now-correct Overview shows **Standby** with `source unknown`. Standby is appropriate outside an active election date, but a durable standby heartbeat should still state whether the guard itself is healthy. Otherwise, “not polling because it should not poll” and “not polling because the guard has failed” remain too close operationally.

### 6. Operator instructions are more exposed than necessary

The Admin Overview includes the cloud-computer IP address and an SSH command for manual polling. This is inside an admin-only surface, but routine use should rely on bounded dashboard actions or a private runbook link. Keeping direct infrastructure commands in the primary dashboard creates avoidable operator error and disclosure risk.

## Prioritized recommendations

| Priority | Recommendation | Expected benefit | Scope |
|---|---|---|---|
| P1 | Add **“Has source proposal”** and **“No usable evidence”** filters to Portrait Review, and label empty-proposal findings as *No evidence package* rather than *Ready for review*. | Reduces wasted portrait-review time and makes the 42-item queue actionable. | Portrait Review |
| P1 | Add a required triage date and owner to high-priority Agent Desk, World-refresh, and portrait-review work; expose them in Needs Decision Now. | Converts the dashboard from a visibility surface into a daily operations queue. | Overview, Agent Desk, World |
| P1 | Change standby heartbeat output to include a guard-health result and age threshold, for example **“Standby — guard seen 5 minutes ago”**. | Makes Election Day readiness auditable before results arrive. | Automation and Overview |
| P2 | Add a mobile **Workspace** selector or “More Admin workspaces” sheet. | Makes every protected workspace discoverable without horizontal scrolling. | Admin navigation |
| P2 | Persist and display a compact podcast run timeline—even when a run ends in a safe hold. | Improves diagnosis when the Daily Brief is delayed or blocked. | Podcast Ops |
| P2 | Move the raw SSH command and cloud IP into a protected runbook disclosure, leaving a plain-language status in Overview. | Reduces accidental manual operations and lowers infrastructure exposure. | Overview |

## Repaired during this audit

The following issues were corrected as part of this verification rather than merely reported:

1. The Admin navigation no longer clips **Portrait Review** and **Audience** on desktop; selected tabs now update the browser route.
2. A persistent **Open Portrait Review** action appears on all Admin tabs, and Overview displays the active portrait-research finding count as a decision item.
3. Portrait Review list renders now use stable keys, eliminating the observed React warnings.
4. The election-engine badge now uses the `election_day_status` heartbeat mode rather than historical race reporting percentages; a standby engine is no longer labeled live.

## Final assessment

The Admin dashboard is **ready for controlled editorial operations**: it has protected data paths, review-before-public-change boundaries, meaningful operational views, and a working active portrait batch. It is not yet optimized for high-volume triage. The next work should focus on evidence-quality filters, due-date discipline, standby health semantics, and a compact mobile workspace chooser. Those changes would materially improve the dashboard’s ability to support an election-night or daily editorial command role without weakening its existing safety controls.

## Post-audit validation: visual portrait approval workflow

The Portrait Review workflow was extended after the initial audit because the active research list did not visibly connect an evidence-backed image to the existing approval queue. The protected flow now works as follows:

1. A research package is checked for **both** a direct image URL and a separate cited source page.
2. Only a package that has both requirements can display a candidate image and create a **private pending visual review**.
3. The pending review shows the image, the provenance link, an optional reviewer note, and explicit **Approve** and **Reject** controls.
4. Approval writes only the reviewed URL to the exact target record; rejection makes no public change.
5. Completed decisions retain a visual thumbnail, a provenance link, the reviewer, date, and decision status for audit.

The active batch currently has **42 research findings but no evidence-backed image proposal**. This is correctly displayed as **“Research only — not approval-ready”** rather than giving a misleading approval button. The visual workflow is therefore fully functional, but it cannot manufacture an approvable image when the research package lacks an independently verified image and source. The existing submission form remains available to add such a source-backed image for the correct candidate, at which point it enters the visual approval queue.

The complete protected route, source-evidence eligibility helper, and Administrator-only submission/review boundaries are covered by regression tests. After this extension, the suite contains **66 passing tests**.

## Additional workspace validation

The refreshed check re-rendered Command Center, Podcast Ops, Election Ops, Black Representation, Atlas & World, Agent Desk, Proposed Changes, and Audience alongside the Portrait workflow. Command Center, Podcast Ops, Election Ops, Black Representation, Atlas & World, Agent Desk, and Proposed Changes loaded their expected live records and protected controls. Audience currently renders its intended empty-state message—analytics/subscriber data will appear once those features are enabled and traffic data is available. It is not a runtime failure, but it is an unfinished operational workspace rather than an analytics tool today.
