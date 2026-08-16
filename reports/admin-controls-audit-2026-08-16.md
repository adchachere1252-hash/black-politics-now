# Admin Dashboard Controls Audit

**Prepared:** August 16, 2026  
**Scope:** Protected Admin dashboard controls, navigation, Portrait Review, operations workspaces, and responsive behavior.  
**Method:** Source inspection, protected admin-equivalent procedure tests, database state checks, desktop and mobile rendering reviews, production build, TypeScript validation, and the full regression suite.

## Executive Assessment

The Admin dashboard has a functioning protected operating model: data-changing actions are role-gated and review-first, while the public election and portrait records remain separated from draft/review artifacts. The audit identified one confirmed navigation defect and one misleading batch-status condition. Both are corrected in this release.

The principal remaining limitation is **evidence collection**, not the approval workflow. The active portrait batch currently has no source-backed portrait proposals, so it cannot responsibly create approval cards automatically. The dashboard now presents those items as **Evidence needed**, exposes an explicit manual evidence path, and shows a real pending visual review package for administrator decision.

## Verified Controls

| Workspace | Control or label | Status | Verified behavior |
|---|---|---:|---|
| Admin navigation | Ten workspace tabs | Working | Each tab changes the in-page workspace and updates the `?tab=` URL state. |
| Portrait operations | **Open active batch** | Repaired | Opens Portrait Review and scrolls directly to the Bulk portrait research workspace. |
| Portrait Review | Status filters | Working | Queued, In progress, Source packages, Evidence needed, and Skipped items are visible. |
| Portrait Review | Add image and source evidence | Working | Preselects the selected candidate in the private provenance submission form; no public mutation occurs. |
| Portrait Review | Approve / Reject | Working | Visible on the source-backed Alan Wilson pending review package. Approval is the only action that can apply the portrait to its exact target record. |
| Portrait Review | Recent decisions | Working | Retains the portrait thumbnail, source link, reviewer, date, and decision state. |
| Election Ops | Manual winner confirmation | Working with safeguard | Requires candidate selection plus an HTTPS evidence URL; protected route tests verify missing evidence is rejected. |
| Command Center | Refresh snapshot / Election Day research | Working | Refreshes protected operational data or creates a private research package; it does not call races or publish results. |
| Agent Desk | Research, assignment, priority mode, task execution | Working | Produces private recommendations and reviewed work packages. It has no direct publication path. |
| Proposed Changes | Approve, reject, request revision, rerun research | Working | Records a review decision or private research outcome only. |
| Podcast Ops | Operational monitoring controls | Working | Loads operational episode and processing context through protected procedures. |
| Atlas & World | Source refresh | Working with safeguard | Creates review context; public records are not updated automatically. |
| Black Representation | Record operations | Working | Protected editable workflows remain separated from public display. |
| Audience | Placeholder workspace | Deferred | Subscriber and audience-management functionality has not been enabled; it should be treated as informational, not as a working CRM. |

## Current Portrait Batch State

| State | Count | Meaning |
|---|---:|---|
| Queued | 122 | Private research work remains to be processed. |
| In progress | 4 | Source research is actively running. |
| Source packages | 0 | No current research item has a usable source proposal. |
| Evidence needed | 42 | Research completed without a source-backed image proposal; these cannot be approved. |
| Pending visual review | 1 | Alan Wilson’s official South Carolina government portrait is ready for an administrator to approve or reject. |

> The new Alan Wilson card is a **private pending review**, not a public portrait update. Its image is sourced from the South Carolina Attorney General’s official page. The Governor record remains unchanged unless an administrator clicks **Approve**.

## Confirmed Repairs

The prior **Open active research batch** wording described a promised action but only switched the tab. It now performs the complete expected action: changes to Portrait Review and scrolls to the active research batch.

The prior batch process treated every completed research task as **Ready for review**, even where the agent produced no `portrait_source` proposal. This was misleading. New and existing findings without a source proposal are now labeled **Evidence needed** and display a direct form handoff for an administrator to supply a verified image plus separate provenance URL.

The Portrait Review lists had two React key warnings during the audit. Both are corrected, and fresh rendering showed no new related console warning.

## What Is Informational Rather Than Actionable

The following elements are deliberately descriptive and should not be mistaken for publishing or automation controls:

| Element | Meaning |
|---|---|
| Election engine badge | Operational heartbeat state; it does not start polling or alter results. |
| Bulk portrait counts | Queue health and evidence availability; they do not approve images. |
| World refresh summary | Data Desk review context; it does not publish a world-election change. |
| Agent research package | Private evidence and recommendations; it does not write public reporting or election records. |
| Audience workspace | Deferred subscriber capability; it is not an operational audience-management tool. |

## Remaining Gaps and Recommendations

| Priority | Recommendation | Reason |
|---:|---|---|
| High | Add an **official source lead** field directly in every Evidence needed row. | The current form handoff works, but research can become materially faster when a reviewer pastes an official campaign, government, or Bioguide URL without leaving the finding. |
| High | Add a **Source packages only** filter and a count for visual-review-ready submissions. | This will make items that truly have an image-and-source package immediately distinguishable from research-only work. |
| Medium | Add due dates to the currently open Agent Desk tasks. | The Admin audit found a substantial open task queue without a consistent scheduling signal. |
| Medium | Turn Audience into an explicit “Not enabled” card with setup guidance, or hide the tab until subscriber functionality is enabled. | A placeholder workspace should not appear to be a nonfunctional tool. |
| Medium | Add an active-batch completion notification when the final queued portrait item finishes. | This would prevent the operator from repeatedly checking a running batch without a clear completion signal. |

## Verification Result

The full production build, TypeScript check, and **67 regression tests** passed after the repairs. The pending visual review card was confirmed in desktop and mobile layouts, with the candidate image, government source link, and visible Approve/Reject controls. No public portrait record was changed during this verification.
