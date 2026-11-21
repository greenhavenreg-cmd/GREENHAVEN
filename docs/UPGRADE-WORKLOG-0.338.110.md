# GreenHaven upgrade worklog — 0.338.110

**Date:** 2026-11-21  
**Parent:** 0.338.109 Pi authentication repair candidate  
**Package:** `gh-connect@0.338.110`  
**Target:** `testnet` branch / Vercel Preview only  
**Status:** local source repair; not pushed or deployed.

## Scope and changes

1. Reproduced the Vercel failure from the supplied build log: the package and lockfile were already `0.338.110`, but the app release marker, README, project-truth current baseline and verified migration manifest still identified `0.338.109`; the migration inventory's generated outputs were stale.
2. Synchronized `lib/app-release.ts`, README and the current project-truth baseline to `0.338.110`.
3. Regenerated `VERIFIED_MANIFEST.txt`, `MIGRATION-SOURCE-MANIFEST.csv`, `docs/MIGRATION_CHECKLIST.md`, and `supabase/TESTNET_APPLY_ORDER.md` using `scripts/generate-migration-inventory.mjs` from the 231 canonical SQL source files.
4. Added this required release worklog so the Phase 24 release-review gate can resolve the current version's evidence record.
5. Preserved all 231 migration SQL files byte-for-byte. The generator only updates derived inventory documents; it does not connect to Supabase or mutate a database.
6. Preserved existing release controls, including Testnet-only scope, held/proposal migration classifications, no automatic `supabase db push`, and Production NOT APPROVED.

## Verification performed in this workspace

- `scripts/check-project-script-integrity.mjs`: PASS, 1,209 command entries.
- `scripts/check-migration-duplicate-integrity.mjs`: PASS, 231 unique migration versions, SHA-256 digests and basenames.
- `scripts/check-release-hygiene.mjs`: PASS, 21/21.
- `scripts/check-project-truth.mjs`: PASS, 11/11.
- `scripts/check-phase10-release-closure.mjs`: PASS, 19/19.
- `scripts/check-phase10-platform-acceptance.mjs`: PASS, 24/24.
- `scripts/check-phase5-runtime-acceptance.mjs`: PASS, 15/15.
- `scripts/check-run380-phase6-readiness.mjs`: PASS, 12/12.
- Pi authentication regression gates: RUN373 8/8; RUN338 25/25; RUN318 11/11; RUN343 8/8; RUN344 10/10; RUN370 7/7; RUN353 16/16; RUN371 11/11.
- API hardening gates: RUN378 10/10; RUN379 21/21; Phase 10 resilience 17/17; Phase 6 performance/accessibility 23/23.
- Dependency-lock completeness check: PASS.
- `scripts/check-dependency-security-policy.mjs`: PASS, 11/11.
- `scripts/check-vercel-build-hygiene.mjs`: PASS, 21/21.
- `scripts/check-phase24-release-review.mjs`: PASS after adding this current worklog.

## Outstanding verification and risks

- The supplied Vercel build log reports 22 npm audit vulnerabilities (1 critical, 13 high, 6 moderate, 2 low). A fresh audit in this workspace could not reach `registry.npmjs.org` (`EAI_AGAIN`); no speculative or forced dependency upgrade was made. The existing dependency-security CI policy is retained and must produce a fresh report when registry access is available.
- This workspace only has Node.js 22.16.0; the project requires Node.js `^24.15.0`. The prebuild runner correctly refuses to run under Node 22. The complete 411-check Node 24 prebuild, dependency-backed `npm ci`, TypeScript, ESLint, Next.js production build, and browser/device E2E are therefore not claimed as passed.
- No live Supabase migration-history/catalog reconciliation, disposable PostgreSQL rehearsal, Pi provider acceptance, or authenticated multi-account Testnet test was performed.

No live database, migration history, wallet, ledger, payment, payout, Pi transfer, GitHub branch, Vercel environment, or deployment was changed. No Mainnet or Production action occurred. The output is a source-only candidate for manual review and push to `testnet`; Testnet certification and Production remain NOT APPROVED.
