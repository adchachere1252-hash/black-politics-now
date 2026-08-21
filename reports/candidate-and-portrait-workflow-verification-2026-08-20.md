# Candidate and Portrait Workflow Verification

**Verification date:** August 20, 2026 (EDT)  
**Decision:** The candidate/race creation contract and portrait save/review/replacement workflow passed the protected, storage, persistence, and public-application checks. One meaningful gap was found and repaired: uploaded portrait files initially produced managed storage URLs that the review-submission gate rejected. The gate now accepts only the managed candidate-portrait storage prefix in addition to secure external image URLs.

## Candidate and race creation

The Admin Candidate Changes workspace provides **Add race** forms for Senate, House, and Governor contests. Each form requires both candidates, party fields, a source label and URL, an editorial note, and jurisdiction information; House creation additionally requires a district. The protected persistence helpers write public candidate fields and an immutable initial candidate-log audit entry, but do not accept vote totals, calls, reporting percentages, or certified results in their create inputs.

Black Representation creation is separate and appropriately stricter. The profile and contest forms require source packages and write `black_representation_addition_audit` records. The public map reads the created profile and contest only after the protected save succeeds. These contracts are covered by the existing race/Black Representation creation tests and remained green in the final full suite.

## Portrait upload, review, replacement, and public application

The Portrait Source Review workspace now supports both of the required methods: a direct HTTPS image URL or an uploaded JPG, PNG, WEBP, or GIF up to 5 MB. The upload route is Admin-only, verifies image magic bytes rather than trusting the file extension, saves the file to managed storage under `/manus-storage/candidate-portraits/`, and returns a controlled storage URL.

The uploaded-file save path was exercised with a non-public 1×1 PNG verification artifact. Storage returned `/manus-storage/candidate-portraits/verification-admin/portrait_48011944.png`; the application served it through a managed 307 signed redirect. No candidate, review submission, or public portrait was changed during that storage verification.

Portrait review now offers **Include candidates with current images**, which exposes every valid candidate photo slot for a source-reviewed replacement. The review card shows the current public image; after a source-backed upload or URL package is approved, the corresponding Senate, House, Governor, or Black Representation photo field is updated. The old image is no longer referenced by the public record. Approval remains the only public-photo mutation path; submitted files do not appear publicly until an Admin approves them.

| Gate | Result |
|---|---|
| Admin-only upload and replacement-target queries | Passed |
| JPG/PNG/WEBP/GIF type and file-signature checks | Passed |
| 5 MB upload ceiling | Passed |
| Managed portrait storage URL returned and served | Passed |
| External HTTPS source requirement retained | Passed |
| Managed storage URL accepted after upload repair | Passed |
| Approval updates public Senate/House/Governor/Black Representation photo fields | Protected contract passed |
| Rejection requires a reason; repeat review is blocked | Passed |

## Validation and acceptance boundary

Strict TypeScript passed. Focused portrait upload/replacement and Admin authorization tests passed, as did the complete suite of **55 test files / 170 tests** and the production build. The sandbox browser did not retain the owner’s Admin session, so final visual acceptance of the protected screen needs one owner-side click. This does not affect the verified protected procedures, storage upload, database contract, or public-photo application path.

> **Owner acceptance:** Open **Admin → Portrait Source Review**, check **Include candidates with current images** if replacing a photo, choose a candidate, upload the file, add the official provenance page, click **Send image to Approve / Deny**, then approve the preview. The public candidate image will update on its next ordinary data refresh.
