# Admin Research Workflow and General-Election Status Repair

**Prepared:** August 19, 2026 (EDT)

## Research workflow replacement

The unavailable language-model-backed **Run research now** path was removed from the public Admin controls. It has been replaced by a deterministic, review-first **Prepare evidence package** action. The action collects the current platform’s dated source context, creates a private `source_watch` recommendation, assigns it through the existing review workflow, and never publishes or alters election data.

A production-safe smoke check created private run **#3600001** successfully: it assembled 18 current platform source records across three evidence types, created one pending source-review recommendation, made no language-model request, and made no public change. The same deterministic path is now used by the Admin button and the authenticated scheduled Research Desk route.

The broken AI portrait-search buttons and bulk-search controls were removed from Candidate Operations, Portrait Review, and Proposed Changes. The dependable portrait process is now explicit: open a curated official-source lead, submit a secure direct image URL plus its provenance page, then use the existing one-at-a-time Approve / Deny review queue.

## General-election candidate statuses

Black Representation candidate status options now include **Won General Election** and **Lost General Election**. These statuses are available in the protected Black Representation editor and render publicly with distinct win/loss badges.

### Maxwell Frost — Florida 10

Maxwell Frost’s record is now **Won General Election** with a clearly disclosed unopposed basis. Florida’s official 2026 General Election candidate listing identifies incumbent Maxwell Alejandro Frost as unopposed for U.S. Representative District 10; Florida Politics independently reported that no named primary or general-election opponent qualified.[1] [2]

The record’s source URL now points to the official Florida listing, its summary states that it is an unopposed result rather than a vote-counted call, and the referenced Black Politics Now article remains unchanged.

## References

[1]: https://dos.elections.myflorida.com/candidates/CanList.asp?elecid=20261103-GEN "Florida Division of Elections — 2026 General Election Candidate Listing"
[2]: https://floridapolitics.com/archives/801710-maxwell-frost-effectively-secures-another-term-in-congress/ "Florida Politics — Maxwell Frost secures another term in Congress unopposed"
