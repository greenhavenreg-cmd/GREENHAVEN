# RUN458 — Marketplace Cart Account Isolation
**Current engineering note:** 27 November 2026.

**Package:** `gh-connect@0.338.170`  
**Parent:** RUN457 / `0.338.169`  
**Date:** 27 November 2026

## Defect

Marketplace cart data used one browser-wide localStorage key. A second GreenHaven account signed into the same browser profile could therefore see the first account’s locally cached cart lines. Although the cart is only a convenience cache and server-side order creation revalidates price, seller and stock, the shared key exposed account-specific shopping intent across sessions.

## Repair

1. `lib/marketplace/cart.ts` now derives its storage namespace from `IdentityService` only when the identity is authenticated, server-verified and bound to a non-placeholder canonical GreenHaven user ID.
2. Each verified account uses `gh_marketplace_cart_v1:account:<canonical-id>`. Pi provider UIDs and unverified identities are not storage principals.
3. Anonymous and local-studio browsing retains the legacy `gh_marketplace_cart_v1` namespace. A guest cart is not silently migrated to a signed-in account.
4. `components/ghc/marketplace-screen.tsx` subscribes to identity changes and reloads the active account’s cart.
5. `components/ghc/app.tsx` refreshes the global cart badge when identity changes.
6. Scoped single-item and multi-line checkout idempotency state to the active cart namespace. Checkout now stops when the active account changes and does not clean cart lines from the newly active account.
7. Added a static release gate and runtime regression assertions covering two verified accounts, guest separation and account restoration.

## Verification

- RUN458 static contract: 8/8.
- Marketplace cart runtime: existing normalization, SKU, quantity, checkout snapshot/race assertions plus account-isolation assertions pass.
- Marketplace commerce contracts: Phase 9 20/20, Phase 2 cart 14/14, RUN411 reliability 12/12.
- Release integrity: RUN300 22/22, RUN301 20/20; documentation hygiene passed.
- Full `npm run verify:static`: 5,452 PASS lines, zero FAIL lines, exit 0.
- `npm run prebuild:checks` was attempted and stopped when `check-jsx-duplicate-props.mjs` could not import the absent `typescript` package. The required Node.js 24.15.0 is also unavailable (available runtime: 24.11.1); dependencies are not installed. Supported-runtime typecheck, lint, production build and browser/device/Testnet acceptance remain outstanding.

## Boundaries

No server order, payment, price, inventory, seller ownership, delivery-address, payout or database behavior was changed. Browser cart values remain untrusted display/convenience data. No database migration, provider transaction, Git push or deployment was performed. Production remains **NOT APPROVED** pending supported-runtime and Testnet acceptance.
