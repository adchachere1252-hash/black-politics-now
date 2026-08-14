# Research & Intelligence Agent Example

## Purpose

The new public preview at `/intelligence-example` demonstrates a **Research & Intelligence Agent**, rather than a simple chatbot. It connects three existing platform capabilities into one reader-and-editor workflow: selected newsroom reporting, linked public records, and source-cited research answers.

| Stage | Reader-facing behavior | Protected editorial behavior |
|---|---|---|
| Gather evidence | A reader can ask a guided or free-form question. | The agent retrieves the relevant platform source context. |
| Compare the record | The answer distinguishes grounded, partial, and unavailable evidence. | The agent can identify a possible data-quality or editorial follow-up. |
| Prepare proposal | The reader sees citations and linked records. | The agent can prepare a research package or a proposed story-to-record link. |
| Return for approval | The reader can open the original reporting or the linked record. | An editor decides whether to approve, revise, defer, or dismiss a recommendation. |

## Editor-confirmed linking example

The page uses three authentic Black Politics Now WordPress articles selected from the persisted WordPress source snapshot. Their links to Louisiana, Georgia, and Tennessee platform records are deliberately static and visible as **Editor confirmed**. The agent did not infer or publish them automatically.

## Boundaries

> The agent can research, compare evidence, prepare source-cited briefs, and recommend a next step. It cannot automatically publish a WordPress story, add a public link, change an election record, send a reader alert, or alter the public World Elections calendar.

## Existing Q&A collection

The current public Research Desk dynamically answers from platform sources. The existing large question-and-answer collection is **not yet imported** into this application, so the preview does not claim that those historical answers are current evidence. The recommended next step is a separate, editor-reviewed Q&A import that stores each answer with: its original question, publication or review date, topical tags, source provenance, a currentness flag, and any replacement answer. That will allow the agent to retrieve durable guidance without presenting dated answers as live election facts.
