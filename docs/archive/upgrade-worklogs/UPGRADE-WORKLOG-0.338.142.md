# Upgrade worklog — GreenHaven 0.338.142 / RUN429 Phase 1 source closeout

**Date:** 26 November 2026  
**Parent candidate:** `0.338.141` / RUN428  
**Accepted archive:** `GREENHAVEN-0.338.139-RUN426-PHASE0-SOCIAL-EXPERIENCE-FOUNDATION-2026-11-26.zip`

## Changes

- Implemented a canonical durable community invitation relation and service-role-only lifecycle RPCs.
- Added authenticated community invitation create, inbox and accept/decline APIs with session-derived actors, bounded payloads, durable rate limits and no-store responses.
- Integrated the durable inbox into Communities and Home. Unavailable invitation state is disclosed rather than rendered as an empty inbox.
- Rewired context invitation actions to use the server-authoritative endpoints. Existing conversation invitation caches are no longer treated as proof of durable community invitation state.
- Kept Community membership separate from realtime Chat membership; invitation acceptance does not write `gh_conversation_members`.
- Added durable notification inbox/realtime events with dedupe keys.
- Added RUN429 16-check source-contract gate and registered it in static and prebuild check manifests.
- Added SQL migration `20261126090001_run429_durable_community_invitations.sql`, marked `REVIEW_REQUIRED` and included in all generated migration inventories.
- Bumped package, lockfile and app release metadata to `0.338.142`.

## Implementation sequence

1. Reopened the current RUN428 candidate archive and retained it as the sole working parent for this increment.
2. Reconciled the existing community invitation behavior against the durable group-chat invitation API and confirmed they are different domains.
3. Designed the community invitation relation around canonical community and membership identifiers.
4. Added the additive SQL schema, recipient-scoped RPCs, authorization checks, expiry, duplicate protection and RLS/ACL boundary.
5. Added authenticated invitation creation, inbox and response routes with bounded inputs and fail-closed rate limiting.
6. Connected the Communities directory to the durable invitation inbox and added an explicit unavailable state.
7. Connected the Home command centre to the same durable inbox instead of local invitation projection.
8. Rewired context create/accept/decline actions to the authenticated server APIs.
9. Added deduplicated notification inbox projection and kept Community membership separate from Chat membership. Realtime event emission is intentionally omitted so it cannot bypass the notification RPC reciprocal-block check.
10. Registered the RUN429 source-contract gate and synchronized release metadata, migration inventory and engineering documentation.

## Verification

Source-level verification only: these repository gates do not prove live PostgreSQL execution, browser behavior, deployment or end-to-end acceptance.

- RUN429: 16/16.
- RUN428: 20/20.
- RUN427: 11/11.
- RUN426: 15/15.
- SQL lexical integrity: PASS.
- Migration inventory and source manifest: 246/246 synchronized.
- TypeScript syntax transpilation: 7/7 changed TS/TSX files pass.
- Full `npm run verify:static`: **PASS, 63/63** (network/DB-independent source verification).
- Prebuild manifest dry-run: **451 checks discovered**; execution is blocked by the local Node 22.16.0 runtime, below the required Node.js 24.15.0.

## Live environment inspection

- Supabase connection surfaced one active project, `jhlsjnmfpakvibuuoygx` in `eu-west-1`; the current project documentation identifies it as the GreenHaven Testnet project.
- Read-only inspection confirmed `gh_communities` and `gh_community_members` exist and no `gh_community_invitations` table exists yet.
- Remote migration history currently contains 240 rows. The repository now contains 246 SQL migrations. Existing migration-name/version discrepancies remain; RUN429 adds one further source-only migration and is not applied.
- No database DDL or row mutation was performed. No migration repair or history rewrite was performed.

## Runtime and deployment limits

- Available runtime: Node `22.16.0`; required runtime: Node.js 24.15.0 (package engine range `^24.15.0`).
- `node_modules` is absent. `npx supabase@latest --version` did not complete, and Supabase CLI is unavailable in the workspace.
- Dependency-backed `tsc --noEmit`, ESLint and production build are not verified. TypeScript transpile/parser checks are syntax checks only.
- No disposable PostgreSQL runtime is available here; RUN429 SQL execution and concurrency behavior remain unverified.
- No two-account browser/device E2E run was performed.
- No GitHub push, Vercel deployment or Mainnet action occurred. Pi remains Testnet-only.

## Release decision

`0.338.142` is a source implementation closeout candidate for Phase 1, not a production acceptance release. Keep `0.338.139` as the last user-designated accepted source archive. Do not apply RUN429 to Testnet until disposable-PostgreSQL validation and exact target-history reconciliation are complete; never apply it to Mainnet without separate review and approval.
