# Repository-to-Platform Coverage Audit

## Scope and conclusion

This audit compares the current Black Politics Now platform with the two source repositories selected for the project: the **2026 Election Center** and the **Daily Intelligence Brief**. The dashboard and public platform now use the public-facing election, podcast, map, World Elections, Historical Atlas, photo, and audio data relevant to readers. The dashboard preview also now uses the original Election Center globe approach—TopoJSON country geometry projected on a rotating Three.js globe—rather than a generic decorative sphere. [1] [2]

| Source area | Source-repository scope | Current Black Politics Now coverage | Audit result |
| --- | --- | --- | --- |
| Congressional election data | Senate, House, governor, referendum, redistricting, and live-result data | 35 Senate races, 435 House races, 36 governor races, 148 referendums, and 16 redistricting records are in the unified database and public map workflows | Covered |
| Race presentation | AP-style ratings, interactive state map, details, tickers, scoreboards, candidates, and photo support | The Election Center and homepage dashboard expose the corresponding map, tab-aware state popups, rating colors, ticker, scores, candidates, and sourced image fields | Covered |
| World Elections | Country records, globe, search, filters, and result/status presentation | 48 World Elections records, dedicated `/world` explorer, and the repository-derived country-boundary globe treatment in the homepage preview | Covered |
| Historical and representation context | Redistricting context, Black representation, John Lewis legacy, and historical feature direction | Dedicated `/atlas` and Black Representation data views; the dashboard preview includes the user-provided Selma historical image and a restrained John Lewis legacy element | Covered |
| Podcast catalog | Episodes, segments, scripts, dual voices, full audio, archive, RSS, and player controls | 97 episodes, 1,373 segments, Andrew/Jenny selection, script reader, archive, RSS, sticky player, and unified search are available | Covered, with one active audio backfill exception |
| Podcast automation | Research, script generation, TTS, full-episode assembly, CDN publication, and scheduled execution | The cloud workflow has the same staged generation and audio pipeline. It now fails safely instead of publishing placeholder audio, and the public UI prevents invalid play attempts | Covered operationally; full-length script generation must be available before the pending audio run can backfill |
| Candidate imagery | Candidate-photo lookup and validation | Working race/profile photo URLs were imported into the unified race and representation views rather than maintained as a separate legacy table | Covered in public presentation |

## Source data intentionally not promoted as reader-facing dashboard content

The source repositories also contain internal or deferred data types. The platform does not discard the public information represented by those modules; instead, it avoids surfacing operational tables that would not improve the reader dashboard.

| Source data or capability | Current handling | Reason |
| --- | --- | --- |
| FEC fundraising rows | Not exposed as a public dashboard module | The unified public dashboard is designed around live race status and reporting; fundraising has no approved reader-facing workflow yet |
| Pinned key-race table | Covered by dynamic ticker, scorecards, and competitive race views rather than a separate legacy pin set | The live map and ticker avoid duplicating a static editorial selection |
| Standalone senator-bio table | Candidate and officeholder details are represented within race and profile records | Avoids duplicate identity records in the public experience |
| Podcast play analytics and private notes | Present in unified schema where needed but not displayed publicly | Internal analytics and editorial notes should not appear in the reader dashboard |
| Subscriber and notification flows | Deferred by owner decision | These are explicitly held for a later phase |

## Active exception

Several recent Daily Intelligence Brief records remain without verified full-length audio because the content-generation service rejected the backfill request. The platform now marks those items as **Audio preparation in progress** and preserves their scripts instead of presenting a misleading short or broken episode. This remains the only reader-facing repository-coverage exception being tracked.

## References

[1] [2026 Election Center source repository](https://github.com/adchachere1252-hash/election-map-2026)

[2] [Daily Intelligence Brief source repository](https://github.com/adchachere1252-hash/daily-podcast)
