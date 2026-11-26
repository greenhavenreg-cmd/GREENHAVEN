# RUN441 — Phase 4 Community & Messenger transaction rehearsal plan

**Status:** Prepared; NOT EXECUTED.  
**Target runtime:** Disposable PostgreSQL 17 instance only.  
**Forbidden targets:** Connected GreenHaven Testnet, Mainnet, or any database containing user/financial data.  
**Migration status:** RUN429 remains review-required. The Phase 4 identity/group/contact SQL and RUN441 correction are proposals, not approved migrations.

## Why this rehearsal is required

Source inspection found two concurrency-sensitive database boundaries:

1. The Phase 4 Messenger member-count trigger recalculated a count without first serializing concurrent membership changes. RUN441 changes the held proposal to lock affected conversation rows in deterministic order before recalculation.
2. RUN429 Community invitation creation locks the Community row before the invitation row, while its original acceptance RPC locked the invitation before the Community row. That inversion can deadlock during concurrent invitation creation and acceptance. RUN441 adds a separate held `CREATE OR REPLACE FUNCTION` correction that follows Community → invitation lock order. The historical RUN429 migration itself is not edited.

Neither source correction is database-verified until it is applied and exercised on an isolated PostgreSQL 17 clone with the exact required schema and dependencies.

## Disposable database prerequisites

- Create a disposable PostgreSQL 17 database/instance with no connection to production or Testnet credentials.
- Reconstruct the exact required schema and extensions from a known-good migration snapshot; record the snapshot hash and PostgreSQL version.
- Apply the RUN429 source migration and held Phase 4 proposal only inside this disposable instance, then apply the RUN441 Community lock-order correction proposal.
- Seed synthetic accounts, profiles, communities, direct conversations, memberships, block rows and notification prerequisites. Use no real user identifiers or wallet data.
- Capture schema/catalog fingerprints before and after; run the test inside a rollback-capable harness and destroy the instance afterward.
- Use two independent database connections for concurrency cases. Record transaction start/end, SQLSTATE, returned JSON and final row invariants.

## Community invitation cases

| Case | Concurrent actions / input | Required result |
|---|---|---|
| C1 | Authorized owner creates the same invite twice | One pending invitation; second response is idempotent; one logical notification |
| C2 | Two moderators create the same invite concurrently | No duplicate pending rows; no deadlock |
| C3 | Invitee accepts while moderator reissues/creates invite | Community → invitation lock order; no deadlock; final invitation state is singular and valid |
| C4 | Invitee accepts the same invitation from two devices | One membership transition; second call returns idempotent accepted result |
| C5 | Invitee accepts while another request declines | Exactly one terminal status wins; no duplicate membership/notifications |
| C6 | Expired, revoked, deleted-community or banned-member acceptance | No membership grant; stable explicit error/terminal state |
| C7 | Non-invitee responds to another user's invitation | Not found/forbidden; no state change |
| C8 | Block relationship exists before acceptance | No membership grant |
| C9 | Community membership accepted | `gh_community_members` gains active membership; `gh_conversation_members` remains unchanged |
| C10 | Repeated invitation create after acceptance | No new pending invite while target is already an active member |

## Messenger group and invitation cases

| Case | Concurrent actions / input | Required result |
|---|---|---|
| M1 | Same actor + request ID + exact payload from two connections | One group, one invite per target, one logical notification per invite |
| M2 | Same actor + request ID with changed title/source/invitees | `IDEMPOTENCY_CONFLICT`; no second group |
| M3 | Same actor + request ID after process restart | Durable idempotency still returns the original group |
| M4 | Group create with non-member source actor, invalid peer count or unknown invitee | Rejected; no partial group/invite/notification rows |
| M5 | Block exists before group creation | Rejected; no group or invitations |
| M6 | Two devices accept one invite simultaneously | One active member row; stable idempotent result |
| M7 | Accept vs decline same invite | Exactly one terminal invitation state; membership only if accepted |
| M8 | Expired invite, creator leaves, or group is deleted | No member grant; invitation/group unavailable outcome |
| M9 | Block is added while invitation acceptance runs | Verify the chosen serialization contract; no acceptance after a block has committed before the authorization decision |
| M10 | Two members join/leave concurrently in one group | `member_count` equals count of rows with `left_at IS NULL` after both commits |
| M11 | Membership row moves between conversations concurrently in opposite directions | Deterministic conversation-row lock ordering; no deadlock; both counts correct |
| M12 | Insert, soft-leave, rejoin, hard-delete and conversation move | Trigger keeps old/new conversation counts exact |
| M13 | Notification helper fails during group creation/acceptance | Entire RPC transaction rolls back all group/invite/member state; no orphan rows |
| M14 | Retry after client timeout following commit | Same request returns durable prior result; no duplicate side effects |

## Contact-sharing cases

- Only the current conversation member can share their own profile.
- Private/matches-only profile visibility blocks sharing.
- Phone, email and private profile payload fields never appear in the durable message.
- Reciprocal block prevents sharing.
- Same client message ID + exact payload returns the original message; changed payload returns idempotency conflict.
- Concurrent duplicate sends create exactly one message and one conversation preview update.

## Catalog and security assertions

- RLS enabled on `gh_conversation_invites`; client policy denies all rows; no `anon`/`authenticated` table privileges.
- `SECURITY DEFINER` functions have pinned `search_path`; `PUBLIC`, `anon` and `authenticated` execution is revoked; only intended service-role execution remains.
- Verify function owner, body fingerprint, ACL, table/index definitions and trigger definition after applying the proposal.
- Verify all notification helpers and member-count triggers participate in the same transaction as their owner RPC.
- Verify no invitation acceptance grants chat membership for a Community invitation.
- Verify no pending invite or membership count can be duplicated under concurrent retries.

## Acceptance evidence required

The rehearsal is accepted only when the disposable PostgreSQL 17 instance executes every case above, including true two-connection races, with final invariant queries and logs saved. A static source check, SQL parse, single-connection test, or Testnet catalog lookup is not a substitute. The migration remains held until the rehearsal passes, migration history is reconciled, and the user separately authorizes any Testnet application.

## Current execution limitation

RUN441 workspace inspection found no `psql`, `postgres` server binary or Docker runtime. Therefore no PostgreSQL transaction was executed in this increment. The lock-order and member-count changes are held source proposals only. No migration was applied and no connected database was mutated.
