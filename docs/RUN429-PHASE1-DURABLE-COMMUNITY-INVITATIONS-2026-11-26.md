# RUN429 — Phase 1 durable Community invitation lifecycle

**Date:** 26 November 2026  
**Candidate:** `gh-connect@0.338.142`  
**Parent:** `0.338.141` / RUN428  
**Accepted baseline:** `0.338.139` / RUN426  
**Scope:** durable community invitation persistence, authenticated inbox, accept/decline, notification projection, and cross-surface integration.  
**Network:** Pi Testnet only. Mainnet remains out of scope.

## Implementation

- Added `gh_community_invitations` as an additive relation over the canonical `gh_communities` and `gh_community_members` domain. No parallel community identity, membership or conversation store was introduced.
- Added pending-pair uniqueness, expiry, response timestamps, recipient inbox indexing, RLS enabled with deny-client policy, and explicit direct-table privilege revocation.
- Added service-role-only RPCs for invite creation, recipient-scoped inbox listing, and recipient-bound accept/decline.
- Invite creation rechecks active owner/admin/moderator authority in the transaction, rejects self-invites, reciprocal blocks, banned/already-active targets and pending join requests, and uses a community-row lock to serialize duplicate invitations.
- Accept/decline is idempotent for repeated same-action requests, checks expiry and reciprocal blocks, updates the canonical community membership and member count atomically, and does not silently grant realtime Chat membership. Community and Chat remain separate authorization grants.
- Durable notification inbox records are appended with stable dedupe keys. The invitation inbox remains the notification authority; no realtime event is emitted that could bypass the notification RPC’s reciprocal-block check.
- Added authenticated, bounded, rate-limited server routes for create/list/respond. Actor IDs are derived from the verified server session, not request bodies.
- Community directory and Home invitation surfaces now read the durable invitation inbox. When the API/migration is unavailable they show an unavailable state rather than claiming the inbox is empty. Existing group-chat invitations remain separate.
- Context invitation actions now call the durable APIs rather than treating client conversation state as the authority.

## Verification

- RUN429 invitation contract: **16/16 PASS**.
- RUN428 Social & Connections contract: **20/20 PASS**.
- RUN427 Community directory contract: **11/11 PASS**.
- RUN426 Phase 0 foundation: **15/15 PASS**.
- SQL lexical integrity: **PASS** across the repository migration inventory.
- Migration source manifest, verified manifest, generated checklist and Testnet review order: **246/246 synchronized**.
- TypeScript syntax transpilation: all seven changed TS/TSX files passed parser checks.
- Full `npm run verify:static`: recorded separately in the RUN429 worklog.

These are repository/source checks. They do not prove PostgreSQL execution, cross-device delivery, live notifications, browser behavior or production build success.

## Migration status and safety

`20261126090001_run429_durable_community_invitations.sql` is classified **REVIEW_REQUIRED** in the canonical migration inventory. It has not been applied to Supabase. The connected project `jhlsjnmfpakvibuuoygx` was inspected read-only; its current community schema has no invitation relation. The source migration history and remote history still contain outstanding version/name discrepancies, so no migration was applied or repaired. The Supabase CLI was not available in this workspace and its `npx` bootstrap did not complete. The SQL has not been executed against disposable PostgreSQL; this remains a required gate before Testnet application.

No live data, memberships, notifications, chat grants, financial records, Pi payment state, GHC balances, GitHub branch or Vercel deployment were changed.

## Phase 1 closeout status

The Phase 1 source implementation now covers Community directory/workspace and durable invitations, existing canonical Messages reliability surfaces, Discovery/Connections boundaries, and shared notification/deep-link integration. **Source implementation is complete as a candidate; operational acceptance is not complete.** Required remaining gates are disposable-PostgreSQL migration validation, exact Testnet migration-history reconciliation, explicit Testnet migration application and postflight, two-account/multidevice Community/Messages/Discovery acceptance, and Node 24.15.x dependency-backed typecheck/lint/build.

Do not apply this migration to Mainnet. Do not treat this candidate as the accepted source archive until the user explicitly accepts it.
