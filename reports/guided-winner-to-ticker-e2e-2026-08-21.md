# Guided Winner-to-Ticker End-to-End Verification

**Release date:** August 21, 2026  
**Decision:** Election Operations now explains and performs a simple cited-result workflow without requiring an administrator to manually copy a winner into the ticker.

## Plain-language workflow

| Step | What the administrator does | What the system preserves |
|---|---|---|
| 1. Review | In **Election Operations → Results & Conflicts**, open the correct race and review its returns and source context | Monitoring remains informational; no result changes merely by opening the record |
| 2. Confirm | Select a currently mapped candidate and enter the cited source label and HTTP/HTTPS URL | The public call and immutable result-confirmation record save together only after a human decision |
| 3. Add to ticker | Leave **“Also add this verified winner to the public ticker”** checked and select **Confirm winner and add to ticker** | The exact confirmed winner, party, jurisdiction, source label, source URL, and source-backed audit record are inserted into the continuous public banner automatically |

For a previously confirmed result, the same race row also shows **Add confirmed winner to ticker**. That action refuses to run unless the race has a durable human confirmation with cited evidence. Duplicate active ticker entries are detected and reported rather than repeated.

## End-to-end evidence

The focused suite confirmed the protected Results Control Room and ticker contracts, including a non-Admin block for both confirmation and ticker handoff, HTTP/HTTPS enforcement on confirmation sources, unmapped-winner rejection before mutation, and refusal to hand off a race without a cited human confirmation. The non-destructive E2E verifier confirmed those guards and that rejected actions left ticker and immutable ticker-audit counts unchanged.

The live database currently has no source-backed human confirmation available as a fixture. The verifier therefore did **not** invent or publish a result merely to exercise the final insertion. This is an integrity hold, not a workflow failure: the first real cited confirmation in the Admin workspace will exercise the one-step public insertion, and its receipt will identify whether it added the item or found an existing entry.

Full regression and production build passed. The remaining acceptance boundary is a brief owner-session visual check: open **Admin → Election Operations → Results & Conflicts**, expand a real cited confirmation when one exists, and verify the checked one-step action matches the three-step guide.
