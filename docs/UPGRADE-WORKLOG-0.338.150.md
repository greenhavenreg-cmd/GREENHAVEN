# GreenHaven upgrade worklog — 0.338.150 / RUN438

**Date:** 26 November 2026  
**Parent candidate:** `0.338.149` / RUN437  
**Scope:** Phase 3 migration-effect provenance and read-only reconciliation hardening.

## Changes

1. Reused the latest RUN437 working candidate without changing the accepted 0.338.139 baseline.
2. Rechecked the live Testnet findings before deciding which evidence gaps could be safely addressed in source.
3. Extended the SELECT-only Testnet diagnostic bundle to capture full `pg_get_functiondef` output, function owner, `SECURITY DEFINER` posture, per-function settings and a comparable MD5 fingerprint for RUN388, RUN396, RUN405, RUN429 and the held session-cap proposal.
4. Added exact index-definition capture for all 17 RUN384 indexes. This distinguishes an index with the expected name from an index with the expected columns/predicate.
5. Added a dedicated read-only RUN405 backfill definition inspection. The diagnostic never invokes the backfill or grants execution.
6. Expanded the reconciliation contract from 8 to 11 assertions, including explicit checks that the diagnostic only contains SELECT/WITH statements and never invokes financial/community mutation RPCs.
7. Bumped package, lockfile and app release to `0.338.150` and synchronized current-candidate documentation.

8. Kept all diagnostic SQL strictly read-only and verified its statement classes.
9. Kept migration application, history repair, registration backfill and financial RPC execution out of this increment.
10. Preserved the Testnet observations as evidence without claiming that new diagnostic statements had already been run.

## Verification and limits

- RUN437/RUN438 diagnostic contract: 11/11 PASS (source-level verification scope only).
- The previously recorded RUN436 live Testnet observations remain unchanged: 17 RUN384 indexes absent; multiple service-role grants absent; RUN388/RUN396/RUN429 functions absent; RUN405 backfill function present with service-role-only execution; RUN406 duplicate history record present.
- The expanded function-definition and index-definition diagnostic queries have not yet been executed against Testnet. No new database facts are inferred from their addition.
- Node.js 24.15.0 is the required project runtime; this workspace remains on Node 22.16.0. Dependency-backed typecheck/lint/build remain blocked.
- No disposable PostgreSQL 17 instance is available; concurrency and financial retry tests remain unexecuted.

## Safety and decision

No live DDL, migration-history repair, data mutation, reward/backfill, wallet or payment operation, GitHub push, Vercel deployment or Mainnet access occurred. The 0.338.139 user-designated accepted baseline remains authoritative. RUN438 is an unaccepted review candidate. Phase 3 operational approval and Phase 4 start remain blocked until PostgreSQL runtime, migration provenance and multi-account acceptance gates pass.
