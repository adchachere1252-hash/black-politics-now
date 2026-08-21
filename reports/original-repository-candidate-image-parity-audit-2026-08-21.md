# Original Repository Candidate Image Parity Audit

**Audit date:** August 21, 2026  
**Scope:** Read-only comparison of `election-map-2026` candidate-image assets and the current Black Politics Now fallback resolver, plus non-destructive portrait workflow and public Election Center checks.

## Finding: the original repository image map was ported

The original compiled map, `election-map-2026/server/allCandidatePhotos.json`, and the current platform fallback map, `black-politics-now/server/repositoryCandidatePhotos.json`, are **byte-identical**. Both have SHA-256:

> `4e66d9865e62ffeb2c8de5fbc2b0dd27dd42539b6a980b19564de68cdd11a1e5`

The current server resolver uses this repository map only as a display fallback. It never overwrites an editor-managed database photo. Current verified research maps provide a further 272 candidate mappings and six Black Representation-specific overrides.

## Current coverage

| Surface | Named non-TBD slots | Stored photo fields | Resolved through a current fallback | Deployable portrait slots | Remaining unresolved |
|---|---:|---:|---:|---:|---:|
| Senate | 63 | 27 | 58 | 59 | 4 |
| House | 796 | 316 | 701 | 706 | 90 |
| Governor | 69 | 4 | 57 | 58 | 11 |
| Black Representation | 113 | 67 | 95 | 107 | 6 |
| **Total** | **1,041** | **414** | **911** | **930** | **111** |

The original repository therefore did include a substantial candidate-photo map, and it is already present in the current platform. It did not contain every current candidate: 111 current non-TBD slots remain unresolved after applying the full ported map and later research maps. The prior repository’s own June 25 audit likewise reported incomplete quality coverage, with 407 images marked acceptable, 378 needing recrop, and one error among 786 checked assets.

## Integrity and public checks

The Portrait Review E2E verifier passed. It confirmed 183 missing-photo targets appear within the 1,108-target management directory, rejects non-Admin access and mismatched submissions, preserves a pending review on invalid denial, and verified the approved Alan Wilson submission matches the public Governor record. No candidate, portrait, or review decision was created or modified.

The original-map URL checker reached 645 of 653 resolved current candidate image URLs in its first concurrent pass. Each of the eight network/time-out findings subsequently returned HTTP 200 when retried individually, so this audit found **no confirmed currently unreachable mapped image**. The public Election Center loaded successfully after its client bundle resolved, including current race data and the existing results ticker.

## Safe next step

Do not restart portrait work from zero. Start with the 111 current unresolved non-TBD targets in **Admin → Portraits**, use candidate search and source research, and submit only a direct image with a provenance URL for review. The existing approved/reviewed photos and original repository fallback map remain intact.
