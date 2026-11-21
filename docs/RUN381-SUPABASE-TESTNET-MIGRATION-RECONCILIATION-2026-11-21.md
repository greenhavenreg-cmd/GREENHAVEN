# RUN381 — Supabase Testnet migration reconciliation and integration readiness

**Date:** 2026-11-21  
**Source baseline:** GreenHaven 0.338.111 (`GREENHAVEN-0_338_111-PHASE9-SESSION-INTEGRITY-METADATA-FIX-2026-11-21.zip`)  
**Target:** Supabase project `jhlsjnmfpakvibuuoygx` (Testnet integration target only)  
**Execution mode:** source audit + remote read-only inspection  
**Decision:** **NOT READY FOR MIGRATION APPLY**

## Executive result

The 231-file source migration inventory is structurally consistent, but the complete migration chain has not been proven executable on PostgreSQL and is not safe to bulk-apply. The connected Supabase project has no GreenHaven application schema and no migration-history schema/table visible to the read-only audit. The repository's classifications also contain held and proposal migrations, which Supabase CLI does not interpret as deployment controls.

No SQL migration, migration history, Supabase schema, data, GitHub branch, Vercel project, or deployment was changed in this audit.

## Live target evidence (read-only)

| Check | Result |
|---|---|
| Supabase project health | `ACTIVE_HEALTHY` (previous project status check) |
| Supabase migration API | Empty migration list (`migrations: []`) |
| `public` base tables | 0 |
| `public` views | 0 |
| `public` routines | 0 |
| `supabase_migrations` schema | Not present in the information-schema check |
| Security advisor | 0 findings |
| Performance advisor | 0 findings |

The target is an empty application-schema baseline, not an already-installed GreenHaven database. The historical RUN352/RUN302/RUN333 status snapshots are not proof of the current target's applied history. In particular, entries marked `APPLIED_TESTNET_ONLY` in older source documents conflict with the current empty live migration list and must not be assumed applied.

## Source inventory reconciliation

| Check | Result |
|---|---|
| Canonical migration files | 231 |
| Unique 14-digit versions | 231 |
| Unique SHA-256 contents | 231 |
| Unique basenames | 231 |
| Source manifest vs files | 231/231 synchronized |
| Testnet apply-order rows vs files | 231/231 synchronized |
| Duplicate/empty migration check | PASS |
| Static chronology/release check | PASS |
| Held-migration source safety suite | PASS (6/6) |
| Identity/session ACL proposal boundary | PASS (11/11) |
| SECURITY DEFINER search_path static check | PASS |

The apply-order classifications currently resolve to:

| Operator action | Count | Meaning |
|---|---:|---|
| `REVIEW_THEN_APPLY` | 120 | Candidate only; still requires exact target/dependency review and PostgreSQL rehearsal |
| `HOLD_VALIDATION` | 94 | Do not apply until validation is complete |
| `APPLIED_TESTNET_ONLY_HOLD_OTHER_TARGETS` | 13 | Historical note only; current live history does not confirm these as applied |
| `DO_NOT_APPLY` | 2 | Proposal migrations; exclude from a release |
| `HOLD_APPROVAL` | 1 | Requires explicit approval |
| `SUPERSEDED_BY_COMMUNITY_SEARCH_TESTNET_PATCH_HOLD_OTHER_TARGETS` | 1 | Superseded/target-specific; do not bulk apply |

These counts are the source apply-order dispositions, not an approved deployment batch.

## Integration blockers requiring resolution

1. **Bulk push is unsafe.** Supabase CLI considers every pending SQL file in `supabase/migrations`; it does not enforce GreenHaven's `REVIEW_REQUIRED`, `PROPOSAL`, `REQUIRES_APPROVAL`, or `HOLD_*` classifications. Do not run `supabase db push` against this target.
2. **Proposal SQL is inside the canonical migration directory and the generated installer.** `20261022010016_community_join_reasons_proposal.sql` is commented-out SQL, but `20261022010017_community_governance_log_proposal.sql` contains active `CREATE TABLE`, index, RLS, and comment statements while its disposition is `DO_NOT_APPLY`. Both are also embedded in `supabase/GREENHAVEN-CANONICAL-SUPABASE-INSTALL.sql`. A normal pending migration run or execution of that installer would execute the active proposal DDL. Do not rewrite or move these historical files until Testnet and Mainnet history impact is independently resolved; instead keep them explicitly excluded from any curated release plan.
3. **Historical target snapshots conflict with the live target.** Older docs describe applied Testnet migrations and populated schemas, while the currently connected project reports an empty migration list, zero public application objects, and no `supabase_migrations` schema. Resolve whether those older snapshots refer to another Supabase project, a prior database incarnation, or a stale target reference before using them as evidence.
4. **PostgreSQL rehearsal is unavailable in this workspace.** The archive has no `supabase/config.toml`; this runtime has no Supabase CLI, Docker/Podman, `psql`, or PostgreSQL server. Node is `22.16.0`, while the project pins Node `24.15.x`. Consequently, no clean-install replay, upgrade replay, SQL parser/database execution, extension compatibility test, or transaction/locking test was possible.
5. **Dependency graph is not proven.** Static ordering and source tests do not prove every table/function/type/trigger/policy dependency, nor do they validate the security and financial invariants across all migrations.

## Safe improvements completed

- Re-ran and verified the source migration integrity, source-manifest synchronization, release chronology, held-migration, and identity/session proposal checks.
- Hardened `scripts/check-migration-duplicate-integrity.mjs` so it explicitly detects the two legacy proposal migrations inside canonical history, verifies their `PROPOSAL` / `DO_NOT_APPLY` classification, and emits a visible bulk-apply block identifying the executable DDL in migration 17.
- Reconciled the source's 231 migration files against the live target's current empty migration history without changing either side.
- Identified the active-DDL proposal migration (`20261022010017`) that would execute despite its `DO_NOT_APPLY` classification.
- Preserved all historical migration files and their version identifiers. No migration SQL was edited, deleted, renamed, reordered, or marked applied/reverted.
- Added this target-specific integration-readiness record so the next operator does not rely on stale history snapshots or treat static checks as deployment approval.

## Required path to a safe Testnet integration

1. **Confirm target identity and history provenance.** In the Supabase Dashboard, verify that project ref `jhlsjnmfpakvibuuoygx` is the intended GreenHaven Testnet target. Export a backup/snapshot and preserve the empty-target evidence. Do not infer Mainnet state from this project.
2. **Establish a supported local toolchain.** Use Node `24.15.x`; install the pinned dependencies; install the current Supabase CLI; provision a disposable PostgreSQL/Supabase-compatible stack with the same Postgres major version and required extensions/auth/storage roles. Add and review a valid `supabase/config.toml` using the project's actual intended Auth/Storage configuration before invoking the CLI.
3. **Create a curated release plan.** Review each migration's classification and dependency chain. Explicitly exclude both proposal files, all `HOLD_VALIDATION` and `HOLD_APPROVAL` entries, target-specific historical entries, and superseded files unless separately approved. Do not solve this by silently editing historical migration files.
4. **Rehearse from empty state.** Apply only the approved candidate set to a disposable database in dependency order. Stop on the first SQL error. Validate object definitions, RPC signatures, grants, RLS policies, indexes, constraints, triggers, extension prerequisites, and postflight assertions after each logical batch.
5. **Run focused regression tests.** Include Pi identity/session creation and retrieval, feed read paths, messaging, media authorization, marketplace inventory/payment state transitions, GHC ledger idempotency, withdrawal/PIN recovery, payout fencing, A2U network isolation, and negative authorization/replay cases. No provider payment, reward issuance, or payout should be triggered as part of schema rehearsal.
6. **Approve Testnet batch explicitly.** Produce a version/hash-pinned ordered batch with preflight and postflight SQL and a recovery plan. Only then apply that batch to Testnet, one controlled unit at a time, and record the exact applied versions. Mainnet requires an independent history/schema reconciliation and separate approval.
7. **Verify remote history and advisors.** After an approved application, verify the migration history, object-level postflight checks, security/performance advisors, and app-level acceptance tests. Never use `migration repair` to make history look correct unless the actual schema state independently proves the corresponding SQL is already present.

## Explicitly prohibited until the above gates pass

- No `supabase db push` against the current 231-file directory.
- No `supabase db reset --linked` or any remote reset/drop.
- No bulk `migration repair`, fake applied markers, or manual edits to migration history.
- No applying the canonical all-in-one installer or reset SQL to the live project.
- No Mainnet/Production changes.
- No changes to wallet, ledger, payout, Pi provider, RLS, or ACL safeguards to make a migration pass.

## Verification commands already run

```bash
node scripts/check-migration-duplicate-integrity.mjs
node scripts/check-migration-source-manifest.mjs
node scripts/check-migration-release-readiness.mjs
node scripts/test-held-migrations-readiness.mjs
node scripts/check-run375-identity-session-acl-proposal.mjs
```

All completed successfully as source checks. The migration-integrity check now additionally emits an intentional `BLOCK bulk apply` warning because the legacy proposal DDL is still in the canonical set. These are repository/static checks only; they do not substitute for PostgreSQL integration testing.
