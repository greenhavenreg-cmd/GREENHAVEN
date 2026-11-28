# RUN461 — Reward Claim Response Integrity

**Package:** `gh-connect@0.338.173`  
**Date:** 27 November 2026  
**Parent:** RUN460 / `0.338.172`  
**Status:** Source candidate only — NOT APPROVED for production.

## Implementation

RUN461 hardens the authoritative GHC reward-claim and GHC membership-purchase RPC boundaries before API/UI success is reported. It does not change reward amounts, eligibility, maturity timing, claim settlement, ledger writes or membership/referral economics.

- `rpcClaimPending` validates authenticated owner/hold identifiers before the privileged call and accepts only an explicit `ok: true` result with an exact boolean `alreadyClaimed`, a bounded non-empty transaction ID and a positive finite amount.
- A malformed or incomplete successful HTTP response is treated as an ambiguous/unavailable result, not a successful claim. The existing database idempotency path remains the recovery mechanism for a retry if the transaction committed but its response was malformed or lost.
- The GHC membership purchase RPC now validates owner/reference/tier/amount inputs, has a 10-second timeout, and requires explicit outer/nested success booleans, exact reference/amount binding, and a matching active entitlement before success. Ambiguous responses remain retry-safe through the existing purchase reference idempotency.
- RPC error codes and `redeemableAt` are validated before being returned to route handlers.
- Matured Daily Claim hold reads now validate the authenticated owner, cutoff date, row count, identifiers, positive finite amount, timestamp and metadata shape before any returned hold ID can reach the claim RPC. A malformed or cross-account row makes the read unavailable rather than silently producing a partial candidate list.
- Existing service-role query owner filtering, 48-hour lock, review checks, rate limits and database atomic claim authority remain in force.

## Verification

- RUN461 focused static contract: **21/21**.
- Full network/DB-independent static verification: **63/63 suites passed**.
- RUN460 referral hardening, RUN450 economy journey and Phase 11 reconciliation contracts remain green and retained.
- No SQL migration, reward formula, settlement rule, ledger policy, membership rule or referral rule was changed.

## Acceptance limitations

The repository requires Node.js `^24.15.0`; the available runtime is Node.js 22.16.0 and dependencies are absent. Supported-runtime TypeScript, lint, production build, browser/device and live Testnet acceptance remain outstanding. No database mutation, migration, Git push, Vercel deployment, wallet operation or provider transaction was performed. Production remains **NOT APPROVED**.
