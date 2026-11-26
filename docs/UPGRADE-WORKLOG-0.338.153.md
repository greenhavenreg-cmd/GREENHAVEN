# GreenHaven upgrade worklog — 0.338.153 / RUN441

**Date:** 26 November 2026  
**Package:** `gh-connect@0.338.153`  
**Scope:** Phase 4 identity lifecycle, multi-device sessions, step-up scope, profile hydration concurrency, Community/Messenger transaction safety.
**Candidate archive:** `GREENHAVEN-0.338.153-RUN441-PHASE4-IDENTITY-COMMUNITY-MESSENGER-CONCURRENCY-2026-11-26.zip`

## Identity and authentication review

- Added a runtime regression for same Pi provider UID remapped to a different canonical GH principal. Prior access token, username and display name are not carried into the new principal.
- Added two-device same-account coverage. Revoking one device leaves the other active.
- Added cross-account session revoke-by-ID denial and public session DTO checks proving token hashes/raw tokens are not exposed.
- Added step-up proof tests for exact GH user + session binding, cross-account/cross-session denial, explicit session proof revocation and post-revocation rejection.
- Confirmed recent step-up proofs are reusable only within their five-minute lifetime and exact session/account scope. This is an intentional freshness window, not a one-time nonce; a separate per-operation nonce/idempotency design would require a coordinated API/database contract and is not silently introduced here.
- Added overlapping profile-hydration requests with out-of-order completion. Requests are identity-ID scoped, select only public fields, validate returned IDs against the requested set, preserve source rows and do not cross-apply profile labels.

## Community and Messenger transaction review

- Found a lock-order inversion in the RUN429 Community invitation response RPC: creation locks Community then invitation, acceptance originally locked invitation then Community. Added `supabase/proposals/20261126_run441_community_invitation_lock_order_correction.sql`, which performs an initial unlocked lookup only to obtain the Community key, then locks Community before locking/re-reading the invitation. The historical RUN429 migration was not edited.
- Found a member-count race in the held Phase 4 Messenger proposal. The count trigger recalculated without first serializing changes to the conversation row. Updated the held Phase 4 proposal to lock affected conversation rows in deterministic order before recalculating new/old conversation counts.
- Retained advisory transaction lock + unique constraint for group creation idempotency; invite acceptance continues to lock the exact invitation row and add membership only after the invitee's acceptance.
- Added a comprehensive disposable PostgreSQL 17 transaction rehearsal matrix at `docs/RUN441-PHASE4-COMMUNITY-MESSENGER-TRANSACTION-REHEARSAL.md` covering concurrent create/accept/decline, retries, expiry, blocks, member-count concurrency, contact-sharing idempotency, rollback and ACL/RLS.
- The environment has no `psql`, PostgreSQL server binary or Docker runtime. Therefore the PostgreSQL rehearsal is **NOT EXECUTED**. The correction SQL remains proposal-only; RUN429 remains REVIEW_REQUIRED.

## Verification procedure and evidence boundaries

1. Re-ran the canonical principal-remapping runtime lifecycle test.
2. Created two independent sessions for one synthetic account.
3. Verified one device can be revoked without invalidating the other.
4. Attempted cross-account revoke-by-ID and verified denial.
5. Verified public session records omit token hashes and raw tokens.
6. Created a step-up proof and checked exact user/session scope.
7. Replayed the freshness proof within the intended window and confirmed it remains scoped.
8. Revoked the step-up proof and confirmed subsequent sensitive-operation checks reject it.
9. Ran overlapping profile hydration requests with intentionally reversed completion order.
10. Verified public-only projection, requested-ID filtering, nested comment consistency and source-row immutability.
11. Inspected Community invitation lock ordering and added a separate held correction without modifying RUN429 history.
12. Inspected Messenger membership count concurrency and added deterministic conversation-row locking to the held Phase 4 proposal.

All checks below are source-level verification scope evidence unless explicitly identified as runtime-unit assertions; none represents a PostgreSQL transaction rehearsal or live end-to-end acceptance.

## Verification

- RUN441 identity/session/profile runtime: **34 assertions PASS**.
- RUN441 identity + Community/Messenger source contract: **21/21 PASS**.
- RUN440 session rotation CAS source contract: **12/12 PASS**.
- RUN440 concurrent memory rotation and durable-read outage runtime: **7 assertions PASS**.
- Existing Phase 4 authentication: **16/16 PASS**.
- Existing Phase 4 identity integration: **17/17 PASS**.
- Existing coordinated identity/community/messaging: **32/32 PASS**.
- Existing profile identity snapshot: **8/8 source checks**; runtime remains separately covered.
- An intermediate full `npm run verify:static` attempt reached 5,218 PASS lines and zero FAIL lines before the five-minute execution limit; it did not complete, so it is not recorded as a full-suite pass. After subsequent RUN441 identity-profile race hardening, the focused Phase 4 suites, RUN440/RUN441 tests, release hygiene and project-truth checks were independently rerun and passed. Prebuild dry-run discovers 464 checks. Node 24.15.0 dependency-backed typecheck/lint/build remain blocked by the workspace Node 22.16.0 runtime and absent installed dependencies.

## Release and safety boundary

- Candidate: `gh-connect@0.338.153` / RUN441.
- Accepted baseline remains `0.338.139`; RUN441 is not accepted, pushed or deployed.
- Phase 3 operational acceptance remains blocked; Phase 4 is source-hardened but not operationally accepted.
- No migration, Testnet/Mainnet mutation, financial operation, GitHub push, Vercel deployment or Mainnet action occurred.
- Production and Mainnet remain **NOT APPROVED**.
