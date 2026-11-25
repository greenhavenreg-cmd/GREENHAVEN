# Run 411 — Marketplace Commerce Reliability Audit and Remediation

Date: 2026-11-25  
Candidate: `gh-connect@0.338.136`  
Baseline: Run 410 (`0.338.135`)  
Status: local source candidate; not deployed

## Scope reviewed

Reviewed the Marketplace screen and local cart model, including durable browse/listing reads, saved-listing reads, seller inventory, durable orders, cart checkout reservation flow, variant identity, and empty/error-state presentation. Reviewed the listing, order, save, and saved-address API route contracts and existing marketplace regression scripts. This is a source audit; it is not a live endpoint or browser/device certification.

## Findings and fixes

### 1. Saved-listing API failures could masquerade as an empty shortlist — fixed

`loadSavedListings` preserved prior saved records on transport failure, but the screen had no explicit availability state. With no prior records, an API failure could render “Nothing saved yet.” Added `loading`, `ready`, and `unavailable` state, explicit retry UI, and only show the empty-list message after a successful durable response. Previously loaded saved records remain visible during a transient failure.

### 2. Order UI could fall back to local/demo domain orders — fixed

The order view and marketplace outcome summary used `domain.getOrders()` whenever the durable order array was empty. This made an authoritative empty server response indistinguishable from local fallback data and risked presenting non-durable order records as live financial state. Both views now use durable orders only. An empty state is shown only when the durable request is `ready`; an unavailable first read has a retry action, and a failed refresh with prior records explicitly labels those records as last-verified/stale.

### 3. Cart cleanup could delete newer buyer intent — fixed

After successful reservation/payment, checkout cleanup removed cart lines by listing ID. If a buyer edited quantity or added the same listing/variant while checkout was in flight, cleanup could remove that newer intent. Cleanup now compares exact purchase-intent snapshots (listing, variant, seller, quantity, timestamp, price and currency) and removes only unchanged lines corresponding to successful reservations. Updated lines remain in the cart.

### 4. Removing one SKU could remove all variants of the listing — fixed

Cart line removal previously identified a line by listing ID only. Removal now accepts a variant identifier and the UI passes an explicit empty identifier for legacy/non-variant lines, preserving sibling SKU variants.

### 5. Server-authoritative checkout remains intact

The order creation API still accepts listing/variant/quantity plus an idempotency key and resolves seller, price, currency, availability and inventory reservation server-side. Client prices and seller metadata remain untrusted. No payment authorization, payout execution, fee policy, database grant, RLS policy, or financial migration was changed.

## Important existing architecture observed

- Listing browse uses server-side search/filter/sort and explicit availability state; locally cached listings can be used only as a labelled fallback when the server catalog is unavailable.
- Order creation requires an idempotency key and delegates stock reservation to the database RPC.
- Saved listings and saved addresses use authenticated server routes and bounded inputs; mutations have per-user rate limiting.
- Product variants have separate cart identities and server-side stock reservation checks.
- Seller Centre counts are based on loaded listings and orders, with unavailable values withheld rather than fabricated as zeroes.

## Remaining risks / not certified

1. Multi-line cart checkout remains a sequence of separate order reservations and payment actions, not a single atomic multi-seller checkout. Partial success is possible and is surfaced to the user; a durable recovery/reconciliation experience should be browser-tested before release.
2. When a cart contains multiple Pi orders, the current flow starts one Pi payment and directs the buyer to Orders for remaining reservations. This is explicit but not a unified multi-order payment experience.
3. The local cart is a convenience cache, not a durable server cart. Server authority at order creation/payment is preserved; cross-device cart synchronization is not implemented by this pass.
4. Search/filter/pagination, save toggles, listing create/edit, listing fee settlement, address mutations, payment callbacks, cancellation/refund/dispute, order timeline, and seller fulfilment still need authenticated end-to-end acceptance against the actual Testnet deployment.
5. The source review does not prove database RPC definitions, grants, RLS policies, or deployed Vercel environment match this archive. Existing migration-history drift must be reconciled before migration automation.
6. Full dependency-backed TypeScript, lint, production build, browser/device tests, and live Testnet commerce tests remain outstanding. Workspace runtime is Node 22.16.0 while the project requires Node `^24.15.0`; dependencies are not installed.

## Verification performed

- `scripts/check-run411-marketplace-commerce-reliability.mjs`: 12/12.
- Extended `scripts/test-phase4-marketplace-cart.mjs`: baseline assertions plus variant-specific removal and snapshot-safe checkout cleanup passed.
- Run 410 maturity: 10/10; Run 409 premium UI: 9/9; Seller Centre: 9/9; variants: 26/26; fulfilment: 28/28; order integrity: 30/30; filtering: 17/17.
- Phase 2 cart: 14/14; Phase 7 marketplace commerce: 15/15; Phase 9 marketplace transformation: 20/20; saved-address contracts: 29/29 and runtime tests passed.
- Project truth: 11/11; release hygiene: 17/17; dependency-lock integrity and migration inventory checks passed; documentation hygiene and SQL lexical integrity passed.
- Changed TSX and cart module passed TypeScript transpile/syntax diagnostics; JSX safety scan passed for 1,183 files.
- These are targeted source-contract/runtime utility/syntax checks, not a full dependency-backed build or browser/device acceptance.

## Release boundary

Run 411 is a source-only candidate. No database migration or live data change was made. No GitHub push or Vercel deployment occurred. Pi withdrawal execution remains disabled until its separate real-Testnet executor, authorization, idempotency, and recovery certification passes. Production is not approved based on this audit alone.
