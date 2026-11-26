# RUN434 — Phase 3 Architecture, Identity & Durable Operation Boundaries

**Working source:** `gh-connect@0.338.147` (derived from RUN433 / 0.338.146)  
**Generated:** 2026-11-26  
**Scope:** Ten-phase roadmap Phase 3.  
**Disposition:** Source audit and selected architecture fixes; external acceptance remains open.

## Method and limits

The inventory scans every `app/api/**/route.ts` file and records route methods, likely auth/session/rate-limit/body-bound/idempotency signals, caller-supplied identity-like fields, service-role transport signals, referenced RPC names and table names. This is deterministic lexical evidence, not an AST/control-flow proof. A token in a file does not prove every branch is protected; an absent token does not prove a defect because the route may use a signature, dedicated operator secret, middleware or a delegated helper.

Full route/writer inventory: `docs/RUN434-PHASE3-ROUTE-WRITER-INVENTORY-2026-11-26.csv`.

## Inventory totals

| Signal | Count |
|---|---:|
| routes | 284 |
| authOrOperatorGateSignals | 266 |
| sessionGradeGateSignals | 27 |
| durableRateLimitSignals | 157 |
| boundedBodySignals | 149 |
| idempotencySignals | 21 |
| bodyIdentityFields | 28 |
| serviceRoleTransportSignals | 56 |
| distinctRpcNames | 131 |
| rpcNamesUsedByMultipleRoutes | 10 |
| sensitiveRoutesWithoutAuthToken | 4 |

## Routes requiring manual authorization classification

These are lexical triage candidates, not confirmed vulnerabilities:

- `app/api/auth/logout/route.ts` (POST)
- `app/api/auth/pi/route.ts` (POST)
- `app/api/auth/session/route.ts` (GET)
- `app/api/economy/earnings/withdrawals/process/route.ts` (POST)

Manual review of this queue found:
- Logout/session endpoints intentionally use cookie/session semantics and must remain usable when a session is invalid or expiring.
- Pi bootstrap verifies the provider token and resolves the verified Pi UID to the canonical GH identity; it rate-limits and bounds the request.
- Scheduled/worker and diagnostic routes use dedicated operator, executor or cron credentials; health routes expose only a restricted public readiness summary, with detail gated by the operator diagnostics key.
- The five operational financial routes using `assertOperatorKey` had a key-scope defect: the shared operational key helper also accepted the A2U worker key. RUN434 removes that fallback.
- Dispute, refund and payout-correction audit attribution accepted caller-supplied actor/approver labels despite authenticating only a shared service key. RUN434 replaces these with the explicit server-owned principal `service:operator-key`. This does not claim an individual human identity.

## Canonical identity and session boundary

- Pi provider UID is verified through Platform `/v2/me`; it remains an external alias, not the canonical GH account ID.
- Durable `gh_pi_identities` mapping resolves Pi UID to the stable GreenHaven account ID.
- The HttpOnly GH session stores the canonical GH account ID; production refuses process-memory-only sessions.
- Session-grade account security uses `requireAccountSecurityContext` / `requireGhSession`, not Pi bearer bootstrap alone.
- Invalid GH session cookies may fall through to a verified Pi bearer for ordinary bootstrap-compatible routes; session-grade endpoints still reject that weaker auth source.
- Atomic session-cap issuance exists as a held proposal/opt-in RPC; it is not enabled by RUN434 because its SQL has not passed disposable PostgreSQL rehearsal and Testnet migration reconciliation.

## Writer authority map

| Domain | Canonical write authority | Required invariant |
|---|---|---|
| Pi identity | `gh_pi_identities` service-role store | Verified Pi UID maps to immutable canonical GH ID; insert-only conflict resolution |
| Sessions | `gh_sessions` service-role store and optional held atomic cap RPC | Token hashes only; durable lookup on every validation; revoked/expired rows deny |
| GHC ledger | Canonical ledger RPCs, including `ghc_execute_spend` | Auth-derived user, server-owned amount/reference, idempotent transaction |
| Membership | Payment-intent-bound membership RPCs | Verified completed provider intent; entitlement and ledger mutation atomic |
| Marketplace order payment | Durable order claim + canonical GHC spend or verified Pi intent flow | Claim protects inventory; ambiguous spend retains claim for retry/reconciliation |
| Seller payouts | Rail-specific PI/GHC/NGN RPCs and provider evidence | Provider binding and status transitions remain database-authoritative |
| Media | Upload-session/asset/finalize RPCs and authenticated media facade | Owner identity immutable across upload/finalize/read |
| Community/Messaging | Canonical domain RPCs and authenticated route adapters | Actor from verified session; membership/visibility rechecked server-side |
| Notifications/realtime | Existing domain event and notification contracts | Domain mutation remains authoritative; consumers must be idempotent |

The CSV lists route-level RPC/table references. RPC names invoked by more than one route include: `gh_community_chat_join`, `gh_content_event_record`, `gh_follow_status`, `gh_media_authorize_viewer`, `gh_post_feed_engagement_batch`, `gh_save_toggle`, `gh_social_notify_message_members`, `ghc_credit_pack_purchase`, `ghc_execute_spend` and `gh_seller_payout_transition`. These are shared canonical database operations, not duplicate database writers by themselves. RUN434 consolidates the duplicated `ghc_execute_spend` HTTP transport wrapper; payment, inventory and settlement semantics remain in the existing RPCs.

## Transactional outbox decision

The existing `docs/proposals/PHASE-I-TRANSACTIONAL-OUTBOX-DESIGN.sql` remains proposal-only. RUN434 does not create a generic outbox table or apply a migration. The proposal correctly warns that a separate PostgREST enqueue call is not atomic, but it has not been integrated into the owning business RPCs or proven under PostgreSQL concurrency, lease expiry, worker crash, duplicate delivery, poison payload, replay and consumer deduplication. Existing domain notification/realtime mechanisms already exist; adding a parallel queue before selecting event ownership and consumer contracts would create another source of truth. A later outbox migration must be added inside each owner RPC's transaction and use stable event IDs, payload-bound idempotency, lease fencing, bounded retries, dead-letter visibility and idempotent consumers.

## Testnet read-only evidence (2026-11-26)

- Public schema includes 322 SECURITY DEFINER functions; none are executable by `anon` or `authenticated`; 311 are executable by `service_role`.
- 37 public tables have RLS enabled and no policies. Catalog privilege checks show none grants DML to `anon` or `authenticated`; 27 are service-role accessible. This is consistent with intentional server-only tables, not a reason to add generic client policies.
- Security advisor reports the 37 RLS-without-policy tables as INFO findings; preserve server-only posture unless a reviewed client access requirement exists.
- Performance advisor reports 17 unindexed foreign keys and 183 unused indexes. Do not add/drop indexes without query-plan/workload review.
- This evidence is Testnet-only, read-only, and does not establish Mainnet parity or migration-history correctness.

## RUN434 implementation changes

1. One shared server-side `executeGhcSpendRpc` transport now serves both Wallet/catalog spending and Marketplace GHC order payment. It retains the canonical `ghc_execute_spend` RPC, server-owned caller bindings, bounded timeout, no-store transport and response-contract parser.
2. Operational reconciliation key scope is now strictly `GHC_OPERATOR_RECONCILE_KEY`; the A2U executor key no longer grants authority to dispute/refund/payout-correction/membership operator routes.
3. Shared-key operator audit labels now use `service:operator-key`, not caller-supplied `actorId`, `decidedBy` or `approvedBy` values.
4. Added regression checks for writer transport, auth-derived identity, key isolation, and audit attribution.
5. No database migration, deployment setting, external provider action, wallet/payment transaction or live data mutation was performed.

## Open acceptance gates

- Rehearse held session-cap SQL and RUN429 invitation SQL on disposable PostgreSQL; reconcile exact Testnet migration history before any apply.
- Run two-account identity/session revocation/account-switch and multi-instance session-cap concurrency tests.
- Run duplicate spend, mismatched idempotency payload, timeout-after-commit and retry-after-restart tests against disposable PostgreSQL.
- Complete Node 24.15.x dependency-backed typecheck, lint and production build.
- Obtain separate read-only Mainnet catalog/migration evidence; no Mainnet evidence is claimed.
- Keep Production/Mainnet NOT APPROVED until all operational gates pass.
