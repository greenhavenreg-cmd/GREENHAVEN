# Upgrade worklog — 0.338.167 / RUN455

1. Continued from the extracted RUN454 working candidate, preserving the user-uploaded RUN453 archive as the authoritative lineage baseline.
2. Re-audited the service registry against existing screen components, API routes, release gates and runtime contracts.
3. Found that Events already had an authenticated, rate-limited API; privacy-aware community event projection; search/category filters; pagination; and durable RSVP mutation, but remained marked Coming Soon and was not mounted by the Ecosystem directory.
4. Activated Events in the canonical service registry and routed it to an Ecosystem focus destination.
5. Found the existing Services Directory screen and canonical Marketplace listing query already implemented but not mounted or released.
6. Activated Services Directory, mounted it in Ecosystem, and connected service-detail navigation to the existing Marketplace listing detail route.
7. Mounted the existing Events discovery screen with an in-place back action and direct selection behavior.
8. Updated Events and Services release-boundary checks to validate active registry status and actual screen wiring while preserving auth, rate limiting, private-community visibility and durable listing/RSVP safeguards.
9. Added RUN455 regression checks to both static verification and prebuild quality pipelines.
10. Kept Charity and donations gated because the available Charity screen is a read-only summary and has no donation workflow.
11. Synchronized package, lockfile, in-app release identity, README, verified manifest and current source-of-truth documents to `0.338.167`.

12. Reconciled RUN455 release notes with historical RUN447 community role-normalization and RUN443 Testnet migration closeout records; these historical operations were not repeated.
13. Recorded the required Node.js 24.15.0 runtime and the workspace limitation at Node 22.16.0.

## Verification

- RUN455 combined Events/Services focused source contract: 13/13 PASS; this is source-level verification scope only.
- Events release-boundary contract: 14/14 PASS.
- Services release-boundary contract: 10/10 PASS.
- Existing Seller Centre contract: 6/6 PASS.
- Existing shell viewport/navigation contract: 8/8 PASS.
- Full `npm run verify:static`: 5,444 PASS assertions, zero FAIL assertions; exit code 0. This is source-level verification scope only, not a runtime or build result.
- Node.js available in this workspace: 22.16.0; project requires 24.15.x. Dependency-backed typecheck, lint and Next.js production build remain outstanding.
- No migrations, live database mutations, payments, payouts, refunds, Git pushes or deployments were performed.

## Release boundary

RUN455 unblocks only the existing Events discovery and Services Directory surfaces. It does not certify live Testnet data, real RSVP persistence in a deployed environment, or production readiness. Production remains NOT APPROVED.
