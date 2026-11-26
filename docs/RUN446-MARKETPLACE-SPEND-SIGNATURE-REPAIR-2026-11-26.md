# RUN446 — Marketplace spend signature repair

**Package:** `gh-connect@0.338.158`  
**Parent:** RUN445 / `0.338.157`  
**Date:** 26 November 2026

## Defect

The RUN445 Vercel build completed all 466 prebuild checks and compiled the optimized production bundle, but TypeScript validation failed at `app/api/marketplace/orders/[orderId]/pay/route.ts:243`. The in-memory fallback supplied a third options argument to `executeAuthoritativeSpend`, whose declared API accepts only `(store, input)`.

## Repair

Removed the unsupported third argument from the in-memory `executeAuthoritativeSpend` call. The `transportError: "SPEND_FAILED"` override remains on the durable `executeGhcSpendRpc` call, where the option is part of the declared contract. The in-memory fallback retains its own returned error and existing failure handling. No payment semantics, amount derivation, idempotency reference, stock claim, ledger behavior or provider integration was changed.

Added `scripts/check-run446-marketplace-spend-signature.mjs` and registered it in `verify:static` and `prebuild:checks`.

## Verification boundary

The focused source contract and documentation checks are run during this increment. The full Next.js production build must be rerun by Vercel on the configured Node 24.15.x runtime. The Vercel log supplied by the user is evidence for RUN445 only; it is not evidence that RUN446 builds. No Git push, deployment, database mutation, payment or withdrawal transaction was performed. Mainnet/live bank transfers remain outside this change and are not approved by it.
