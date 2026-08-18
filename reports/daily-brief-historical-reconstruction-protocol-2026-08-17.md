# Daily Intelligence Brief Historical Reconstruction Protocol

**Scope:** July 28–August 17, 2026  
**Purpose:** Replace only those post–July 27 archive records that can meet the current 100-point Daily Intelligence Brief standard using source material appropriate to the episode’s original date.

> This is a **dated historical reconstruction**, not a retrospective rewrite using today’s news. A date is held if the source package, script, or audio verification cannot meet the same gate used for a new release.

## Preservation and Rollback

Before reconstruction began, the cloud automation host created a complete snapshot of the 21 target episode rows, 321 segment rows, and existing preflight rows. The snapshot is retained at `data/archive-snapshots/daily-brief-2026-07-28-to-2026-08-17-before-reconstruction.json` with SHA-256 digest `800e1765ad3be307bb54a756afab8bb5eb34bffffb712055efe2f485fe545c32`.

The original July 23, July 24, and July 27 repository baseline is outside this scope. It remains metadata- and URL-identical to the original static archive and is not regenerated.

## Reconstruction Gate

| Gate | Requirement |
|---|---|
| Date fidelity | Every source must be published on the episode date or within the preceding seven days. |
| Source quality | Each required topic needs at least two recognized, trusted sources; social posts, Wikipedia, unknown aggregators, and opinion-only sources are excluded. |
| Required coverage | The 13 editorial topics must pass. Monday also requires Weekend Brief evidence; Friday also requires Week in Review evidence. |
| Script integrity | Greeting first, closing last, 13 or more editorial segments, unique keys, and no unsupported scripted claims. |
| Audio integrity | Every Andrew/Jenny segment asset and both continuous full mixes must verify before an episode is released. |
| Duration integrity | Displayed episode duration must reconcile with the segment durations after source markers are excluded from audible-word checks. |
| Publication result | Only a 100-point result is marked passed. A blocked date remains an explicit archive integrity hold. |

## Controlled Execution

The historical assessor evaluates all dates without changing episode records. Only dates classified as eligible can enter the sequential reconstruction runner. That runner performs the dated preflight first, then replaces one episode at a time with the existing guarded generator and audio verifier. A source failure leaves the existing archive record intact.

The daily production workflow remains separate: it continues to use current source preflight, the 6:00 AM guarded publication, 6:30 AM missed-gate alert, recovery checks, and the protected QA Scorecard. The historical process cannot loosen or bypass any of those gates.
