# Daily Intelligence Brief Spoken Structure Repair

**Completed:** August 19, 2026 (EDT)

## Root cause

The public player correctly played each full Andrew or Jenny file as a continuous asset. The defect was in authorship and assembly: the generator did not require every topic script to introduce itself, and the audio assembler concatenated all segments with no deliberate boundary. The prior quality score measured greeting placement and count but not spoken orientation within the full mix.

## Durable editorial standard

Every new full episode now follows this spoken structure:

| Order | Required audible content |
| --- | --- |
| Opening | A detailed greeting that identifies the Daily Intelligence Brief, previews the major subject areas, and explains that each topic will be introduced. |
| First editorial segment | “We begin with *topic*,” followed by a concise explanation of why the verified reporting matters. |
| Every following editorial segment | “Next, *topic*,” followed by a concise explanation of why the verified reporting matters. |
| Full-mix boundary | A 0.65-second section pause between each ordered segment. |
| Closing | A spoken end-of-brief signoff after the final editorial section. |

The generator applies these leads to all future source-constrained scripts. The audio pipeline writes versioned `structured-v1` full-episode assets so existing CDN caching cannot retain a prior uninterrupted file. The Daily Brief benchmark now holds an otherwise complete post-baseline episode if its opening is too thin or any editorial script lacks a spoken topic introduction.

## Current episode verification

The August 19, 2026 release was repaired with a reversible script backup before regeneration. It now has **15 segments**, **13 of 13 editorial spoken leads**, a detailed greeting, passed verification, and new Andrew/Jenny versioned full-episode URLs. The measured complete full-mix durations are **52:04 Andrew** and **51:16 Jenny**, reflecting natural voice pacing plus section boundaries; both are active public assets.

No source links, article facts, or unsourced claims were added in the repair. The generator continues to use the frozen 13-topic source package and dual-full-voice publication gate.
