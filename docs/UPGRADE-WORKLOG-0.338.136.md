# Upgrade worklog — 0.338.136 Run 411 Marketplace Commerce Reliability

## Baseline
Run 410 (`0.338.135`) Marketplace Maturity. This pass addresses commerce-state correctness and cart concurrency gaps found by reviewing the actual source.

## Implementation
- Added explicit saved-listing `loading`, `ready`, and `unavailable` states; a failed request no longer masquerades as an empty shortlist, and the user can retry.
- Removed local/demo order fallback from the order list and marketplace outcome summary. Durable order state is the only order source used for the UI.
- Added an unavailable state for first-time order reads and stale-data messaging when a refresh fails but prior durable orders are available.
- Changed cart cleanup to remove only exact unchanged cart-line snapshots associated with successful reservations, preserving quantity/price/currency/timestamp edits made during checkout.
- If one or more GHC lines have settled before a later line fails, the failure path now removes only those paid lines and clears their retry keys; unpaid/reserved lines remain for recovery.
- Made cart line removal variant-aware so removing one SKU does not remove sibling SKU variants.
- Added a focused Run 411 static contract check and expanded the cart runtime regression test.
- Updated package, lockfile, release metadata, and current source pointers to `0.338.136`.
- Added a Marketplace commerce reliability audit with explicit remaining risks and release limits.
- No database migration, grant, RLS policy, payment flag, wallet mutation, or payout behavior changed.

## Verification status
Run 411 source contract 12/12; cart runtime regression passed; Run 410 10/10; Run 409 9/9; Run 405 10/10; Run 406 9/9; Phase 2 cart 14/14; Phase 7 commerce 15/15; Phase 9 marketplace 20/20; Seller Centre 9/9; variants 26/26; fulfilment 28/28; order integrity 30/30; filter contract 17/17; saved-address contract 29/29 plus runtime test; project truth 11/11; release hygiene 17/17. Dependency-lock, migration-inventory, documentation hygiene, SQL lexical integrity, 1,183-file JSX safety and changed-file TypeScript syntax transpilation passed. Full dependency-backed TypeScript, lint, production build and browser/device acceptance require Node 24.15.x and installed dependencies and are not claimed.

## Boundaries
Local source-only candidate. No GitHub push, Vercel deployment, live database mutation or financial execution occurred. Production is not approved by this pass alone.
