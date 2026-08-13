# Candidate Image Coverage Audit — August 13, 2026

## Scope

This audit compared every named public Senate, House, Governor, and Black Representation profile against stored platform image fields and the original `election-map-2026` repository’s verified `allCandidatePhotos.json` map.

## Final verified coverage

| Collection | Public candidate/profile slots | Stored image fields | Verified fallback-map matches | Deployable after live resolver | Still unresolved |
|---|---:|---:|---:|---:|---:|
| Senate | 70 | 27 | 56 | 58 | 12 |
| House | 851 | 317 | 707 | 708 | 143 |
| Governor | 72 | 3 | 60 | 60 | 12 |
| Black Representation | 105 | 67 | 91 | 104 | 1 |
| **Total** | **1,098** | **414** | **914** | **930** | **168** |

The unresolved set includes 95 pending-primary or otherwise unresolved `TBD` candidate slots: 14 Senate, 77 House, and 4 Governor. Those placeholders must not receive invented portraits. The live resolver now returns a legitimate stored, repository-backed, or official-source portrait for **930 public records**. Of the 1,003 named people, at least **930 (92.7%)** now have a usable public portrait; the remaining review list contains 75 records, including 73 named people and two abbreviated or incomplete candidate labels. Five database values that looked non-empty were invalid placeholders and were correctly excluded by the public resolver.

## Original Repository Asset Inventory

The original repository contains a 752-entry normalized candidate-photo map. Its June 25 photo audit recorded 786 checked records: 407 usable and 378 requiring an aspect-ratio recrop, with one error. It uses official Congress Bioguide portraits where available and project-hosted portraits for non-Congress candidates.

> The platform still cannot accurately claim that every named candidate has a verified portrait. It can accurately claim that every currently usable portrait has passed a stored, original-repository, or direct official-source validation path. The remaining 75-record review list stays transparent rather than using substitutes.

## Remediation Standard

The platform applies the repository fallback map dynamically without overwriting editor-managed database fields. Stored and original-repository portrait URLs were checked at their source hosts, with slow legitimate responses given a controlled retry. Three official-source recovery passes validated and integrated **272** conflict-free candidate records from campaign, government, legislative, organization, and licensed-editorial source pages; six district-specific Black Representation overrides retain separate provenance records. The interface surfaces a transparent placeholder for unresolved or pending-primary records. New images should be added only after a legitimate official campaign, government, or licensed editorial source is verified; no generative portraits or identity substitutions are acceptable.
