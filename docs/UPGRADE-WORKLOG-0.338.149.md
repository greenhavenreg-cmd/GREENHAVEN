# GreenHaven upgrade worklog — 0.338.149 / RUN437

**Date:** 26 November 2026  
**Parent candidate:** `0.338.148` / RUN435  
**Purpose:** Phase 3 operational reconciliation preparation; no live database changes.

## Implementation

1. Preserved the user-designated 0.338.139 source archive as the accepted baseline; 0.338.149 remains an unaccepted review candidate.
2. Reused RUN435 as the exact parent source and inspected the current seven-migration/Testnet discrepancy report before making changes.
3. Added `supabase/diagnostics/RUN437_PHASE3_READONLY_TESTNET_RECONCILIATION.sql`, a read-only SQL bundle using only `SELECT`/`WITH` statements.
4. Added `scripts/check-run437-phase3-reconciliation-pack.mjs` and registered it in `verify:static` and `prebuild:checks`.
5. Added RUN437 documentation and synchronized package, lockfile, app release, source-of-truth and migration inventory metadata.
6. Preserved all migration history as-is. No migration was applied, repaired, re-versioned, replayed or squashed.

7. Kept the proposed atomic session-cap RPC disabled and did not create or apply an outbox migration.
8. Kept registration backfill, invitation RPCs and all financial operations out of the diagnostic path.
9. Added explicit catalog probes for expected server grants and client-role denials.
10. Registered the RUN437 regression check in static verification and prebuild discovery.

## Verification

- RUN437 reconciliation pack source contract: 8/8 PASS. This is source-only verification scope; the diagnostic SQL remains unexecuted against Testnet.
- Full `npm run verify:static` against this candidate: pending final run.
- Runtime requirement: Node.js 24.15.0 (package engine `^24.15.0`); current workspace Node `22.16.0` blocks prebuild, dependency installation, typecheck, lint and production build.
- Equivalent read-only catalog probes from the diagnostic pack were executed against the named Testnet project. It confirmed all 17 RUN384 indexes absent, 17 expected service_role privilege entries missing (with client-role access denied), RUN388/RUN396/RUN429 RPCs and RUN429 table absent, RUN405 backfill RPC present with service_role-only execution, session-cap RPC absent, and the duplicate RUN406 history record. No PostgreSQL 17 disposable instance is available here.

## Safety

Testnet access was read-only; no DDL or data changes, no financial RPCs, no account backfill, no wallet/PI/GHC operation, no GitHub push, no Vercel deployment and no Mainnet action occurred.

## Decision

RUN437 improves reproducibility of Testnet migration-effect reconciliation but does not close operational acceptance. Phase 3 remains NOT APPROVED for closeout; Phase 4 remains on hold; Mainnet remains NOT APPROVED. The last user-designated accepted source archive remains `0.338.139`.
