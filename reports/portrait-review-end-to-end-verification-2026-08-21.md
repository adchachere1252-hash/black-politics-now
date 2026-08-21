# Portrait Review End-to-End Verification

**Verification date:** August 21, 2026  
**Decision:** The Portrait Review workflow is now complete from candidate discovery through protected research routing, sourced image submission or managed upload, human approval/denial, public application, replacement, and review history. The verification used real existing records and did not create, approve, reject, or publish a fabricated portrait.

## User workflow

| Stage | Admin action | Persisted outcome and guard |
|---|---|---|
| Find | Search candidate name, state, district, or office; optionally include candidates who already have a photo | The directory exposes **1,107** valid public portrait slots and contains all **181** missing-photo slots |
| Research | Select a candidate and choose **Ask AI to research official sources** | The existing protected candidate-specific research task is queued; it returns evidence for review and cannot publish an image automatically |
| Submit | Use an official-source lead, a direct secure image URL, or a JPG/PNG/WEBP/GIF upload (up to 5 MB), then add a secure provenance page | A pending source-backed submission is saved only for the exact mapped candidate slot; the Admin receives a green persisted-save receipt |
| Review | Inspect the image and source, then approve or deny | Denial requires a reason. A broken selected-image preview blocks approval and directs the reviewer to deny with a reason or replace the package |
| Apply | Approve the proposal | The public candidate image field updates only on approval, and the submission retains image, provenance source, reviewer, timestamp, note, and applied URL |
| Replace | Include candidates with current photos and submit a new sourced image | A subsequent approved image replaces the public photo through the same review gate |

## Non-destructive end-to-end evidence

The verifier confirmed that all 181 missing-photo targets appear in the 1,107-slot management directory; non-admin access to the review workspace and research route is denied; a mismatched candidate submission is rejected without adding a queue record; and a denial without a reason leaves the pending package unchanged. It then verified a real approved Governor submission: **Alan Wilson**, Governor target #30, submission #30001, has a retained source and an applied URL that exactly matches the public Governor record.

The current queue contains **7** submissions: **6 approved**, **1 pending**, and **0 rejected**. The pending Kelly Thompson package points to a Ballotpedia page rather than a direct image asset. It was not altered during verification. The repaired preview guard will block its approval if its visual asset fails to load, so an Admin can deny it with a reason or replace it with a direct image package.

## Validation

Focused portrait workflow tests passed. The full project suite passed **58 files / 182 tests**, TypeScript passed, and the production build passed. The remaining visual acceptance step is for the owner to sign in, open **Admin → Portraits**, search a known candidate, and view the new receipt and direct research action without making a review decision.
