# Candidate Removal Discoverability

**Completed:** August 20, 2026 (EDT)

## Where the removal action is now located

The protected removal control remains limited to **Black Representation** profiles and article-backed contest records, because Senate, House, and Governor candidates are fields within shared election records and must not be silently erased through a candidate-list action.

The Admin path is now explicit:

1. Open **Admin → Candidates**.
2. Filter to **Black Representation**, if needed.
3. Select **Manage / remove profile** on the candidate card or its expanded detail panel.
4. The dashboard opens **Admin → Black Representation**, pre-searches the matching profile, and displays the visible **Remove profile** action.
5. Enter a reason of at least 12 characters; optionally add an evidence URL; then select **Confirm removal**.

The editor still prevents removal when the person has a linked contest record. Contest records have their own separately audited removal action. Every permitted removal writes a before-state snapshot, the administrator identity, the stated reason, and optional evidence into `candidate_removal_audit`. No removal occurs merely by opening the candidate card.

## Verification

The candidate-list route, protected mutation contracts, and public-access prohibition passed TypeScript and 34 targeted router tests. The removal flow is Admin-only and remains intentionally distinct from portrait/source-review actions.

## Candidates-level save verification

The **Manage / delete profile** action now appears directly on every Black Representation card in **Admin → Candidates** and again in its expanded candidate detail panel. It opens the same protected editor with the matching candidate name pre-filled in search; the destructive action is still one confirmation step deeper, preserving the reason and audit requirement.

Candidate saves work through the shared `election.cbc` public data contract. A protected regression test re-saved Maxwell Frost’s stored Black Representation fields with an administrator caller, then immediately read the same profile through the public `election.cbc` procedure—the contract used by the homepage Black Reps map—and verified the persisted status and primary-result values. The homepage fetch policy rechecks that shared data every 60 seconds, while mutation success immediately invalidates the Admin cache.

The candidate-management path, TypeScript, 35 targeted router tests, full regression suite, and production build all passed.
