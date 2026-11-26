# RUN437 — Phase 3 reproducible Testnet reconciliation pack

**Working candidate:** `gh-connect@0.338.149` / RUN437  
**Baseline inspected:** RUN435 / `0.338.148`  
**Target:** GreenHaven Testnet only (`jhlsjnmfpakvibuuoygx`)  
**Execution mode:** source-only plus read-only SQL diagnostics

## Purpose

RUN437 makes the outstanding Testnet migration-effect checks reproducible without changing the database. It adds a catalog diagnostic SQL pack for the seven source migrations with missing history rows, the five version/name drifts and duplicate RUN406 history entry, plus identity/session functions and RUN429 invitations.

The SQL file contains only `SELECT`/`WITH` statements. It checks:

- The 17 RUN384 foreign-key index names.
- The expected RUN384 and RUN390 `service_role` table privileges and separate `anon`/`authenticated` denials.
- Presence and execute ACLs for RUN388 research quota, RUN396 payout history, RUN405 registration backfill, RUN429 invitation RPCs and the proposed session-cap RPC.
- RUN429 invitation-table RLS and intentionally denied direct table access.
- Duplicate migration history names and the recent history tail.

## Safety and interpretation

Run this file only after verifying the SQL editor is connected to the named Testnet project. It is diagnostic, not a migration. It does not modify migration history, invoke business RPCs, backfill accounts, grant privileges, enable session caps, move PI/GHC value, or touch Mainnet.

A `PRESENT` object is not proof that a source migration executed. Exact SQL provenance requires comparing source SQL with catalog definitions, ACLs, dependency state and trusted migration records. A missing object is not permission to apply a migration without dependency, data-impact and clean-database rehearsal.

RUN405 registration backfill must not be invoked during this reconciliation. RUN429 invitation RPCs must not be called as part of diagnostics. `gh_session_issue_with_cap` remains proposal-only and disabled until PostgreSQL 17 concurrency, rollback, idempotency and two-account tests pass.

## Verification

- RUN437 source contract: 8/8 PASS.
- Full `npm run verify:static` on the materialized RUN435 source: exit 0, 5,322 PASS lines, zero FAIL lines.
- Project Node requirement: `^24.15.0`; current execution environment is Node `22.16.0`. The Node runtime gate correctly blocks prebuild, dependency install, typecheck, lint and production build.
- No disposable PostgreSQL runtime or Docker is available in this workspace. No SQL was executed against Testnet by RUN437.

## Remaining Phase 3 gates

1. Execute the read-only diagnostic SQL against the intended Testnet project and capture its complete result set.
2. Create/use an authorized disposable PostgreSQL 17 environment for clean migration replay and concurrency/rollback tests.
3. Reconcile each of the seven missing effects, five drifted records and duplicate RUN406 record using exact SQL and catalog evidence. Do not repair or replay history by filename alone.
4. Test session-cap concurrency, financial duplicate/idempotency/timeout/restart semantics, and two-account isolation.
5. Run Node 24.15.x clean install, typecheck, lint, production build and dependency audit.
6. Collect separate read-only Mainnet evidence; Mainnet remains not approved.

**Decision:** RUN437 improves reproducibility and safety of Phase 3 reconciliation. It does not close the database/runtime acceptance gates. Phase 3 remains not approved for operational closeout; Phase 4 remains on hold.

## Live Testnet diagnostic execution — 26 November 2026

The catalog probes were subsequently executed as read-only SQL against the named Testnet project `jhlsjnmfpakvibuuoygx`:

- **RUN384 indexes:** 0 of the 17 expected index names are present. All 17 are absent.
- **RUN384/RUN390 server grants:** 17 expected `service_role` table-privilege entries are missing; 8 checked entries are present. The checked `anon` and `authenticated` privileges remain denied. This is not permission to grant them directly; first rehearse the exact migration and confirm each route's required operation.
- **RUN388:** research quota RPC is absent.
- **RUN396:** payout-history RPC is absent.
- **RUN405:** registration backfill RPC is present and executable by `service_role`; `anon` and `authenticated` execution are denied. This confirms function presence/ACL only, not the safety or correctness of invoking a backfill. It was not invoked.
- **RUN429:** invitation table and all three invitation RPCs are absent.
- **Session cap:** proposed `gh_session_issue_with_cap` remains absent.
- **Migration history:** duplicate `run406_server_read_privilege_reconciliation` remains recorded twice at versions `20261125075911` and `20261125075936`.

A first diagnostic query that attempted `has_table_privilege` on the absent RUN429 table returned PostgreSQL `42P01` (relation does not exist). The probe was corrected to guard privilege inspection with `CASE` on `to_regclass`; the corrected read-only query confirmed the table and all three RPCs are absent. No writes occurred.

These observations confirm the source-vs-Testnet effects for the inspected objects. They do not prove the full SQL compiles on a clean database or that the missing migrations can safely be replayed in sequence. Keep the seven migration files held pending disposable PostgreSQL rehearsal and exact dependency/effect review.
