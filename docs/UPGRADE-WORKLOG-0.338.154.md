# GreenHaven upgrade worklog — 0.338.154 / RUN442

**Date:** 26 November 2026  
**Parent candidate:** `0.338.153` / RUN441  
**Scope:** Testnet migration reconciliation and controlled application; no product-code changes.

## Execution sequence

1. Confirmed the connected Supabase Testnet project reference and ACTIVE_HEALTHY PostgreSQL 17.12 status.
2. Read the live migration history and compared it with the 246-file canonical source inventory.
3. Preserved the five pre-existing source/history version drifts and duplicate RUN406 history record without repairing or replaying them.
4. Preflighted all 17 RUN384 FK targets, exact FK columns, table existence and named-index absence.
5. Verified all eight affected research/evidence tables were empty before adding indexes.
6. Applied the 17-index RUN384 migration as one versioned migration operation.
7. Preflighted 13 RUN384 service-role grant targets, RLS state and anon/authenticated client-deny privileges.
8. Applied and postflight-verified the 13 least-privilege server REST table grants.
9. Verified all four RUN390 read-grant targets, RLS and current service_role/client privilege state, then applied the idempotent grant migration.
10. Re-read migration history, checked all 17 indexes and 13 grants, checked held RPC/table absence and ran Supabase Security, Performance and Health Advisors.

All checks are **source-level verification scope** unless explicitly identified as live Testnet catalog postflight. No PostgreSQL concurrency rehearsal was claimed.

## Applied to Testnet

Target verified immediately before DDL: Supabase project `jhlsjnmfpakvibuuoygx`, region `eu-west-1`, PostgreSQL 17.12, status `ACTIVE_HEALTHY`.

Three additive migrations were applied individually and returned success:

1. RUN384 17 research/evidence FK indexes — generated history version `20261126153605`; postflight 17/17 valid indexes, all matching FK constraints, eight affected tables were empty before application.
2. RUN384 least-privilege server REST grants — generated history version `20261126153609`; postflight 13/13 exact grant contracts, RLS retained, anon/authenticated SELECT denied, no service_role DELETE.
3. RUN390 server read grants — generated history version `20261126153614`; migration's internal assertions passed; RLS and client-deny posture retained.

The Supabase migration tool records generated timestamps, not the original source migration versions. The original source files remain version-drifted; no migration-history repair or source replay was attempted.

## Pending / held

Four source migrations remain unrecorded and were not applied:

- RUN388 Research quota RPC — needs PostgreSQL 17 concurrency, idempotency and rollback rehearsal.
- RUN396 Pi payout history RPC — needs owner-scope, field-redaction and ACL rehearsal.
- RUN405 registration backfill — existing RPC definition differs from source; replacement can affect PI registration-credit account discovery. It was not invoked.
- RUN429 Community invitations — absent; source has a known lock-order inversion corrected only in a held RUN441 proposal. Do not apply until canonical correction and PostgreSQL 17 concurrency rehearsal.

The canonical inventory still classifies 118 migrations REVIEW_REQUIRED, one REQUIRES_APPROVAL and two PROPOSAL. This is not permission to bulk-apply them. No Mainnet changes.

## Postflight

- Testnet history rows: 243.
- RUN384 indexes: 17/17.
- RUN384 table grants: 13/13.
- RUN390 migration assertions: PASS.
- Security Advisor: 37 INFO `rls_enabled_no_policy` findings (intentional deny-client tables).
- Performance Advisor: 200 INFO unused-index findings; no index removals.
- Health Advisor: no findings.
- RUN388 and RUN396 RPCs absent; RUN429 table/RPCs absent; RUN405 function present with different catalog fingerprint than source.

## Release boundary

- Package candidate: `gh-connect@0.338.154`.
- Accepted source baseline remains `0.338.139`; RUN442 is not accepted, pushed or deployed.
- No financial/provider operation, backfill invocation, GitHub push, Vercel deployment or Mainnet action occurred.
- Node 24.15.0 dependency-backed typecheck/lint/build and end-to-end Testnet acceptance remain outstanding.
- See `docs/RUN442-TESTNET-MIGRATION-APPLICATION-REPORT-2026-11-26.md` for full evidence and sequencing.
