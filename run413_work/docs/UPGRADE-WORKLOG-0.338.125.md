# Upgrade worklog — GH-CONNECT 0.338.125 / Run 398

**Current package:** `gh-connect@0.338.125`
**Baseline:** `GREENHAVEN-0.338.124-RUN397-MEMBERSHIP-REWARDS-REFERRAL-100PI-2026-11-25.zip`
**Scope:** Source-only referral session isolation and public response minimization. Production remains NOT APPROVED.

## Coordinated release implementation steps

1. Inspected the referral status component and authenticated API client for session-bound data behavior.
2. Identified an out-of-order response risk when overlapping referral status requests complete after an account switch.
3. Added AbortController cancellation and a monotonic request sequence to reject stale results.
4. Bound fallback referral-code fetches to the same abort signal and current request generation.
5. Added wallet-auth-change refresh handling so referral details rehydrate after identity changes.
6. Added the missing listener for the existing `ghc:referral-refresh` event.
7. Invalidated and aborted outstanding reads on component unmount.
8. Removed the internal referrer user ID from the public referral status response and client contract.
9. Added `scripts/check-run398-referral-session-isolation.mjs` with eight targeted assertions.
10. Registered the Run 398 gate exactly once in `verify:static` and `prebuild:checks`.
11. Synchronized package, lockfile root, app release metadata, README, current project truth, source-of-truth document, current build context, verified manifest, and this worklog to `0.338.125`.
12. Preserved dependency versions and did not alter payment, membership entitlement, wallet ledger, referral settlement or migration application behavior.

## Verification and source-only verification scope

- Run 398 referral session-isolation gate: 8/8 passed.
- Run 397 rewards/referral gate: 16/16 passed.
- Phase 9 membership session-safety gate: 15/15 passed.
- Phase 9 membership release gate: 16/16 passed.
- Phase 8 rewards-history gate: 20/20 passed.
- Project-truth gate: 11/11 passed.
- Release hygiene: 17/17 passed.
- SQL lexical integrity: 251 migration/proposal files passed lexical balance checks.
- `npm run verify:static`: passed, exit 0, 5,053 PASS lines and zero FAIL lines. The first attempt exposed three Run #301 worklog metadata expectations; these were corrected, and the subsequent full static run passed.

The required build runtime is **Node.js 24.15.0** (`.nvmrc`); this workspace uses Node 22.16.0. Dependency-backed TypeScript, lint and production build are not certified until run with the project dependencies installed under Node.js 24.15.0.

## Limits and deployment safety

No database migration or backfill was executed; no PI was credited; no referral settlement was enabled; no GitHub push or Vercel deployment occurred. The Run 397 Testnet migration-history mismatch remains unresolved. The 100 PI cumulative Testnet campaign migrations remain review-required and must not be applied or backfilled until the connected Testnet migration history and RPC contracts are reconciled. This release is source-only and is not production approval.
