# Election Day Command Center and Agent Research Controls

## Command Center

The protected **Admin Dashboard → Command Center** now consolidates the election engine’s operational state with review-first data work. The five-minute election guard records a clear standby heartbeat outside active dates; on active dates, the DDHQ polling engine records a heartbeat after each polling pass. The screen displays source state, heartbeat age, mapped-race coverage, reporting and called-race counts, candidate coverage gaps, pending change sets, a triage queue, and a staged Election Day runbook.

| Signal | Meaning | Automatic public action |
|---|---|---|
| Healthy active heartbeat | The live engine recently completed a DDHQ polling pass. | None |
| Standby heartbeat | No configured election is active; the guard is ready to launch automatically on the next active date. | None |
| Stale or degraded heartbeat | An administrator should inspect source availability or the polling engine. | None |
| Triage item | A candidate gap, source condition, or high-priority research recommendation needs an owner. | None |

## Run Research Now

On **Admin Dashboard → Proposed Changes**, every pending private proposal now has a **Run research now** control. It explicitly asks the agent to create a fresh evidence-based change-set version for that approved task. Earlier proposals remain in the private audit trail. The run cannot apply a proposal, change a public record, publish WordPress content, or send an alert.

## Portrait Research

On **Admin Dashboard → Portrait Review**, an administrator can select a missing-photo target and choose **Run portrait research**. This creates a bounded Data Desk agent task for that exact candidate and location. The agent may return a private portrait-source proposal only when its supplied context contains adequate evidence. It cannot submit a portrait, write a photo URL into a profile, or bypass the existing human provenance review process.

> A portrait is still applied only after an administrator approves a submitted image and provenance record in Portrait Review. Agent output is research evidence, not an automatic submission or photo update.

## Verification

The deployed cloud guard wrote a verified `standby` DDHQ heartbeat to the shared database. Desktop and mobile screens were checked for Command Center, Proposed Changes, and Portrait Review. The regression suite passed **29 tests**, including public-access denial for Command Center, on-demand research, and portrait research controls. TypeScript completed without errors.

## Election Day Intelligence Agent

The Command Center now adds an explicit **Run Election Day research** action plus a per-triage-item **Investigate with agent** control. An administrator’s selection creates a bounded Data Desk task from the current heartbeat, coverage, and selected triage context. The agent returns its work as a private evidence-backed package and up to three private proposals in **Admin → Proposed Changes**.

> The Election Day Intelligence Agent cannot call a race, write vote totals, change a public election record, publish an update, send a notification, or resolve a source conflict on its own. It prepares the investigation; an administrator reviews every result.
