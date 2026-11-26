# RUN428 — Phase 1 Social & Connections implementation increment

**Date:** 26 November 2026  
**Candidate:** `gh-connect@0.338.141`  
**Parent:** `0.338.140` / RUN427 Phase 1A  
**Baseline:** `GREENHAVEN-0.338.139-RUN426-PHASE0-SOCIAL-EXPERIENCE-FOUNDATION-2026-11-26.zip`  
**Scope:** Community directory/workspace, existing Messages and Discovery contracts, shared connection and notification boundaries.  
**Network:** Pi Testnet only. No Mainnet activation.

## 1. Implementation changes

### Community
- Retained the existing My / Managed / Discover model and added a separate Invitations directory view.
- Invitation rows are derived only from explicit `invitedMembers` state on the existing community conversation/domain projection. Notifications and public directory presence are not treated as proof of an invitation.
- Discover now excludes invited rows and retains only `discoverable` or `pending` membership states, preventing invitation and membership-request rows from being presented as ordinary joinable discovery results.
- Existing accept/decline invitation actions are reused; no parallel invitation model or table was introduced.
- Added a dedicated Resources workspace tab using the existing `community.resources` projection and `PinnedResourceCard` renderer. Resource content is not fabricated or copied into a second store.
- Managed roles remain a presentation filter only. The API and database continue to authorize every management action.

### Messages
- No duplicate messaging subsystem was introduced. The existing inbox categories, authenticated conversation membership checks, durable message store, client-message idempotency, owned-media validation, offline queue, reconnect flush and failed-message retry remain the canonical implementation.
- Cross-domain contract checks were added to guard those boundaries against regressions.

### Discovery and connections
- No duplicate candidate or relationship graph was introduced. Discovery continues to use `gh_discovery_candidates`, privacy projection and existing connection request/accept/decline APIs.
- Source-contract checks cover self/connected/pending/blocked exclusions, privacy projection and session-derived actors.

### Shared navigation and notifications
- Added source-contract checks for the canonical notification target resolver and deep-link sanitizer.

## 2. Verification performed

- RUN426 Phase 0 architecture/research contract: **15/15 PASS**.
- RUN427 Community directory contract: **11/11 PASS**.
- RUN428 cross-domain Social & Connections source contract: **20/20 PASS**.
- Full `npm run verify:static`: **PASS** with all registered legacy and current source-contract checks, including RUN426/RUN427/RUN428.
- TypeScript compiler parser check: changed Community TSX files have **no syntax diagnostics**.
- Release metadata: package, lockfile root and `lib/app-release.ts` synchronized to `0.338.141`.

These are source-level checks. They do not prove deployed database state, two-account behaviour, realtime delivery or production build success.

## 3. Important remaining constraints

- The current community invitation authority is `invitedMembers` on the existing conversation/domain projection. The current `gh_communities` / `gh_community_members` schema has no dedicated durable invitation state and its member status constraint does not include `invited`. Therefore the new directory view does **not** claim cross-device durable invitation delivery. A durable invitation lifecycle requires an additive, reviewed migration/RPC and integration into the existing community identity—not a UI-only or notification-derived substitute.
- Community create-flow resumability and full role/escalation lifecycle still require a complete journey audit and two-account tests.
- Messages and Discovery already have substantial implementations, but source-contract tests are not substitutes for two-account, multidevice, offline/reconnect and privacy acceptance tests.
- Full Phase 1 acceptance remains blocked until the invitation persistence contract, live Testnet database migration review/application, two-account/multidevice end-to-end tests, and dependency-backed build gates are completed.

## 4. Explicitly not performed

- No database migration or schema mutation; Supabase CLI is not installed in this extracted workspace.
- No live Supabase reads/writes or production data changes.
- No Pi, GHC, wallet, membership payment, payout, settlement or financial changes.
- No GitHub push or Vercel deployment.
- No Mainnet enablement.

## 5. Build environment limitation

The project requires Node `^24.15.0`; the available runtime is Node `22.16.0`. `node_modules` is absent. The complete `npm run verify:static` chain remains blocked earlier at the existing RUN337 `.env.example` source-baseline assertions (3 failures), so the newly registered RUN428 gate was run directly and passed. Typecheck, lint and production build are not claimed as passing.

**Status:** Phase 1 implementation is advanced, but **not accepted as complete or production-ready**. Keep `0.338.139` as the accepted source-of-truth baseline until the user reviews and accepts the candidate and the outstanding release gates are resolved.
