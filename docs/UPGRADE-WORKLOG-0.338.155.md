# GreenHaven upgrade worklog — 0.338.155 / RUN443

**Date:** 26 November 2026  
**Parent candidate:** `0.338.154` / RUN442  
**Scope:** Apply the four previously held Testnet migrations with target-specific preflight and postflight; incorporate RUN441 Community invitation lock-order correction into canonical migration source.

## Execution

1. Reconfirmed Supabase Testnet project `jhlsjnmfpakvibuuoygx`, region `eu-west-1`, PostgreSQL 17.12, ACTIVE_HEALTHY.
2. Preflighted RUN388 research tables, column types and unique submission idempotency index. Applied the atomic schedule/quota RPC.
3. Preflighted RUN396 payout request table, RLS and projection columns. Applied the bounded owner-scoped history RPC.
4. Verified all eight RUN405 account-root columns are text and the existing claim/backfill RPCs exist. Replaced only the bounded operator backfill discovery function; did not invoke it.
5. Preflighted RUN429 Community, membership, profile, block and notification dependencies. Applied invitation table/index/RLS and all three RPCs, with RUN441 Community-before-Invitation lock ordering included in the same application.
6. Verified function owners, SECURITY DEFINER, pinned search paths, service_role-only execute ACLs, client execute denial, invitation table RLS/client denial, index definitions and runtime guard responses.
7. Rechecked migration history and Supabase Security, Performance and Health Advisors.
8. Updated the canonical RUN429 migration source, RUN388 source declaration, migration inventory notes, project truth, source-of-truth, worklog and release metadata.
9. Regenerated and checked the 246-file migration inventory, apply-order document and source manifest for deterministic consistency.
10. Ran the four focused migration contracts, documentation/release/project-truth gates, dependency-lock integrity and 464-check prebuild discovery. This is source-only verification scope and does not replace PostgreSQL concurrency rehearsal or Node 24.15.0 dependency-backed build verification.

## Testnet application mappings

| Migration | Generated Testnet version |
|---|---:|
| RUN388 research quota | `20261126161545` |
| RUN396 payout history | `20261126161553` |
| RUN405 registration discovery | `20261126161603` |
| RUN429 invitations with RUN441 correction | `20261126161651` |

Combined with three RUN442 operations, seven migrations in the current reconciliation sequence are installed. The source timestamps remain version-drifted; `supabase db push` and manual history repair remain blocked.

## Verification

- Six RPCs: `postgres` owner, `SECURITY DEFINER`, `search_path=pg_catalog, public`, service_role execute true, anon/authenticated execute false.
- RUN429 table: RLS enabled; anon/authenticated/service_role direct SELECT denied; one deny-all policy; three valid indexes.
- RUN388 runtime smoke: invalid submission → `INVALID_SUBMISSION`; unknown project → `RESEARCH_NOT_FOUND`.
- RUN396 runtime smoke: non-existent owner → `{ok:true, items:[], limit:50}`.
- RUN405 runtime smoke: wrong confirmation → `TESTNET_CONFIRMATION_REQUIRED`; backfill not invoked.
- RUN429 runtime smoke: unknown Community → `NOT_FOUND`; unknown invite → `NOT_FOUND`; valid empty inbox → empty list.
- Advisors: Security 37 INFO deny-client RLS findings; Performance 202 INFO unused-index findings; Health no findings.

## Final verification results

- `npm run verify:static`: **63/63 gates passed**, **5,369 PASS lines**, **zero FAIL lines**.
- RUN388/RUN396/RUN405/RUN429 source checks: 16/16, 17/17, 10/10 and 17/17.
- Release hygiene 17/17; project truth 11/11; docs hygiene PASS; migration inventory 246/246 synchronized; dependency-lock integrity PASS; Phase 1–12 consolidation 24/24; Phase 12 release gate 28/28.
- Prebuild dry-run: 464 checks discovered. Actual prebuild/typecheck/lint/production build remain blocked by Node 22.16.0 vs required Node 24.15.0 and absent installed dependencies.
- `.env.example` corrected to keep Pi API mode and Testnet network semantics separate and all payout/A2U/registration and optional financial flags fail-closed; RUM defaults to zero sampling.

## Remaining gates

- No disposable PostgreSQL 17 or Docker runtime; two-connection concurrency rehearsal remains unexecuted.
- No synthetic real-account owner-isolation/field-redaction test for RUN396.
- RUN405 backfill eligibility review and explicit operational approval remain required; no credits were issued.
- Migration history: 247 rows, 246 distinct names, duplicate RUN406 name remains; generated source-version mappings and historical drift require row-by-row reconciliation. No manual history edits or repair.
- Node 24.15.0 dependency-backed typecheck/lint/build and two-account Pi Browser acceptance remain outstanding; workspace Node is 22.16.0.

## Release boundary

Package candidate `gh-connect@0.338.155`; accepted source baseline remains `0.338.139`. No financial operation, backfill invocation, GitHub push, Vercel deployment or Mainnet action occurred. RUN443 is not accepted or production-approved. Full evidence: `docs/RUN443-TESTNET-MIGRATION-APPLICATION-REPORT-2026-11-26.md`.
