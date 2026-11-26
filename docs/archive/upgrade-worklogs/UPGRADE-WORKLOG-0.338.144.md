# Upgrade worklog — GreenHaven 0.338.144 / RUN431 Phase 2 Discovery preferences

**Date:** 26 November 2026  
**Parent candidate:** `0.338.143` / RUN430  
**Accepted source archive:** `GREENHAVEN-0.338.139-RUN426-PHASE0-SOCIAL-EXPERIENCE-FOUNDATION-2026-11-26.zip`

## Implementation sequence

1. Reconciled Discover's connection-intent UI with the canonical server profile contract.
2. Confirmed `ServerProfileRecord.connectionIntents`, profile sanitization and `/api/profile/me` PATCH already support session-owned durable profile updates.
3. Found the Discovery context omitted `updateProfile` and `addToast`, despite the broader context providing both actions.
4. Exposed those existing actions without creating another profile store or endpoint.
5. Wired Discover intent changes to `updateProfile`; retained local storage only as a convenience mirror.
6. Added explicit local-storage persistence status and a 9-check source contract.
7. Synchronized package, lockfile, app release and source-manifest version to `0.338.144`.
8. Registered RUN431 in both static verification and prebuild check manifests.
9. Re-ran release-integrity, project-truth and documentation metadata checks.
10. Preserved the RUN429 migration hold and all production, Mainnet and financial release safeguards.

## Verification

RUN431 focused contract: **9/9 PASS** at initial focused run. Full static verification is source-level verification only; it does not prove a production build, browser behavior, cross-device synchronization or live authorization. The required Node.js **24.15.0** runtime is not installed in this workspace (available Node is 22.16.0), and `node_modules` is absent. Dependency-backed typecheck, lint and production build remain blocked pending Node.js 24.15.0 and dependency installation.

## Release boundary

`0.338.144` is a source-only candidate. The last user-designated accepted source archive remains `0.338.139`. No live database mutation, migration application, GitHub push, Vercel deployment, Pi Mainnet or financial operation occurred.
