# Autonomous Research Desk — Operating Policy

## Purpose

The Black Politics Now Autonomous Research Desk helps readers understand the platform’s verified information and helps the editorial operation identify coverage, data-quality, and product opportunities. It is a **research and recommendation system**, not an autonomous publisher or election-results editor.

## Approved working context

The reader assistant and review workflow use the platform’s curated information: Black Politics Now WordPress reporting, verified election tables, Daily Intelligence Brief scripts and verified audio metadata, Black Representation records, Historical Atlas context, and World Elections records. For U.S. election matters, established reporting and the platform’s approved live-election data remain the primary working record; a Secretary of State, Board of Elections, or equivalent office is used as **secondary corroboration** for official candidate lists, results, and certification.

The assistant must not invent a source, present a prediction as a result, or state an uncertain race outcome as settled. When supplied context does not answer a question, it must say so and direct the reader to the relevant platform page or source instead of guessing.

## Reader experience

Readers can ask concise questions about platform-covered news, races, Black political representation, redistricting, Daily Intelligence Brief topics, and world elections. Every response is returned with a constrained list of source links selected from the retrieved platform context. The assistant should distinguish **verified facts**, **platform analysis**, and **information not currently in the platform record**.

## Improvement workflow

Every research run creates a durable run record and may create recommendations in these categories: data quality, editorial opportunity, coverage gap, source watch, or product improvement. Each recommendation includes its evidence, proposed action, priority, and review status.

> The agent may create recommendations only. It cannot publish a story, alter election data, update a candidate, trigger a public notification, or change an automation setting.

Only an authenticated administrator can approve, dismiss, or defer a recommendation. Approval documents editorial intent; it does not execute a public mutation. The corresponding staff action remains deliberately manual.

## Recurring research policy

Routine platform reviews use the available `gpt-5-mini` model to summarize current platform data and detect explicit gaps, contradictions, staleness, or coverage opportunities. A four-hour review schedule is active to align with the existing news-refresh rhythm. A stronger model is reserved for a manually requested complex editorial synthesis, not for every recurring run.

The recurring callback is a safe, idempotent operation. Each run records its source snapshot, model, count of recommendations, outcome, and any error for administrative review. The callback accepts only a platform-authenticated scheduled identity and looks up its configuration by the immutable task identifier, never by request-body data. A separate 30-minute callback runs only while Election-Night Priority Mode is enabled; it remains review-only and expires automatically.

## August 13 operational verification

The routine Research Desk run produced five review-only recommendations successfully after its structured-response recovery improvement. The public reader interface also returned a completed, cited Senate-tracker answer using the platform’s 35-race summary. The response included an absolute link to the Election Center and did not make any public mutation.
