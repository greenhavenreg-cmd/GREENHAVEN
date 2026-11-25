# Run 410 — Marketplace Maturity and Seller Reliability Audit

Date: 2026-11-25  
Candidate: `gh-connect@0.338.135`  
Baseline: Run 409 executive-premium UI polish over Run 408 audit integration  
Status: source candidate; not deployed

## Findings addressed

1. **False-empty seller inventory on API failure.** `loadMineListings` previously retained old data on transport errors but exposed no explicit status. If no prior data existed, the UI could show “No listings yet” even when the server request failed. It now tracks `loading`, `ready`, and `unavailable` states and only presents a first-listing empty state after a successful, well-formed server response confirms an empty inventory.
2. **False-zero seller metrics.** Seller Centre counters previously showed zeros based on the in-memory arrays without separately indicating whether listings and orders had been authoritatively loaded. Listing and order metrics now show an em dash when their corresponding data source is not verified, and the user gets a retry action.
3. **Hidden order-load failures.** Durable order reads previously preserved cached state on failures but did not surface a seller-centre data-availability state. The orders loader now records an explicit state without treating a failed request as an authoritative empty order list.
4. **Marketplace desktop density.** Browse, seller centre, and saved-listing surfaces used a 42rem content cap that constrained the four-column browse grid and compressed nine seller metrics on wide displays. These surfaces now use a dedicated `--gh-marketplace-max` cap (84rem fallback); seller and saved listing grids can expand to three columns on wide screens.
5. **Navigation semantics and touch access.** Marketplace section chips now expose their pressed state and have a 40px minimum height with visible keyboard-focus treatment. The category toggle also exposes its selected state.
6. **Listing empty-state guidance.** The first-listing copy now explains the content expected and makes clear that the listing appears only after the server confirms persistence. A failed read instead offers a retry and explicitly says that failure is not the same as an empty storefront.
7. **Small correctness cleanup.** Removed a duplicated seller-edit error setter that repeated the same state update.

## Existing architecture preserved

- Server-authoritative catalog and checkout validation remain in place.
- Product variants, stock reservation, order lifecycle, seller fulfilment, listing-fee rules, saved listings, cart separation, and payment rails were not redesigned in this pass.
- No database migration, grant, RLS policy, payment execution, wallet balance, Pi authorization, or payout flag was changed.
- Failed network reads never clear last-known seller inventory/orders merely to make the UI look empty.

## Verification performed

- `scripts/check-run410-marketplace-maturity.mjs`: 10/10.
- `scripts/check-run409-executive-premium.mjs`: 9/9.
- `scripts/check-phase92-marketplace-seller-experience.mjs`: 9/9.
- `scripts/check-phase93-marketplace-variants.mjs`: 26/26.
- `scripts/check-phase94-marketplace-fulfilment.mjs`: 28/28.
- `scripts/check-phase10-marketplace-integrity.mjs`: 30/30.
- `scripts/check-phase10-filtering.mjs`: 17/17.
- `scripts/check-phase3-marketplace-premium.mjs`: 25/25; `scripts/check-phase3-marketplace-saved-addresses.mjs`: 29/29; `scripts/check-phase7-marketplace-commerce.mjs`: 15/15; `scripts/check-phase9-marketplace-transformation.mjs`: 20/20.
- Marketplace runtime contract tests passed: trust/speed, discovery/seller, saved addresses, cart (12/12), order contracts (16/16), product variants (16/16), fulfilment parser (15/15), filter utilities (14/14), and record mappers (16 assertions).
- Changed marketplace TSX passed TypeScript transpilation/syntax diagnostics. JSX duplicate-prop check passed across 231 files.
- `scripts/check-project-truth.mjs`: 11/11; release hygiene: 17/17; documentation hygiene: PASS; dependency-lock integrity: PASS; SQL lexical integrity: PASS across 254 migration/proposal files.
- Migration inventory generator completed with 245 SQL migration files and synchronized `VERIFIED_MANIFEST.txt`.

These are source-contract, utility-test, and syntax checks. No browser screenshots, real-device interaction run, full dependency-backed TypeScript typecheck/lint/build, or production deployment is claimed here. The current execution environment reports Node 22.16.0 while the project requires Node 24.15.x, and dependencies are not installed.

## Remaining marketplace work

- Run authenticated browser acceptance for search debounce/request volume, pagination and sort, filters, listing create/edit, saved-state refresh, cart persistence, variant stock conflicts, checkout, payment callbacks, order timeline, seller fulfilment, and responsive overflow.
- Confirm seller/order endpoints provide consistent durable/error contracts and meaningful trace IDs; improve API-level diagnostics where data is unavailable.
- Test long translated labels, large seller inventories, keyboard-only navigation, screen readers, reduced motion, offline/slow network and Android/Pi Browser viewport behavior.
- Validate marketplace catalog and seller data reads against the actual deployed Testnet environment. UI checks alone do not prove runtime routes or database permissions are fixed.

## Release boundary

Run 410 is a source-only candidate. No GitHub push or Vercel deployment occurred. Existing profile/identity failures, migration-history reconciliation, broad least-privilege review, full Node 24.15.x build/acceptance, and Pi payout execution certification remain open. Pi withdrawal execution remains gated until the real Testnet executor, authorization, idempotency, and recovery paths pass end-to-end verification.
