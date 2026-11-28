# RUN460 — Referral Read/Attribution Hardening

**Package:** `gh-connect@0.338.172`  
**Date:** 27 November 2026  
**Parent:** RUN459 / `0.338.171`  
**Status:** Source candidate only — NOT APPROVED for production.

## Implementation

RUN460 hardens existing referral endpoints and service boundaries without changing the referral reward formula, qualifying membership events, settlement policy or ledger authority.

- `/api/referral/status` now uses a per-user durable rate limit (30 requests/minute), fails closed when the shared limiter is unavailable, and returns explicit private no-store headers.
- `/api/referral/code` now uses a separate per-user durable rate limit (20 requests/minute), fails closed on limiter unavailability, and returns explicit private no-store headers.
- Both GET routes provide `Retry-After` on rate-limit responses.
- `/api/referral/attribute` now uses fail-closed durable mutation throttling, reduced to 30 attempts/minute because attribution is permanent and may affect future economic rewards.
- `ensureReferralCode` validates the RPC result against the canonical issued format `GH` plus eight uppercase alphanumeric characters; malformed or missing values cannot be serialized as strings such as `undefined`.
- Referral aggregate counts and GHC totals are normalized to finite, non-negative values before leaving the service layer.

## Verification

- RUN460 referral read hardening contract: **8/8**.
- RUN398 referral session isolation: **8/8**.
- RUN450 wallet/withdrawal/membership/referral/missions contract: **17/17**.
- Full `npm run verify:static`: **5,472 PASS, 0 FAIL**, exit 0.
- Release metadata, package/lockfile version and source-of-truth documents are synchronized to `0.338.172`.

The first static rerun after the package version increment caught a stale RUN459 release marker. The application release marker and current source-of-truth documents were updated, then the complete static suite passed. This caught-and-corrected failure is retained as part of the verification history.

## Acceptance limitations

The repository requires Node.js `^24.15.0` (`.nvmrc` 24.15.0). The default available Node.js is 22.16.0; the bundled 24.11.1 runtime is also below the minimum. Dependencies are absent. `npm run prebuild:checks` was attempted and stops when `scripts/check-jsx-duplicate-props.mjs` cannot resolve the missing `typescript` package.

Supported-runtime typecheck, lint, Next.js production build, browser/device/mobile acceptance and live Testnet end-to-end acceptance remain outstanding. No database migration was added or applied; no live database mutation, Git push, Vercel deployment, wallet operation or payment-provider transaction was performed. Production remains **NOT APPROVED**.
