# RUN427 — Phase 1A: Community directory implementation

**Date:** 26 November 2026  
**Parent source:** `GREENHAVEN-0.338.139-RUN426-PHASE0-SOCIAL-EXPERIENCE-FOUNDATION-2026-11-26.zip`  
**Candidate:** `gh-connect@0.338.140`  
**Scope:** Community directory first implementation increment; no database or financial changes.

## Implemented

- Added a first-class **Managed** directory view alongside **My communities** and **Discover**.
- Managed membership is derived from the authenticated directory membership enrichment: creator identity or the current viewer's canonical `owner`, `admin`, or `moderator` role.
- Uses existing identity alias matching to handle canonical identity aliases without introducing a second identity source.
- Added role-aware management labels on community cards rather than labelling every joined community as a generic member.
- Added managed-community attention filters for join requests, board activity and chat activity.
- Added a useful empty state with routes to Discover and Create Community.
- Added RUN427 source-contract regression checks and registered them in `verify:static`.
- Synchronized package, lockfile and app release identity to `0.338.140`.

## Security and data boundaries

- The Managed tab is a presentation filter only. It does not grant or imply authorization.
- All management mutations continue through the existing server APIs/context actions, which must enforce role authorization independently.
- The existing authenticated `gh_community_list_memberships` enrichment remains the source for membership roles.
- No invitation inbox was added because the current public directory response does not provide a verified viewer-specific invitation collection. Showing invitation counts without that contract would fabricate state. A future increment must add or reuse an authenticated server-side invitation listing contract and then wire accept/decline actions to it.
- No new tables, RPCs, migrations, local authority flags, mock members or sample production communities were introduced.
- No Pi, GHC, wallet, payout, settlement or Mainnet behaviour was changed. Pi remains Testnet-only.

## Verification

- RUN427 Phase 1A source contract at delivery: **7/7 PASS**...
- RUN426 Phase 0 source contract: **15/15 PASS**.
- Full `npm run verify:static`: **BLOCKED by an existing baseline failure at RUN337**, which reports the root `.env.example` template is absent (3 failures: template inclusion, blank privileged credentials, fail-closed Pi Testnet defaults). The run stops at that gate before later checks; this is not attributed to RUN427.
- Dependency-backed TypeScript, lint and production build were not run: `node_modules` is absent in this extracted workspace and the required Node runtime is `^24.15.0`; the available runtime is Node `22.16.0`.
- No Supabase migration, live database write, GitHub push or Vercel deployment was performed.

## Remaining Phase 1 work

1. Community invitation list contract and user-specific invitation workspace.
2. Community creation-flow audit and resumable draft persistence review.
3. Complete community Overview, Board, Chat, Members, Events, Resources and About journeys against canonical records.
4. Two-account community lifecycle and role-escalation tests.
5. Messages inbox/request/conversation transformation.
6. Discovery search/filter/connection lifecycle transformation.
7. Shared notification deep-link and unread-state integration.
8. Node 24.15.0 dependency-backed typecheck, lint, production build and device/end-to-end acceptance.

**Status:** Phase 1 started; Community directory increment implemented. Not a Phase 1 or production-ready completion claim.
