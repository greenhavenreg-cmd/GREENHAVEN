# RUN507 — Root bundle metadata reconciliation

**Date:** 28 November 2026  
**Package:** `gh-connect@0.338.177`  
**Scope:** Documentation and release-evidence accuracy only.  
**Status:** Source candidate; production NOT APPROVED.

## Finding

The root `LATEST-PROJECT-BUNDLE-README.md` still described package `0.338.173` / RUN461 even though the authoritative archive contains package `0.338.177` / RUN506. This made the root-level current-bundle pointer stale and could mislead maintainers about the actual source baseline and release gates.

## Repair

- Replaced the stale root bundle pointer with the actual package, RUN506 candidate, baseline and working archive metadata.
- Recorded RUN504–RUN506 scope without claiming live provider, database, browser or production acceptance.
- Explicitly documented the verification result and the Node.js 22.16.0 runtime limitation against the project's Node.js `^24.15.0` engine.
- Preserved package version and lockfile; no dependency or application behavior was changed.

## Verification

- `npm run verify:static`: passed in the available workspace (exit code 0).
- `package.json` and `package-lock.json` root package versions: both `0.338.177`.
- Typecheck, lint, production build and browser/Testnet acceptance were not run because this environment has Node.js 22.16.0 and dependencies are not installed.

## Safety boundary

No application source, API, database schema, SQL migration, financial authority, Pi integration, GHC ledger, payment, withdrawal, membership, reward, referral, curation, or provider configuration was changed. No live database action, provider transaction, Git push or deployment was performed. Production remains NOT APPROVED.
