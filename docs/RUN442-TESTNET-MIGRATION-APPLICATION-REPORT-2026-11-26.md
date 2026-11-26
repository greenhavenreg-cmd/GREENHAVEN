# RUN442 — Testnet migration reconciliation and controlled application

**Date:** 26 November 2026  
**Candidate:** `gh-connect@0.338.154` / RUN442  
**Accepted source baseline:** `0.338.139` / RUN426  
**Target:** Supabase Testnet `jhlsjnmfpakvibuuoygx` (`eu-west-1`, PostgreSQL 17.12)  
**Target status before work:** `ACTIVE_HEALTHY`  
**Scope:** read-only migration/history/catalog preflight, three reviewed additive migrations, postflight verification. Mainnet was not accessed.

## Result

**Result: 3 migrations applied and postflight-verified.**

The connected Testnet was confirmed as project `jhlsjnmfpakvibuuoygx` and PostgreSQL 17.12. The following three source migrations were applied individually through the Supabase migration tool after target-specific preflight. Each operation returned success.

| Source migration | Generated Testnet history version | Result | Postflight |
|---|---:|---|---|
| `20261124110000_run384_research_foreign_key_indexes.sql` | `20261126153605` | Applied | All 17/17 expected indexes exist and are valid; all 17 target FKs were confirmed; eight affected tables had zero rows before application. |
| `20261124120000_run384_server_rest_table_grants.sql` | `20261126153609` | Applied | All 13/13 table grant contracts verified; RLS enabled; anon/authenticated SELECT denied; no service_role DELETE grants. |
| `20261124143000_run390_marketplace_membership_feed_read_grants.sql` | `20261126153614` | Applied | Migration's internal assertions passed; four target tables retain RLS and client SELECT denial, service_role SELECT present. |

These operations changed schema/index metadata and table privileges only. They did not issue credits, execute payouts, transfer Pi, change ledger rows, or alter user data.

## Important migration-history caveat

The Supabase migration tool generated history versions `20261126153605`, `20261126153609`, and `20261126153614`; it did not record the original source timestamps `20261124110000`, `20261124120000`, and `20261124143000`. The canonical source files therefore remain version-drifted relative to Testnet history even though their SQL effects are installed and verified.

Do not run `supabase db push`, `migration repair`, replay, squash, or manual history edits until the full source/remote migration history has been reconciled. Do not replay these three source files by assumption. The generated-version mapping above is the current evidence of application.

## Current source/history reconciliation

- Canonical source inventory: **246** SQL files — 125 REQUIRED, 1 REQUIRES_APPROVAL, 2 PROPOSAL, 118 REVIEW_REQUIRED.
- Testnet migration history after RUN442: **243** rows.
- Exact `(version, normalized migration name)` source matches: **234**.
- Four source migrations remain without a corresponding Testnet migration-history entry and are held:
  1. `20261124150000_run388_research_atomic_schedule_quota.sql`
  2. `20261125120000_run396_pi_payout_history_rpc.sql`
  3. `20261125150000_run405_registration_backfill_account_discovery.sql`
  4. `20261126090001_run429_durable_community_invitations.sql`
- Eight logical migrations have source/history version drift: RUN383 identity privacy grants; RUN407 earnings-ledger privileges; RUN397 registration bonus; RUN397 referral quality caps; RUN406 server-read privilege reconciliation; RUN384 research FK indexes; RUN384 server REST grants; RUN390 marketplace/membership/feed read grants.
- RUN406 remains duplicated by name at remote versions `20261125075911` and `20261125075936`. Do not delete or rewrite either record without full effect/provenance proof.

## Why four pending migrations remain held

| Migration | Reason held |
|---|---|
| RUN388 Research quota RPC | Write-path SECURITY DEFINER function. Needs PostgreSQL 17 clean replay, quota-boundary, duplicate submission, concurrent project-lock and rollback tests. |
| RUN396 Pi payout history RPC | Financially sensitive owner-scoped projection. Needs clean replay, exact table/column contract, service-role ACL, caller ownership isolation and response-redaction tests. |
| RUN405 registration backfill | Existing RPC is present but has a different catalog fingerprint from the current source. Replacing it changes account-discovery scope for a function that can invoke the idempotent PI registration-credit claim. Needs exact definition review and bounded synthetic-account rehearsal; do not invoke during reconciliation. |
| RUN429 Community invitations | Table/RPC absent. The source migration has a Community→Invitation lock-order defect identified in RUN441; the correction remains a held proposal. Incorporate the correction into a reviewed migration and rehearse concurrent create/accept/decline, block changes, expiry, idempotency, member counts and notification dedupe before applying. |

No migration-history repair or backfill invocation was performed. The RUN405 existing function was not called. The RUN429 invitation RPCs were not invoked.

## Postflight evidence

- RUN384 index checks: **17/17 PASS**.
- RUN384 service-role grant checks: **13/13 PASS**.
- RUN390 internal privilege assertions: **PASS**.
- Migration history count: **243 rows**, with three new generated versions listed above.
- Supabase Security Advisor: one INFO category, `rls_enabled_no_policy`, count **37**. These are intentional server-only deny-client tables; no generic policies were added.
- Supabase Performance Advisor: one INFO category, `unused_index`, count **200**. No index was dropped; unused status on low-traffic Testnet is not sufficient evidence for removal.
- Supabase Health Advisor: no findings returned.
- RUN388 function absent; RUN396 function absent; RUN429 invitation table and three RPCs absent.
- RUN405 function present with a catalog definition fingerprint different from the current source implementation; held for controlled replacement review.

## Safety boundary

- No Mainnet project was accessed.
- No Pi provider transfer, A2U payout, GHC transfer, registration backfill, referral settlement, wallet credit or other financial action was executed.
- No GitHub push or Vercel deployment was performed.
- Phase 3 operational acceptance remains blocked; Phase 4 is source-hardened but not operationally accepted.
- The three applied migrations are not evidence of full Testnet application acceptance or production readiness.

## Next steps

1. Reconcile the eight source/history version drifts and duplicate RUN406 history row using catalog and trusted migration evidence; do not repair history by assumption.
2. Correct RUN429 lock ordering in the canonical migration source before a disposable PostgreSQL 17 rehearsal.
3. Run the four held migrations through disposable PostgreSQL 17 clean replay and targeted behavioral/ACL tests.
4. Apply each remaining migration separately only after its preflight passes; postflight every schema object, grant and RPC.
5. Re-run Supabase advisors and two-account Testnet feature acceptance.
6. Keep Mainnet and production approval separate.
