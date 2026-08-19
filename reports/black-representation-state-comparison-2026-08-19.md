# Black Representation State Comparison, Source Review, and Timeline

**Prepared:** August 19, 2026 (EDT)

## Public placement

The new tools live at **Election Map → Black Reps**. The Black Reps tab retains its distinct nonpartisan representation color; it does not borrow the purple Toss-up color or display a primary outcome as a general-election call.

## Added operational surfaces

| Surface | What it provides | Guardrail |
| --- | --- | --- |
| State comparison | State-level counts for tracked people, contest records, advancements, transitions, evidence coverage, review needs, and most recent activity | State selection filters the map, record cards, and timeline without changing data. |
| Source-review badges | **Source reviewed**, **Article reference**, or **Source review** on people and contest records | Missing evidence and unresolved contests are visibly distinguished from corroborated reporting. |
| Primary-to-general timeline | Chronological record trail with stage, date, source badge, context, and source link | A primary stage remains separate from a general-election or certification stage. |

## Verification

The desktop Election Center successfully loaded the Black Reps map with the current representation treatment, minute-refresh data feeds, source-aware cards, and the new comparison dashboard. The state map remained interactive; clicking a state continues to open its record detail. Automated tests cover source-badge classification, state comparison counts, timeline filtering, Florida primary records, and existing public data contracts.
