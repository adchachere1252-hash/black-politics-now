# Candidate, Portrait, and Agent Editorial Workflow Review

**Prepared:** August 16, 2026  
**Scope:** Daily Brief downloads, candidate portrait operations, Portrait Review, Proposed Changes, and safe use of platform agents.

## Verified Workflow

| Workflow stage | Current behavior | Public-record effect |
|---|---|---|
| Daily Brief download | The homepage and Podcast page expose separate **Andrew** and **Jenny** full-episode download links when each verified file is available. | None; the files are downloaded locally by the listener. |
| Candidate operations | The protected Candidates workspace lists all 1,098 tracked candidates and shows photo-mapped, pending-review, or evidence-needed status. A row can open a pending review, preselect the submission form, or request private AI portrait research. | None from the workspace itself. |
| AI portrait research | Individual or batch research creates private findings only. A source proposal must contain an image URL and a separate provenance URL before it may create a visual review package. | None. |
| Visual portrait review | A reviewer sees the image, source, target candidate, approval action, and rejection action. A rejection now requires a reason. | Approval writes only the reviewed image URL to one exact matched public field. Rejection changes nothing public. |
| Proposed Changes research | A completed agent task can produce a private evidence-backed change set. The page now gives a task-level **Run fresh research** action when proposals exist and directs empty queues to Agent Desk. | None. Approving a proposal remains a recorded editorial decision, not an automatic public change. |

## Current Bottleneck

The 167 evidence-needed portrait targets are not approval-ready because they lack an independently verifiable image URL and separate provenance source. The workflow is operating correctly: it does not allow an agent’s text-only research result to become a public portrait. The candidate row’s **Ask AI to research** control and the Portrait Review **Add image and source evidence** handoff now make the next required action explicit.

## Agent Capacity Assessment

The platform already uses agents in several high-value, bounded roles: autonomous Daily Brief preparation; daily source preflight; private candidate-photo research; Agent Desk change-set drafting; election-day research; source-backed World Elections review; and portrait batch tracking. The correct expansion is not allowing agents to publish autonomously. The next safe increase in capacity is a **two-stage evidence workflow**: an agent finds official-source leads, then creates a private visual package only when it has a direct image and an independent provenance URL. An editor remains responsible for identity, rights, and final approval.

| Priority | Recommendation | Why it matters |
|---|---|---|
| High | Add an **official-source lead** queue for each evidence-needed candidate, with agency, campaign, and congressional source types. | Converts the 167 gaps into bounded, reviewable work rather than unstructured research. |
| High | Add an Agent Desk due date and owner for the highest-visibility portrait gaps. | The existing research queue is large; prioritization prevents the work from becoming stale. |
| Medium | Add a daily private agent summary: new eligible portrait packages, blocked evidence requests, and unresolved election records. | Gives the editor a concise decision queue without changing public data. |
| Medium | Keep public mutations review-only for portraits, election results, and editorial record changes. | Preserves the site’s evidence and editorial standards. |

## Verification Results

The public homepage, Podcast page, Candidates workspace, Portrait Review, and Proposed Changes workspace were visually reviewed after the upgrade. TypeScript is clean and the regression suite passes **23 test files / 76 tests**. The controlled actions are guarded by admin-only server procedures and the source-backed portrait approval path remains separate from agent research.
