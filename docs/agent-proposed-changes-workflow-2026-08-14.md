# Agent Desk Proposed Changes Workflow

## Purpose

The protected **Admin Dashboard → Proposed Changes** page is the final human-review surface for work completed by the Research Desk agent. It turns an approved, bounded agent task into a set of private change proposals rather than public changes.

| Stage | Agent responsibility | Administrator responsibility |
|---|---|---|
| Approve a recommendation as an agent task | None; the agent cannot create its own tasks. | Define scope, source requirements, owner, and due date. |
| Complete the task | Gather platform context, write a cited work package, and prepare up to three structured proposals. | Review the evidence and proposed target. |
| Proposed Changes review | Provide a target, current/before value, proposed value, rationale, and source records. | Approve, reject, or request revision with an optional note. |
| Apply a decision | None. | A separate, visible editorial operation is required for any future public update. |

## Supported proposal types

The workflow accepts three proposal types: an **article-to-record link**, a **data-correction draft**, and an **editorial-copy draft**. Each proposal is stored as a review artifact with a private status of `pending_review`, `approved`, `rejected`, or `revision_requested`.

> An approval records the administrator’s editorial decision only. It does **not** publish WordPress content, create a public story link, alter an election record, send a reader alert, or change any public World Elections result.

## First live change set

The already approved Alabama redistricting verification task was re-run through the structured path on August 14, 2026. It returned three pending private proposals: two data-correction drafts and one editorial-copy draft. They are now visible under **Admin Dashboard → Proposed Changes** with their evidence, before/after displays, and approval controls.

## Verification

Desktop verification confirmed that each proposed change displays a type label, target, before value, proposed value, rationale, linked evidence, optional reviewer note, and **Approve**, **Request revision**, and **Reject** controls. Mobile verification confirmed the review cards stack into a single-column protected workflow. The regression suite passed **28 tests**, including a public-access denial test for proposal retrieval and review decisions.
