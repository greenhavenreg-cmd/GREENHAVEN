# Upgrade worklog — GreenHaven 0.338.146 / RUN433 Phase 2 Integrated Social Transformation

**Date:** 26 November 2026  
**Parent candidate:** `0.338.145` / RUN432  
**Accepted source archive:** `GREENHAVEN-0.338.139-RUN426-PHASE0-SOCIAL-EXPERIENCE-FOUNDATION-2026-11-26.zip`

## Implementation sequence

1. Completed the Community directory, workspace, creation, Events, Resources, Chat and governance source audit.
2. Completed the Messages inbox, request, thread, media, voice, search, group and call capability audit.
3. Completed the Discovery ranking, privacy projection, profile action, connection intent, search and request lifecycle audit.
4. Confirmed canonical domain reuse and rejected parallel stores or duplicate routes.
5. Reconciled Testnet schema presence and RLS read-only; preserved the RUN429 migration hold.
6. Identified and fixed missing Discovery profile persistence/context actions in RUN431.
7. Identified and fixed non-resumable Community creation drafts and Pi-only fee rail normalization in RUN432.
8. Confirmed live calling remains fail-closed until TURN/signaling and production policy are configured.
9. Added the 22-check RUN433 integrated source contract and registered it in static/prebuild suites.
10. Synchronized package, lockfile, app release and source-manifest version to `0.338.146`.

## Verification

RUN433 integrated source contract: **22/22 PASS**. RUN431: 9/9; RUN432 source contract: 11/11; RUN432 draft helper: 18/18. Full `npm run verify:static` completed with **5,289 PASS checks and zero failures**. The prebuild dry-run discovered **456 checks**. All five changed TypeScript/TSX files passed parser transpilation with zero syntax diagnostics. These are source-level checks, not end-to-end acceptance. The required Node.js 24.15.0 runtime is not installed locally (available Node is 22.16.0) and `node_modules` is absent; dependency-backed typecheck, lint and production build remain blocked. Real two-account/multidevice tests and disposable-PostgreSQL migration execution remain outstanding.

## Release boundary

`0.338.146` is a source-only candidate. The last user-designated accepted archive remains `0.338.139`. No live database mutation, migration application, payment operation, GitHub push, Vercel deployment or Mainnet action occurred.
