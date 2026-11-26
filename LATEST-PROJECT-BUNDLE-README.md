# GreenHaven — Reconciled R2 Project Bundle

**Package:** `gh-connect@0.338.138`  
**Baseline:** `GREENHAVEN-0.338.137-PHASE1-6-INTEGRATED-CLEAN-2026-11-26.zip`  
**Working archive:** `GREENHAVEN-0.338.138-RUN424-IDENTITY-FINANCIAL-INTEGRITY-2026-11-26.zip`  
**Date:** 26 November 2026  
**Status:** Static source verification passed; not approved for production or Mainnet.

This R2 working copy preserves the integrated Phase 1–6 application, restores the exact GitHub repository integrity files, preserves historical evidence, tightens Membership status display to server-confirmed state, reduces redundant Rewards/Membership copy, and updates regression contracts.

## Operational status

- GitHub: `greenhavenreg-cmd/GREENHAVEN`, branch `testnet`, still at commit `bc42129e7ebf5d5259f9846a79118a0c855ed9a6`.
- Vercel: project `greenhaven`; latest inspected Preview is READY but was built from the earlier commit, not this R2 candidate.
- Supabase: Testnet project `jhlsjnmfpakvibuuoygx`; 245 source migration files versus 240 remote history rows. Six source migrations are held; five migration names have version drift and Run 406 has a duplicate history name.
- Pi: Testnet/Sandbox only.

## Verification

`npm run verify:static` passes 63/63; release hygiene passes 17/17; project truth passes 11/11. Local Node is 22.16.0 while the project requires 24.15.0, so typecheck, lint and a supported-runtime build remain outstanding. No GitHub push, Vercel deployment or Supabase migration was performed.

See `docs/CURRENT-SOURCE-OF-TRUTH-2026-11-26.md` and `docs/ENGINEERING-AUDIT-2026-11-26.md` for exact migration discrepancies, security observations, verification results and remaining release gates.


RUN424 adds wallet reservation arithmetic and partitioned session-cookie clearing hardening. See `docs/RUN424-IDENTITY-FINANCIAL-INTEGRITY-2026-11-26.md`.

RUN425 also repairs the idempotent profile upsert used during Pi sign-in; see `docs/RUN424-IDENTITY-FINANCIAL-INTEGRITY-2026-11-26.md`.
