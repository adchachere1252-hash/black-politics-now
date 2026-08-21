# Candidate Photo Workflow and Research Repair

**Release date:** August 21, 2026  
**Decision:** The portrait workflow is now a clear, source-backed four-step process. The research action no longer reports an ambiguous queued/ready state when it has no reviewable portrait evidence, and it cannot expose a raw model error to an administrator.

## Practical workflow

| Step | Administrator action | System behavior |
|---|---|---|
| 1. Choose | Search by name, state, district, or office, then select the candidate | The directory supports both missing-photo targets and replacement research for candidates with current photos. |
| 2. Check evidence | Select **Check available evidence** | The private research task returns a reviewable source package only when a direct, cited image proposal exists. Otherwise it presents an actionable evidence-needed or temporary-unavailability message. |
| 3. Submit | Use the source lead, add a direct image URL or upload a JPG/PNG/WEBP/GIF up to 5 MB, and supply the provenance page | The package is saved to the Approve / Deny queue; no public candidate record changes. |
| 4. Review | Open image and provenance links, then approve or deny | Approval alone applies the image publicly; denial requires a reason; review history is retained. |

## Confirmed research defect and repair

The previous button executed a private task but showed only a generic success receipt. It did not show its task outcome or proposal package inside Portrait Review. In addition, existing tasks with no `portrait_source` proposal could remain marked `ready_for_review`, which falsely implied there was an image to inspect. Those stale records were corrected: the current false-ready count is **zero**.

New research now permits a valid replacement target from the broader candidate directory, returns a direct proposal to the selected form when one exists, and otherwise reports a blocked evidence-needed state. If the model service cannot respond, the workflow now returns a plain language recovery message and directs the administrator to official campaign, government, or verified provenance sources; it does not create a submission, apply a portrait, or misreport completion.

## End-to-end evidence and current boundary

The E2E verifier ran a real private research request for Ace Parsi, a missing House portrait target. The model service returned an availability error during the check; the repaired workflow converted it to an actionable `blocked` task. The verifier confirmed zero review submissions were created, no public image was applied, and a human source-review step remained required. This is the correct safe behavior while the model service is unavailable, but it means a new AI-generated evidence package could not be produced during this run.

Focused tests, TypeScript, full regression, and production build passed. Owner-session visual acceptance remains: open **Admin → Portraits**, choose a candidate, use **Check available evidence**, and verify that the selected card either displays a reviewable evidence package or the specific actionable recovery message.
