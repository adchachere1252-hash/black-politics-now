# Operational Readiness Verification — August 16, 2026

## Homepage Refresh and Admin Visibility

The homepage now refreshes approved election and Black Representation records every 60 seconds while a visitor keeps it open. News, Daily Brief, and Atlas content refresh every five minutes. This browser-side behavior is paired with the existing cloud automation: news refreshes every four hours, the election guard runs every five minutes, and active election polling runs every 60 seconds only during an active election date.

The Admin Overview includes a **Homepage refresh health** panel showing the visitor refresh cadence, the approved-record boundary, and the latest election heartbeat mode and source-health value.

## All-Candidates Workspace

The Admin **Candidates** tab provides a single protected view of all 1,098 tracked Senate, House, Governor, and Black Representation candidate records. It supports category filters and search by candidate, state, district, or party. It reports portrait state from the existing provenance workflow:

| State | Current count | Meaning |
|---|---:|---|
| Photo mapped | 931 | Stored or repository-resolved image is available to the candidate record. |
| Pending review | 0 | A source-backed visual portrait package awaits a human decision. |
| Evidence needed | 167 | No approved source-and-image package is currently available. |

The workspace does not publish an image. Evidence-needed and pending-review cards take the administrator to Portrait Review, where the existing source-backed approval workflow remains the only public-mutation path.

## Homepage Globe

The homepage mini globe used a satellite texture with near-black land pixels across parts of Africa. The country TopoJSON surface now renders an intentionally restrained normal-blended geographic overlay above that texture. Country geometry, borders, rotation, and World Elections data were not changed. Desktop and mobile screenshots confirm the Africa region remains visibly geographic rather than becoming a black void.

## Daily Intelligence Brief — Andrew and Jenny

The latest Daily Brief, dated 2026-08-16, passed its complete publication gate: 15 stored segments, 15 scripts, 15 Andrew assets, 15 Jenny assets, a verified full Andrew episode, and `verificationStatus = passed`. The two current voice URLs for the AI Trends segment returned HTTP 200. The seven-day audit shows fully verified dual voice coverage for August 12–16; August 10–11 remain intentionally held historical warning records rather than public releases.

The cloud guard explicitly requires at least 15 Andrew and 15 Jenny assets plus a verified full episode before it treats a date as published. It runs source preflight at 5:15 and 5:40 AM Eastern, primary guarded generation at 6:00 AM, and recovery checks at 7:30 and 8:30 AM. If either voice is incomplete, the episode remains held and a later locked recovery run resumes it; no partial episode is published.

## Validation

TypeScript passed. The project test suite passed with 21 test files and 72 tests, including the new all-candidate view-model coverage. Desktop and mobile screenshots confirm the preserved stacked mobile layout, Candidate workspace, Admin refresh health panel, Podcast dual-voice panel, and homepage globe presentation.
