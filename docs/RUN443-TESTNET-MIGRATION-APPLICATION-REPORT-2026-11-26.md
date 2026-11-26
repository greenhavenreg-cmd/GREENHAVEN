# RUN443 — Testnet migration application closeout

**Date:** 26 November 2026  
**Candidate:** `gh-connect@0.338.155` / RUN443  
**Accepted source baseline:** `0.338.139` / RUN426  
**Target:** Supabase Testnet `jhlsjnmfpakvibuuoygx` (`eu-west-1`, PostgreSQL 17.12)  
**Scope:** Complete the four migrations previously held in RUN442; apply one at a time, include the RUN441 Community lock-order correction, and perform catalog/ACL/runtime smoke postflight.

## Result

**All four previously held migration operations were applied successfully.** Combined with the three RUN442 applications, seven migrations in this reconciliation sequence are now installed on Testnet. The Supabase project remained `ACTIVE_HEALTHY`.

| Source migration | Generated Testnet history version | Result | Verified evidence |
|---|---:|---|---|
| RUN388 `20261124150000_run388_research_atomic_schedule_quota.sql` | `20261126161545` | Applied | Research project/response schema and unique `(project_id, submission_key)` index preflighted; RPC exists, is `SECURITY DEFINER`, pinned to `pg_catalog, public`, and executable only by `service_role`; invalid-input and missing-project smoke checks returned expected errors. |
| RUN396 `20261125120000_run396_pi_payout_history_rpc.sql` | `20261126161553` | Applied | Payout table and all projection columns verified; RLS enabled; RPC owner is `postgres`, pinned search path, service-role-only execution; bounded non-existent-owner query returned an empty list. |
| RUN405 `20261125150000_run405_registration_backfill_account_discovery.sql` | `20261126161603` | Applied | Existing bounded backfill function replaced; all eight account-root columns verified as `text`; `SECURITY DEFINER`, pinned search path and service-role-only execution verified; incorrect confirmation returned `TESTNET_CONFIRMATION_REQUIRED`. **Backfill not invoked.** |
| RUN429 `20261126090001_run429_durable_community_invitations.sql` + RUN441 correction | `20261126161651` | Applied | Invitation table, three indexes, RLS deny-client policy and three service-role-only RPCs verified. Corrected acceptance RPC locks Community before Invitation. Missing-community, non-existent-invitation and bounded-empty-inbox smoke checks returned expected results. |

## Security and data-safety checks

- All six new/updated RPCs are owned by `postgres`, use `SECURITY DEFINER`, pin `search_path=pg_catalog, public`, allow `service_role` execution and deny `anon`/`authenticated` execution.
- `gh_community_invitations` has RLS enabled and one deny-all policy. Direct SELECT is denied to `anon`, `authenticated` and `service_role`; access is through the SECURITY DEFINER RPCs only.
- RUN396 payout history returns only the bounded owner-scoped projection: id, status, gross/fee/net atomic amounts, network, provider transaction ID and timestamps. It does not expose recipient UID, recipient wallet address, provider receipt or idempotency key.
- RUN405 was only installed/replaced. The bounded backfill RPC was not invoked; no registration credits, wallet balances, ledger entries or provider state were changed in this increment.
- RUN429 Community invitation operations were smoke-tested only with non-existent identifiers or empty inboxes. No real invitations, memberships, notifications or Messenger memberships were created.
- RUN388 was smoke-tested only with invalid input and a non-existent project. No response rows were inserted.
- No Testnet transaction fixture was inserted; no live financial or user data was altered.

## Migration history status

After RUN443, Testnet reports **247 migration-history rows and 246 distinct migration names**. The name `run406_server_read_privilege_reconciliation` still appears twice at versions `20261125075911` and `20261125075936`.

The seven RUN442/RUN443 operations were recorded with generated versions rather than their original source timestamps:

| Logical migration | Source version | Generated Testnet version |
|---|---:|---:|
| RUN384 FK indexes | `20261124110000` | `20261126153605` |
| RUN384 REST grants | `20261124120000` | `20261126153609` |
| RUN390 read grants | `20261124143000` | `20261126153614` |
| RUN388 research quota | `20261124150000` | `20261126161545` |
| RUN396 payout history | `20261125120000` | `20261126161553` |
| RUN405 registration discovery | `20261125150000` | `20261126161603` |
| RUN429 invitations (corrected) | `20261126090001` | `20261126161651` |

The generated rows establish that these operations were submitted through the Supabase migration tool, but they do not restore exact source-version identity. The existing RUN383/RUN397/RUN406/RUN407 history drift and duplicate RUN406 row remain. A matching row count is not proof of one-to-one source/history equivalence. **Do not run `supabase db push`, `migration repair`, manual history edits, replay, squash or re-versioning** until every source/history mapping and actual database effect is reconciled. No available supported migration-repair action was used.

## Advisors after RUN443

- Security Advisor: 37 INFO `rls_enabled_no_policy` findings. These remain intentional deny-client server-only tables; no generic policies were added.
- Performance Advisor: 202 INFO `unused_index` findings. No indexes were dropped. The increase from 200 reflects newly created indexes on a low-traffic Testnet; unused status alone is not evidence for removal.
- Health Advisor: no findings returned.

## Source verification and environment defaults

- `npm run verify:static`: **63/63 gates passed**, **5,369 PASS lines**, **zero FAIL lines**.
- Focused RUN388/RUN396/RUN405/RUN429 source contracts: 16/16, 17/17, 10/10 and 17/17 respectively. Documentation hygiene, release hygiene (17/17), project truth (11/11), migration inventory synchronization (246/246), dependency-lock integrity and Phase 1–12 / Phase 12 release gates passed.
- Prebuild dry-run discovered **464 checks**. It is discovery only, not a build. Actual prebuild/typecheck/lint/production build remain blocked because the workspace is Node 22.16.0, while the project requires Node 24.15.0 and dependencies are not installed.
- Static verification exposed and corrected incomplete fail-closed environment-template defaults: Pi API mode is `PI_ENV=production` while blockchain/SDK remain Testnet via `PI_NETWORK=testnet` and `NEXT_PUBLIC_PI_SANDBOX=true`; A2U/payout/registration-bonus switches default off; RUM sampling defaults to zero; optional GHC financial features default off.

## What remains incomplete

1. Disposable PostgreSQL 17 two-connection rehearsal for RUN388 quota races/idempotency and RUN429 invite create/accept/decline, expiry, block and member-count invariants.
2. RUN396 two-account owner-isolation and field-redaction behavioral test using synthetic records.
3. RUN405 account eligibility/provenance review and a separately approved, bounded backfill plan. The backfill must not be invoked just because the migration is installed.
4. Full source/history row-by-row reconciliation, including the seven generated version mappings and duplicate RUN406 record.
5. Node 24.15.0 dependency-backed typecheck, lint, production build, and two-account Pi Browser Testnet acceptance.

These are not represented as completed. The available workspace has Node 22.16.0 and no disposable PostgreSQL/Docker runtime. The successful SQL application and smoke checks are live Testnet evidence, not a substitute for multi-connection transaction rehearsal or full application acceptance.

## Release and safety boundary

- Source inventory remains 246 migrations: 125 REQUIRED, 1 REQUIRES_APPROVAL, 2 PROPOSAL and 118 REVIEW_REQUIRED. The four migrations above are applied to this Testnet only; their classifications remain relevant to other targets. This is not permission to bulk-apply the remaining inventory.
- Phase 3 operational acceptance remains blocked; Phase 4 database concurrency and end-to-end acceptance remain pending.
- No registration backfill, payout, Pi transfer, A2U execution, GHC transfer, referral settlement or other financial operation occurred.
- Mainnet was not accessed. No GitHub push or Vercel deployment occurred.
- Accepted source baseline remains `0.338.139`; RUN443 is a review candidate, not an accepted or production-approved release.
