# RUN383 — Testnet migration safety remediation

**Baseline:** `GREENHAVEN-0_338_111-RUN382-FULL-PROJECT-MIGRATION-AUDIT-2026-11-21.zip`
**Scope:** source-only remediation on the Testnet working baseline.
**Database actions:** none. No SQL was executed; no Supabase schema, data, migration history, Auth, Storage, or Realtime state was changed.
**Deployment actions:** none. No GitHub push, Vercel setting change, Preview deployment, Production change, or Mainnet change was performed.

## Changes made

1. Added `supabase/TESTNET_RELEASE_GATE.json` as an explicit, fail-closed Testnet release evidence register. Its initial state is `BLOCKED`, with no approved migrations. It records the unresolved target-history conflict, missing PostgreSQL rehearsal, 121 semantic repeated-object reviews, and the two legacy proposal migrations that must stay excluded.
2. Added `scripts/check-testnet-migration-release-gate.mjs` and `npm run check:testnet-migration-release-gate`. The gate verifies exact target-history evidence, PostgreSQL clean-install and upgrade replay, restore/rollback evidence, per-migration approval evidence, SHA-256 pins, canonical filenames, predecessor coverage, and operator eligibility. It rejects the two legacy proposal migrations and any migration whose current operator disposition is not `REVIEW_THEN_APPLY`.
3. Corrected the RUN382 report's proposal count from 13 to 12. The repository contains 12 files in `supabase/proposals/`.
4. Added the RUN383 remediation section to the RUN382 report.

## Verification

- `node --check scripts/check-testnet-migration-release-gate.mjs` — PASS.
- `node scripts/check-clean-migrations.mjs` — PASS, 231 unique canonical migrations.
- `node scripts/check-migration-duplicate-integrity.mjs` — PASS for structural integrity; emits the expected **BLOCK bulk apply** warning because two legacy proposal migrations remain in canonical history.
- `node scripts/check-migration-source-manifest.mjs` — PASS, 231/231 synchronized.
- `node scripts/check-migration-release-readiness.mjs` — PASS for static chronology only.
- `node scripts/check-testnet-migration-release-gate.mjs` — expected FAIL-CLOSED result while the release register remains BLOCKED. It reports missing target reconciliation, PostgreSQL rehearsal/restore evidence and individually approved hash-pinned candidates.

## Deliberately not changed

Historical SQL migration bytes were not edited, deleted, moved, renumbered or reordered. This is intentional: older Testnet snapshots conflict with the currently connected target's empty migration history, so altering canonical history could create a second source of drift. The two legacy proposal migrations remain in the historical canonical directory but are hard-excluded by the release gate. The generated all-in-one installer remains unsuitable for unattended execution.

No claim is made that the 94 validation holds, one approval hold, 13 historical Testnet-only entries, or 121 repeated-object groups have been resolved. Those require semantic review and PostgreSQL execution against a disposable environment. This remediation makes unsafe release behavior harder; it does not substitute for the missing database-engine evidence.

## Next required work

1. Reconcile the exact Supabase project ref and migration history against a fresh read-only target export and explain the empty-history conflict.
2. Provision Node `24.15.x`, pinned dependencies, Supabase CLI and an isolated disposable Supabase/PostgreSQL environment.
3. Build complete object-level dependency edges, including types, views, functions, triggers, extensions, Storage, Auth, Realtime and scheduled jobs.
4. Compare every repeated function's signature, body, `SECURITY DEFINER` status, `search_path`, owner and EXECUTE grants; prioritize ledger, transfer, identity, payout and withdrawal/PIN RPCs.
5. Rehearse a clean install and supported upgrade paths, test rollback/restore, run application feature regressions and capture evidence.
6. Populate the release gate only with individually approved, hash-pinned migrations after the above evidence exists. Apply one approved migration at a time to Testnet only after explicit release approval.
