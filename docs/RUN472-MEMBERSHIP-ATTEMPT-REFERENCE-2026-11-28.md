# RUN472 — stable GHC membership purchase reference and truthful outcome message

**Baseline:** `gh-connect@0.338.173` / RUN461–RUN471. **Status:** source candidate only — NOT APPROVED for production. Version unchanged; no migration, economics, ledger or API change.

## Findings
- `purchaseWithGhc` minted a **new** random spend reference on every call. The server already refuses a repeat purchase once the same tier is active, but a retry after a timeout or dropped connection, while the first request was still completing, carried a different reference and could not be recognised by the ledger as the same attempt.
- When the server did not confirm, the message said "GHC was not spent." That is not known to be true after a timeout or an unreadable response.

## Changes
- One reference per (tier, period) attempt is kept and reused on retry. It is dropped when the server answers definitively (granted, or an explicit rejection) and expires after ten minutes, so a later renewal always gets a new reference.
- The unconfirmed-purchase message no longer claims nothing was spent: it says the server did not confirm, that a retry will not charge twice, and points to Wallet → History.
- Reviewed and left unchanged: Send GHC (already holds a stable reference until success), GHC packs (creates a payment intent only; the Pi payment itself is user-approved), messaging premium (fixed in RUN470).

## Verification
`npm run verify:static` passes including `scripts/check-run472-membership-attempt-reference.mjs`. Edited file passes a TypeScript **syntax** parse only; not a full typecheck. Server behaviour on a concurrent duplicate was not exercised.

## Still open
The server still falls back to a stable per-tier reference when none is supplied; whether the purchase RPC is atomic under two concurrent requests needs a live Testnet check. Node 24 typecheck, lint, build, browser and live Testnet acceptance remain outstanding.
