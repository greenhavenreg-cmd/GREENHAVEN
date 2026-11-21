# RUN382 — Full GreenHaven project and migration reconciliation audit

**Audit date:** 2026-11-21  
**Source baseline:** GreenHaven 0.338.111 / Phase 9 session-integrity metadata fix  
**Target reviewed:** Supabase Testnet project `jhlsjnmfpakvibuuoygx` (read-only)  
**Scope:** Full archive inventory, source governance, all 231 canonical SQL migration files, proposal boundary, dependency/repeated-object evidence, static RLS/ACL/security checks, and live target migration/advisor status.  
**Decision:** **NOT CLEARED FOR SUPABASE INTEGRATION.**

## 1. Executive conclusion

The archive contains **2,821 files**. The project is a large Next.js/TypeScript application with application routes, reusable components, feature modules, contexts, domain/server libraries, scripts, documentation, E2E tests, and Supabase SQL. The migration source inventory contains **231 canonical SQL migrations** plus **12 proposal SQL files**. All canonical migration versions, filenames, hashes, manifest entries and apply-order rows are structurally synchronized.

This is not yet a clean, executable, approved database release. The SQL has not been replayed against a supported PostgreSQL/Supabase environment. The current connected Supabase project has no GreenHaven migration history or public application objects. In addition, proposal SQL remains inside canonical migration history and there are unresolved review/approval classifications. A standard Supabase CLI bulk push would not honor these classifications.

**No migration SQL was rewritten, deleted, renumbered, reordered, marked applied, or executed. No Supabase schema/data/history was changed. No GitHub push, Vercel change, or deployment was performed.** Historical migration bytes are preserved.

## 2. Project inventory and architecture map

- Total files in archive: **2,821**.
- Main code surfaces: `app/` routes and API handlers; `components/` UI; `features/` feature modules; `contexts/` shared session/identity/app state; `lib/` domain, server, security, payment, feed and integration services.
- Database assets: `supabase/migrations/`, `supabase/proposals/`, canonical installer, validation SQL, Testnet apply-order guide, and recovery/reconciliation scripts.
- Quality assets: `scripts/` source gates and test harnesses; `e2e/` browser acceptance tests; `docs/` architecture, operational truth, migration history, and release records.
- Package engine requires Node `^24.15.0`; this audit runtime has Node `22.16.0`, and dependencies are not installed in this workspace.

The audit used the project source-of-truth policy: historical migration files are immutable; source code is authoritative for implemented behavior; Testnet Preview is the only permitted application environment; Mainnet/Production remain outside scope.

## 3. Migration inventory reconciliation

| Check | Result |
|---|---:|
| Canonical migrations | 231 |
| Unique 14-digit versions | 231 |
| Unique SHA-256 digests | 231 |
| Unique basenames | 231 |
| Manifest rows synchronized | 231/231 |
| Testnet apply-order rows synchronized | 231/231 |
| Repeated object review entries | 121 |
| Proposal SQL files | 12 |

### Source classification counts

- `PROPOSAL`: 2
- `REQUIRED`: 122
- `REQUIRES_APPROVAL`: 1
- `REVIEW_REQUIRED`: 106

### Testnet operator disposition counts

- `APPLIED_TESTNET_ONLY_HOLD_OTHER_TARGETS`: 13
- `DO_NOT_APPLY`: 2
- `HOLD_APPROVAL`: 1
- `HOLD_VALIDATION`: 94
- `REVIEW_THEN_APPLY`: 120
- `SUPERSEDED_BY_COMMUNITY_SEARCH_TESTNET_PATCH_HOLD_OTHER_TARGETS`: 1

These are source governance labels, not deployment authorization. `REVIEW_THEN_APPLY` is still a candidate requiring exact dependency review, clean-install replay, postflight and explicit Testnet approval. `HOLD_*`, `PROPOSAL`, superseded and historical target-only entries must not be blindly applied.

## 4. Structural risk review across all migration files

The generated structural inventory reports the following SQL signals. Counts are statement/declaration detections, not a defect count:

- `CREATE TABLE`: 179
- `ALTER TABLE`: 257
- function declarations: 483 in the structural inventory; an independent search-path checker examined 461 `SECURITY DEFINER` definitions in its own parsing scope.
- `SECURITY DEFINER`: 497 structural signals
- `CREATE POLICY`: 159
- `ENABLE ROW LEVEL SECURITY`: 165 statements
- `FORCE ROW LEVEL SECURITY`: 0 statements
- `DROP` signals: 184
- `DELETE` signals: 43
- `UPDATE` signals: 394
- dynamic SQL execution signals: 8
- `GRANT` signals: 588
- `REVOKE` signals: 593
- trigger declarations: 25

Migration-level review flags:
- `REVIEW_DATA_MUTATION`: 136 migration files
- `REVIEW_DESTRUCTIVE_DDL`: 91 migration files
- `REVIEW_DYNAMIC_SQL`: 5 migration files
- `REVIEW_EXTENSION_PREREQUISITE`: 1 migration files
- `REVIEW_FUNCTION_ACL_EVIDENCE`: 14 migration files
- `REVIEW_SECURITY_DEFINER_SEARCH_PATH`: 6 migration files
- `REVIEW_STORAGE_DEPENDENCY`: 1 migration files
- `REVIEW_TABLE_RLS_CONTEXT`: 1 migration files
- `REVIEW_TRIGGER_ORDER_AND_SIDE_EFFECTS`: 16 migration files

Static RLS checker result: 176 executable table names have explicit RLS enablement across canonical migrations plus 12 held proposals; 139 tables have policy definitions; 37 no-policy tables are allowlisted for operator/service-role review. This is a static source result only. It does not prove live grants, policy correctness, service-role isolation, or deployed state. The absence of `FORCE ROW LEVEL SECURITY` is not automatically a defect because service-role and table-owner bypass semantics must be assessed against the actual design.

## 5. Material blockers and high-risk items

### A. Proposal migrations are still in canonical history

- `20261022010016_community_join_reasons_proposal.sql` is classified `PROPOSAL` / `DO_NOT_APPLY`.
- `20261022010017_community_governance_log_proposal.sql` is also classified `PROPOSAL` / `DO_NOT_APPLY`, but contains executable table/index/RLS DDL.
- Both appear in the canonical installer as well as `supabase/migrations/`.

Supabase CLI does not interpret GreenHaven's classification metadata. A normal `db push` or execution of the all-in-one installer can execute the active DDL in migration 17. Preserve historical bytes; the eventual release process must explicitly construct a curated, hash-pinned migration set and must not include these two files.

### B. Unresolved migration classifications

The source has 94 `HOLD_VALIDATION` entries, 1 `HOLD_APPROVAL` entry, 2 `DO_NOT_APPLY` entries, 1 superseded target-specific entry, and 13 historical Testnet-only entries. These classifications must be reconciled individually; do not convert them into a single bulk batch.

### C. Dependency graph is incomplete

The existing dependency audit explicitly states that the full dependency graph remains open. It covers selected critical chains, not all cross-migration dependencies. Full verification still needs to include functions, tables, types, triggers, extensions, Storage buckets/policies, Auth objects, Realtime publication membership, scheduled jobs and external prerequisites.

### D. Semantic review is still needed for repeated declarations

The repeated-object inventory contains 121 object groups. Repeated `CREATE OR REPLACE FUNCTION`, indexes, constraints or policies can represent legitimate forward evolution, compatibility fixes or accidental overwrite. The byte-level duplicate check does not prove semantic equivalence. In particular, ledger, transfer, wallet, payout, PIN recovery, marketplace order, identity and community function chains need signature/body/ACL behavior comparison on a clean database and target catalog.

### E. SQL features requiring database-engine rehearsal

- Eight dynamic SQL execution signals across flagged files require identifier/argument safety and role-context validation.
- The extension-dependent evidence migration explicitly installs `pgcrypto` in schema `extensions`; the target must prove the extension exists in the expected schema and that function references resolve.
- The withdrawal/PIN repair migrations alter identity-column types and drop legacy foreign keys conditionally; verify row preservation, lock impact, dependent constraints and Pi identity compatibility.
- The server-only ACL hardening migration changes execution privileges for all existing `SECURITY DEFINER` routines in `public` and changes default privileges. Its effect on every app RPC must be enumerated before release.
- Trigger-bearing financial and evidence migrations require ordering, recursion, atomicity, failure and retry tests.

### F. Current target history conflicts with historical snapshots

The live Supabase API currently reports `migrations: []`; live information-schema checks report zero public base tables, zero public views, zero public routines, and no `supabase_migrations` schema. Older repository snapshots claim selected migrations were applied to Testnet. Those snapshots cannot be used as proof of this target's current state. Confirm the project ref and explain the discrepancy before applying anything.

## 6. Live Supabase read-only checks

| Check | Current result |
|---|---|
| Project reference | `jhlsjnmfpakvibuuoygx` |
| Migration list | Empty |
| Public base tables | 0 |
| Public views | 0 |
| Public routines | 0 |
| `supabase_migrations` schema | Not present in information-schema check |
| Security advisor | 0 findings |
| Performance advisor | 0 findings |
| Health advisor | 0 findings |

A clean advisor result on an empty application schema is not evidence that GreenHaven's future schema will pass those checks.

## 7. Source verification executed

The following source/static checks passed:

- `check-clean-migrations`: 231 unique 14-digit SQL migrations.
- `check-migration-duplicate-integrity`: 231 unique versions, digests and basenames; explicit bulk-apply block for legacy proposal DDL.
- `check-migration-release-readiness`: static chronology checks passed; it explicitly warns lexical order is not applied status.
- `check-migration-source-manifest`: 231/231 source manifest, verified manifest, checklist and Testnet guide synchronized.
- `check-phase23-migration-integrity`: 461 `SECURITY DEFINER` definitions checked for fixed search_path.
- `test-held-migrations-readiness`: 6/6 held migration checks passed; PostgreSQL rehearsal still required.
- `check-run375-identity-session-acl-proposal`: 11/11 proposal-boundary checks passed.
- `audit-migration-structure`: structural inventory regenerated; no database execution.
- `generate-migration-inventory`: checklist, verified manifest, source manifest and apply-order guide synchronized.
- `check-database-contract-source`: 170 executable GreenHaven tables identified across 231 migrations.
- `check-database-rls-coverage`: static RLS checks passed with 37 allowlisted no-policy tables requiring operator/service-role review.
- `check-phase2-economy-database-boundaries`: 10/10.
- `check-phase3-database-recovery`: 25/25.

Not run: Node 24.15 dependency-backed install, complete TypeScript/lint/build/prebuild, PostgreSQL parser, Supabase local stack, clean-install replay, upgrade replay, schema dump comparison, live Testnet migration, browser Pi auth E2E, or device acceptance. Current runtime Node 22.16.0 is below the package engine requirement and no `node_modules`, Supabase CLI, Docker/Podman, `psql`, or PostgreSQL server is available.

## 8. Required gates before the phrase “clean and ready” is accurate

1. Confirm the exact Testnet Supabase project reference and reconcile the empty live migration history against every historical snapshot.
2. Establish Node 24.15.x, pinned dependencies, current Supabase CLI and a disposable Supabase/PostgreSQL stack matching target Postgres major version and extensions.
3. Build a complete dependency graph and classify every migration into an approved release set, hold, proposal, superseded or already-applied (only with live catalog proof).
4. Resolve the two proposal migrations without rewriting historical bytes; create a curated, immutable, version/hash-pinned deployment directory that excludes all held/proposal/superseded entries.
5. Rehearse clean install from empty state, plus every supported upgrade path, stopping on first SQL error.
6. Compare pre/post schema catalogs, function signatures and bodies, owners, grants, default privileges, RLS policies, indexes, constraints, triggers, extensions, Storage policies, Realtime and cron jobs.
7. Run negative authorization tests and feature regressions for Pi identity/session, feed/profile, media, messaging, community, marketplace, GHC ledger, wallet, PIN recovery, payouts and A2U network fencing. Use disposable identities and provider test credentials; do not execute real money movement.
8. Review every held migration and repeated-object group; approve each individually with a rollback/recovery plan.
9. Apply only the approved batch to Testnet, one controlled unit at a time, after explicit authorization. Verify postflight SQL, advisors, app E2E and recorded migration history.
10. Keep Mainnet/Production isolated; require a separate history/schema reconciliation and approval.

## 9. Explicit non-actions

- No `supabase db push`, `db reset --linked`, `migration repair`, manual history insert, or remote SQL migration execution.
- No Supabase schema/data/history changes.
- No Mainnet/Production changes.
- No GitHub commit/push or Vercel environment/deployment changes.
- No edits to historical migration SQL or financial/security safeguards.

## 10. Detailed audit matrix

`RUN382-MIGRATION-BY-MIGRATION-REVIEW-MATRIX-2026-11-21.csv` contains one row per canonical migration with version, classification, operator disposition, SHA-256, structural operation counts, security signals and review flags. It is the exact file-level reconciliation index for the next database rehearsal.

**Final status: source inventory reconciled and static checks passed; full PostgreSQL compatibility, semantic dependency review and Testnet release approval remain open. Do not integrate yet.**


## 10. RUN383 fail-closed release remediation

A fail-closed release gate has been added at `scripts/check-testnet-migration-release-gate.mjs`, with its initial blocked evidence register at `supabase/TESTNET_RELEASE_GATE.json` and npm command `npm run check:testnet-migration-release-gate`. It requires: (1) exact target migration-history reconciliation, (2) a passing PostgreSQL clean-install and upgrade replay, (3) verified restore/rollback evidence, (4) explicit per-migration approval and SHA-256 pinning, and (5) every declared predecessor to be included in the approved batch or verified applied on this exact target. The two legacy proposal migrations are hard-excluded.

The release gate is intentionally **BLOCKED** until evidence is supplied. It does not run SQL, modify the database, or imply that the remaining review holds have passed. The proposal inventory count in this report is corrected to 12. Historical migration SQL bytes remain unchanged.
