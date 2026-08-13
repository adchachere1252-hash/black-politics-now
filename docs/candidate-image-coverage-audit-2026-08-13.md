# Candidate Image Coverage Audit — August 13, 2026

## Scope

This audit compared every named public Senate, House, Governor, and Black Representation profile against stored platform image fields and the original `election-map-2026` repository’s verified `allCandidatePhotos.json` map.

## Baseline

| Collection | Named records | Stored image fields | Original-repository photo-map matches | Deployable after resolver | Unresolved by either source |
|---|---:|---:|---:|---:|---:|
| Senate | 70 | 27 | 45 | 45 | 25 |
| House | 851 | 317 | 474 | 472 | 379 |
| Governor | 72 | 3 | 42 | 42 | 30 |
| Black Representation profiles | 105 | 67 | 61 | 81 | 24 |
| **Total** | **1,098** | **414** | **622** | **640** | **458** |

The counts include 95 pending-primary or otherwise unresolved `TBD` candidate slots: 14 Senate, 77 House, and 4 Governor. Those placeholders must not receive invented portraits. Among the remaining 1,003 named people, 640 (63.8%) now resolve to a stored or original-repository verified image; 363 named people still require source-and-verification work. Five database values that looked non-empty were invalid placeholders and were correctly excluded by the public resolver.

## Original Repository Asset Inventory

The original repository contains a 752-entry normalized candidate-photo map. Its June 25 photo audit recorded 786 checked records: 407 usable and 378 requiring an aspect-ratio recrop, with one error. It uses official Congress Bioguide portraits where available and project-hosted portraits for non-Congress candidates.

> The platform cannot accurately claim that every named candidate currently has a verified portrait. The repository provides a substantial, reusable fallback map, but 453 named current records have neither a stored platform photo nor a verified repository match. A staged source-and-verification pass is required for those people.

## Remediation Standard

The platform now applies the repository’s verified fallback map dynamically without overwriting editor-managed database fields. The 640 deployable URLs were checked at the source host; two slow source responses succeeded on a controlled 45-second retry. The interface should surface a transparent placeholder for unresolved or pending-primary records. New images should be added only after a legitimate official campaign, government, or licensed editorial source is verified; no generative portraits or identity substitutions are acceptable.
