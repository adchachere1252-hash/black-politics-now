# Historical Atlas Continuous Reliability Review

**Prepared:** August 20, 2026 (EDT)  
**Decision:** The fresh verification passed. Continuous monitoring should combine deterministic checks, limited AI-assisted review, and explicit human approval for historical or geometry changes.

## Fresh deployed verification

| Check | Fresh result | Meaning |
|---|---|---|
| Live UCLA frame and overlay contract | **Passed** — 31 of 31 frames; 50 named states, valid polygon geometry, unique frame identifiers, UCLA source metadata, and usable Voteview overlay records. | The live source payloads still satisfy the Atlas contract. |
| Live playback journey | **Passed** — visible UCLA source tag; standard advance; Pause held the 90th Congress; fast mode reached and stopped at the 119th; restart returned to the 89th. | The reader-facing playback controls are working on the deployed site. |
| Live district selection | **Passed** — a real browser pointer sequence opened and focused the source-linked Alabama 1st district detail. | Map selection is not merely a code-level contract; it worked in the deployed public interface. |
| Protected Admin playback check | **Passed** — 31 ready frames, 31 checked Congresses, readiness/pause/sequence checks, durable passed audit, and latest-result refetch. | The Admin action is a real verification workflow, not decorative UI. |
| Regression and production checks | **Passed** — 49 test files / 155 tests and production build. | Current source code and release bundle pass their quality gates. |

The known source-boundary exception remains transparent: Voteview’s 90th Congress export does not have a key for New York’s 18th district. The UCLA geometry still renders; the Atlas shows no verified member rather than inventing one.[1] [2]

## Recommended reliability model

The correct goal is not “let AI change the map.” It is a **three-layer safety system** that detects problems early, preserves evidence, and requires a human to approve any historical interpretation or boundary change.

| Layer | Frequency | Work | Automated outcome |
|---|---:|---|---|
| **Atlas Sentinel** | Daily | Fetch all 31 public frames and overlays; verify 50 states, identifiers, geometry, source tags, roster typing, playback health, and response-time threshold. | Stores a durable health record; alerts the owner and marks Atlas Operations as needing attention if any gate fails. |
| **Atlas Journey Reviewer** | Weekly | A browser-capable AI agent performs the reader journey: load a historical/boundary/party/member frame, run playback, click a district, enter comparison, inspect source labels, and compare screenshots against expected landmarks. | Produces an evidence package and screenshots; it may flag but never alter public data. |
| **Cartographic Change Review** | Only when a source changes | An AI agent compares the candidate source revision with the currently approved frame, summarizes the source documentation, counts feature/key changes, and prepares a review package. | A human approves or rejects. No geometry, party, roster, or editorial note is published automatically. |

> **Non-negotiable boundary:** AI may detect, compare, document, and triage. It must not manufacture district lines, infer a party/member record, publish an historical interpretation, or overwrite UCLA/Census/Voteview source data.

## Operating choices

| Approach | Tradeoffs | Ongoing cost | Setup complexity |
|---|---|---|---|
| **Manual checks plus the existing Admin button** | Lowest complexity, but relies on someone remembering to run it and does not detect overnight source failures. | Lowest | Low |
| **Daily deterministic Sentinel plus a weekly AI journey review — recommended** | Gives dependable daily source/control checks; reserves AI judgment for visual and usability anomalies. | Low daily operating cost; weekly AI review uses task capacity. | Moderate |
| **AI agent checks every day** | More narrative review, but repeats deterministic work at higher cost and creates more false-positive triage. | Highest | Moderate |

## Implementation recommendation

Start with the recommended option. The daily Sentinel should run as a short background web job, record results in the Atlas Operations audit log, and alert only when a threshold actually fails. It should not use an AI model; all daily assertions are deterministic.

Add the weekly AI Journey Reviewer separately. It should receive a fixed checklist and submit a read-only evidence package: tested URL, screenshots, control outcomes, accessibility observations, raw source health result, and a severity level. A failed or uncertain result creates an Admin review item; it does not edit the Atlas.

Finally, add an **Atlas Change Freeze**: if any daily source contract fails, show the public map only with its last validated frame, place an Admin “needs review” notice, and block any editorial-note approval tied to the affected Congress until the issue is resolved. This is safer than taking the Atlas offline or silently showing suspect geometry.

## Practical admin additions

The existing Atlas Operations workspace is the right home. Add three compact elements: a “last successful Sentinel” timestamp, a green/amber/red health strip with the failed contract name, and a weekly agent-review inbox with evidence links. The existing **Run playback check** remains the manual immediate verification tool.

## References

[1]: https://cdmaps.polisci.ucla.edu/ "U.S. Congressional District Shapefiles — UCLA Congressional District Maps"

[2]: https://voteview.com/data "Voteview Data"
