# Upgrade worklog — GH-CONNECT 0.338.124 / Run 397

**Baseline:** user-designated `GREENHAVEN-0.338.119-PHASE9-COORDINATED-ONBOARDING-IDENTITY-STORAGE-2026-11-24-3.zip`  
**Current package:** `gh-connect@0.338.124`  
**Scope:** source-level Testnet registration rewards, membership/referral consistency, and release hygiene.  
**Status:** source-only; production remains NOT APPROVED.

1. Inspected the current registration bonus service, RPC contract, historical v1/v2 bonus reconciliation, and the PI earnings ledger atomic scale.
2. Defined a cumulative 100 PI Testnet registration-reward target; prior valid registration credits count toward the target rather than granting an unbounded additional 100 PI.
3. Added a distinct campaign idempotency reference and account-level transaction lock for the one-time registration reward. The server additionally requires `PI_NETWORK=testnet` and refuses Production Vercel environments.
4. Kept server feature gates fail-closed unless `GHC_REGISTRATION_BONUS_ENABLED=1` and `NEXT_PUBLIC_PI_SANDBOX=true`.
5. Added a migration-version contract so the prior 3 PI RPC cannot be mistaken for the new 100 PI campaign before the migration is installed.
6. Added a bounded service-role-only backfill across known Pi identities, durable profiles, sessions, and PI-ledger accounts; the operator must confirm the intended Testnet project and reconcile every batch result.
7. Updated the registration reward card to auto-reconcile idempotently for accounts that open the rewards surface and to explain the cumulative target and withdrawal safeguards.
8. Added referral reward caps and serialized cap checks: 5% of a verified qualifying charge, maximum 25 GHC per referral, and at most 50 qualifying rewards per inviter per rolling 30 days.
9. Replaced truncated REST-based referral statistics with a service-role-only database aggregate and removed cross-account localStorage as an authority for referral attribution state.
10. Improved referral invite copy and clipboard fallback; account-derived referral fields clear before a refresh so prior-account values do not flash after identity changes.
11. Registered both new migrations as REVIEW_REQUIRED and regenerated the canonical migration checklist, apply-order guide, and manifests.
12. Reconciled package, lockfile, app release metadata, README, current project truth, source-of-truth document, current build context and this versioned worklog to 0.338.124.
13. Repaired the misplaced top-level `verify:static` command fragment by folding it into the actual `scripts.verify:static` chain and registering the Run 397 gate.
14. Added `scripts/check-run397-membership-rewards-referral.mjs` and updated the fee/referral regression contract for the aggregate summary architecture.
15. Verified the migration inventory generator, SQL lexical integrity, release hygiene, project truth, Run 397 (16/16), registration bonus (18/18), Run 396 (17/17), membership release/foundation/session gates (16/16, 18/18, 15/15), rewards history (20/20), wallet/rewards/membership closeout (43/43), membership transformation (31/31), and fee/referral contract (10/10).
16. Ran the full `npm run verify:static` chain successfully after updating stale version-specific release assertions and classifying the prior worklog under the historical worklog archive. The full source-static verification chain exits 0 with 5,045 `PASS` lines and zero `FAIL` lines; it is not a substitute for dependency-backed typecheck/build or live Testnet acceptance.
17. Attempted `npm run prebuild:checks`; 473 checks passed before the runner stopped because the workspace has no installed `typescript` package (`ERR_MODULE_NOT_FOUND`). This is an environment/dependency blocker, not a passed prebuild or production build.

## Source-only verification scope

The new migration SQL is held for review and has not been applied to Supabase. The registration backfill has not been executed; no account received any new PI credit in this work. No Pi Testnet payment or withdrawal was executed, and referral settlement remains disabled unless the existing operator feature flag is enabled. The SQL needs clean PostgreSQL validation and target migration-history reconciliation before Testnet use.

The project requires Node.js 24.15.0 (`^24.15.0`), but this workspace provides Node 22.16.0 and has no installed project dependencies. A dependency-backed TypeScript check, lint, production build, browser/device acceptance, live Supabase verification, GitHub push and Vercel deployment are not certified by these source-level checks. `npm run prebuild:checks` is blocked by the missing installed `typescript` dependency. Production remains **NOT APPROVED**.
