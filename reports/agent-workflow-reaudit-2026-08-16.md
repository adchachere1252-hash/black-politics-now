# Agent Workflow Re-Audit: Candidate, Portrait, Podcast, and Proposed Changes

**Prepared:** August 16, 2026  
**Scope:** The real usability of candidate portrait actions, Portrait Review, Daily Brief operations, Proposed Changes research, and the bounded agent system.

## Direct answer

The platform has a **portrait research agent** and a **Daily Brief AI production workflow**, but they are not the same type of capability. Portrait research is a bounded, private agent workflow that can create evidence packages for a specific candidate; it cannot add a public image by itself. The Daily Brief uses an automated language-model production pipeline, source preflight, paired voice generation, and guarded recovery; it is an autonomous production system, not yet an independent editorial-review agent.

The re-audit found two real usability gaps. Candidate cards did not provide an obvious command center for photo decisions, and Proposed Changes had no immediately visible research control when the proposal queue was empty. Both gaps have been corrected.

## Current workflow status

| Workflow | Verified state | What the user can do now | Boundary that remains intentional |
|---|---|---|---|
| Candidate photo work | Complete entry path | Open **Portrait actions** for any candidate; review the current image, launch private AI research, add evidence, open review, or follow official-source leads | A candidate image is never published from the Candidates screen |
| Portrait research agent | Active and bounded | Run research for an evidence-needed candidate; inspect the private source package; submit a sourced visual review | The agent cannot invent a photo URL, approve, or publish a portrait |
| Portrait Review | Operational, with evidence states | Separate queued, working, evidence-needed, source-package, pending visual-review, approved, and rejected items; approve/reject a pending visual submission | Approval requires a real direct image URL and provenance link |
| Proposed Changes | Direct research entry restored | Use **Run research now** even when no proposal is present; then open Agent Desk, approve a bounded task, and return for evidence-backed proposals | The first run creates recommendations; a proposal appears only after a bounded task produces one |
| Daily Brief | Autonomous production system | Review dual full-episode health, source preflight, segment diagnostics, and recovery status in Podcast Ops | It does not yet have a separate agent that critiques an already-published script |

## Portrait workflow

1. Start from **Admin → Candidates** and select **Portrait actions** on the exact candidate.
2. Review the current image, existing status, and official discovery leads.
3. Choose **Ask AI to research** for a private source-cited search, or **Add image evidence** when an official image URL and provenance page are already known.
4. In **Portrait Review**, distinguish research-only items from a source package and from a pending visual review.
5. For a pending visual review, inspect candidate identity, image, and provenance. **Approve** writes the reviewed image to the exact record; **Reject** changes no public record and retains the audit trail.

> Research is not approval. A source package is not publication. The visual review and its explicit decision remain the public-record boundary.

## Podcast workflow

The Daily Brief automation already operates at a high baseline: source preflight, LLM script generation, 15-part structural validation, Andrew/Jenny paired audio, two full-episode mixes, a durable morning snapshot, and a guarded repair path. This is more robust than a generic chat agent because it runs from scheduled source data and cannot release an incomplete episode.

The high-value next agent capability is a **private Daily Brief Editorial QA agent**. It would run after generation, before release, and return a compact review package assessing topic duplication, abrupt transitions, source concentration, timing outliers, and greeting/closing continuity. It should be advisory only: a failed or unusual audit would flag Admin for review rather than rewrite or publish by itself.

## Recommendations

1. Add the private Daily Brief Editorial QA agent as a pre-release advisory lane. It should return a clear scorecard and recommendations, not automatically alter scripts.
2. Add a **source-package-only** Portrait Review filter so human reviewers can concentrate on agent findings that are actually ready for an image decision.
3. Add candidate-image audit history on each selected candidate so an editor can see prior research attempts, rejected source packages, and approved portraits in one view.
4. Add an Agent Desk workload view that groups the 68 active tasks and 122 pending recommendations by owner, due date, and decision stage.

## References

[1]: https://blkpolnow-nztxnshf.manus.space/admin "Black Politics Now Admin Dashboard"
[2]: https://blkpolnow-nztxnshf.manus.space/podcast "Black Politics Now Daily Intelligence Brief"
