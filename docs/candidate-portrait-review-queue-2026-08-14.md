# Candidate Portrait Submission Review Queue

**Verified:** August 14, 2026

The protected **Portrait Review** workspace now presents **168 current candidate-photo gaps** across Senate, House, Governor, and Black Representation records. It is available only inside the role-gated Admin Dashboard.

| Stage | Required control | Public-record effect |
|---|---|---|
| Submit | Select an exact current gap, provide HTTPS portrait and provenance URLs, classify the source, and record an optional context note. | None. The submission is private and pending. |
| Review | An administrator opens both URLs, records a decision, and must provide a reason when rejecting. | None when rejected. |
| Approve | The interface requires an explicit confirmation. The service rechecks the exact candidate name and record slot before applying the reviewed URL. | Only the matched target photo field is updated. |

> No portrait is fabricated, imported from an unverified source, or made public automatically. A queue entry retains its submitter, reviewer, source URL, decision note, review timestamp, and applied URL for auditability.

The initial queue intentionally contains no seeded submissions or decisions. This preserves the distinction between verified public images already in the platform and future editor-supplied evidence awaiting human review.

The workspace was visually verified at desktop and 390-pixel mobile widths. At the mobile breakpoint, the form retains every required provenance field in a single-column flow, and the pending-review and recent-decision panels remain legible without horizontal clipping.
