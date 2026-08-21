# General-Election Ticker Management End-to-End Verification

**Release date:** August 21, 2026  
**Decision:** Administrators can now add, edit, order, and remove cited **general-election** names or outcomes in **Admin → Election Operations → Ticker**. Managed items are merged with eligible race-derived final outcomes and keep the ticker’s uninterrupted scrolling behavior. No primary or runoff option exists in the managed-entry contract.

## Admin workflow

| Action | Required fields and result | Safety boundary |
|---|---|---|
| Add | Jurisdiction, Senate/House/Governor office, winner name and party, source label, and HTTP/HTTPS source URL | The model permits general-election outcomes only; there is no primary or runoff stage input |
| Edit | Update the same sourced item fields with an optional private editorial note | The existing public item is refreshed only after protected persistence succeeds |
| Order | Use the up/down controls to set display order among managed items | Each adjusted order writes a private immutable management record |
| Remove | Confirm removal from the public ticker | The item is soft-removed; source-backed private history is retained |

The public ticker obtains active managed entries through a public read contract, merges them ahead of qualifying Senate and House calls without duplicate display, and maintains its continuous request-animation-frame movement. The homepage and Election Center use the existing 60-second election refresh cadence.

## End-to-end evidence

The non-destructive verifier confirmed the public and Admin entry queries resolve, the public query never returned inactive entries, a non-Admin was blocked before creation, and FTP evidence was rejected before persistence. Entry and immutable-audit counts were unchanged after both rejected actions. The current database intentionally contains **zero** manually managed ticker entries because no real name and source package was supplied for a production addition; automatic verified race outcomes continue to populate the visible ticker.

Focused ticker tests, TypeScript, the non-destructive verifier, public homepage visual check, full regression suite, and production build passed. The remaining acceptance boundary is visual only: the available browser is not signed into the owner account. In the owner session, open **Admin → Election Operations → Ticker** and add a future real source-backed general-election item to view the green saved receipt and public ticker update.
