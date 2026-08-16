# Daily Intelligence Brief: Production and Verification Workflow

**Prepared:** August 16, 2026  
**Scope:** Daily segment structure, paired Andrew/Jenny audio, source readiness, homepage listening context, recovery behavior, and morning operations reporting.

## Current verified state

The current Daily Intelligence Brief has a complete **15-part listening sequence**: one opening greeting, thirteen editorial analysis segments, and one closing. Both Andrew and Jenny have an audio asset for every segment and a verified continuous full-episode file. The durable morning snapshot records **15 total segments**, **13 editorial segments with source context**, and both full voice mixes as ready.

The greeting and closing are deliberately not treated as sourced news-analysis segments. They provide listener orientation and a clear ending; source context is required for the thirteen editorial analysis segments. The public homepage now shows all fifteen playable parts and labels each as **Opening**, **Editorial segment**, or **Closing**.

| Requirement | Verified behavior | Publication consequence if absent |
|---|---|---|
| Opening greeting | First playable item | Episode remains held |
| Editorial analysis | At least 13 segments | Episode remains held |
| Editorial sources | Source context attached to every editorial segment | Episode remains held |
| Closing | Last playable item | Episode remains held |
| Andrew audio | All segment files and one continuous episode | Episode remains held |
| Jenny audio | All segment files and one continuous episode | Episode remains held |
| Morning snapshot | Saved after guard outcome | Admin shows the last durable production outcome |

## Listener workflow

The homepage listener should experience the Brief as a sequence, not an undifferentiated audio block. The recommended daily listening flow is:

1. **Opening greeting.** A short orientation to the day’s reporting and the selected voice.
2. **Thirteen editorial segments.** Each item has an ordinal, title, editorial role, duration, paired Andrew/Jenny audio, and source context in the underlying record.
3. **Closing.** A clearly labeled end to the briefing rather than an abrupt stop.
4. **Full-episode option.** Andrew and Jenny each have an independently playable and downloadable continuous episode file.
5. **Persistent playback context.** The homepage card and sticky player identify the current role, segment number, title, and listening progress when a segment is playing.

> The Daily Brief quality standard is **opening → sourced editorial analysis → closing**, with separate paired voice assets and a visible listener position at every step.

## Autonomous production workflow

The existing cloud workflow is now organized as a guarded production pipeline rather than a simple long-form audio generation job.

| Stage | Automated control | Failure-safe result |
|---|---|---|
| 1. Source preflight | Runs before the morning generation window and checks every editorial topic for fresh source coverage | Prevents partial or unsourced scripts |
| 2. Script generation | Produces the opening, editorial sequence, and closing from verified source context | Saves a recoverable draft; does not publish a placeholder |
| 3. Structural validation | Confirms greeting first, at least 13 editorial segments, and closing last | Holds the episode if sequence is malformed |
| 4. Audio creation | Creates Andrew and Jenny audio for every segment | Holds the episode if either voice is missing |
| 5. Full-mix creation | Concatenates and verifies both continuous voice files | Holds the episode if either full mix is unavailable |
| 6. Publication gate | Requires paired segments, paired full files, editorial source coverage, and valid structure | Keeps incomplete episodes out of public-ready status |
| 7. Morning snapshot | Persists the production outcome, agent workload, recommendations, and portrait gaps | Gives Admin a durable record rather than transient logs |
| 8. Guarded recovery | Retries safely at scheduled recovery windows or consumes a private Admin repair request | Never marks a repair complete before the same gate passes |

## Findings corrected in this review

The verification found that the existing scripts contained an opening and closing, but homepage segment displays had been filtering them out. That made the visible experience appear to begin and end abruptly. The display now includes the opening as segment 1 and the closing as segment 15. The player also carries ordinal and role metadata so the current item can be identified during playback.

The verification also found that a first version of the quality guard incorrectly expected source links on the greeting and closing. The corrected gate requires sources for the editorial analysis segments only, then confirms the structural framing separately. The current guard was re-run successfully against the verified August 16 episode.

## Recommendations

The platform now has the essential gates required for a credible daily briefing. The next improvements should be editorial rather than merely technical.

1. **Expose per-segment source links to listeners.** The production record is source-backed; making those sources available in the public segment detail view would further distinguish analysis from unsubstantiated commentary.
2. **Add a short visible “Now playing” line on mobile.** The active segment context now exists in the shared player state; a larger mobile label would make position even clearer without interrupting listening.
3. **Add a lightweight human editorial sign-off lane for exceptional days.** Keep the autonomous publication gate, but flag unusually short segments, unusual source concentration, or recovery runs for optional review rather than blocking ordinary production.
4. **Use the morning summary as the operational handoff.** The Admin Overview now records Daily Brief readiness, agent queue size, recommendation count, and portrait evidence gaps; this should become the first page checked each morning.

## References

[1]: https://blkpolnow-nztxnshf.manus.space/podcast "Black Politics Now — Daily Intelligence Brief"
[2]: https://blkpolnow-nztxnshf.manus.space/admin "Black Politics Now — Admin Dashboard"
