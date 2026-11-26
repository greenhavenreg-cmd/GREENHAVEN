# RUN435 — Phase 3 identity input classification

**Working package:** `gh-connect@0.338.148`  
**Parent candidate:** RUN434 / `0.338.147`  
**Date:** 26 November 2026  
**Disposition:** Source-level review and regression gate; no live acceptance implied.

## Review scope

RUN434's lexical inventory identified eight route handlers with identity-like request-body fields. This increment manually classifies those fields as either untrusted actor/owner aliases or legitimate domain targets, then adds a source regression gate.

| Route | Caller-supplied identity fields | Authoritative actor / owner | Domain target | Result |
|---|---|---|---|---|
| Communities POST | `createdBy`, `ownerId`, `userId`, `creatorId` | `auth.userId` | Community attributes only | Aliases ignored; creator derived from session |
| GHC spend POST | `userId`, `senderId` | `auth.userId` | Server-resolved order/reference | Aliases ignored; spend helper binds authenticated account |
| GHC transfer POST | `senderId`, `fromUserId`, `userId` | `auth.userId` | Recipient resolved from GreenHaven ID | Aliases ignored; recipient is a separately resolved counterparty |
| Marketplace listings POST | `sellerId`, `ownerId`, `userId` | `auth.userId` | Listing ID for update/read | Aliases ignored; seller is session-derived and updates check stored owner |
| Conversation messages | `senderId`, `userId`, `authorId`, `actorId` | `auth.userId` | Conversation/message/reply IDs | Aliases ignored; conversation membership and message ownership are checked by domain operations |
| Profile PATCH | `id`, `userId`, `ghUserId`, `gh_user_id`, `piId`, `piAppUid`, `ownerId` | `auth.userId` | Profile fields allowed by sanitizer | Identity/account fields removed before server profile upsert |
| Social follows POST | `followerId`, `actorId`, `userId` | `auth.userId` | `targetUserId` | Actor aliases ignored; target is sanitized against self-follow and passed separately |
| Post attention POST | `userId`, `actorId`, `viewerId` | `auth.userId` | Post ID from route and event metadata | Actor is assigned from authenticated session; body actor aliases are not used |

## Security interpretation

- Actor identity is not a client-selectable field in these handlers.
- A target/counterparty identifier is not an actor override. It must be independently resolved or validated and domain authorization still applies.
- Route-level source checks do not replace database constraints, RLS, SECURITY DEFINER ACL review, or two-account runtime tests.
- The inventory remains a lexical inventory; it is not a complete AST/control-flow proof for every route in the application.

## Regression gate

`scripts/check-run435-phase3-identity-input-classification.mjs` contains 16 source assertions covering the eight classifications, authenticated actor binding, and auth-before-body ordering. It is registered in both `verify:static` and `prebuild:checks`.

Result: **16/16 PASS** in the source workspace.

## Remaining Phase 3 acceptance blockers

This review does not resolve the non-atomic production session-cap path while `GHC_ATOMIC_SESSION_CAP_RPC_ENABLED` is disabled. The held `gh_session_issue_with_cap` proposal must be rehearsed against disposable PostgreSQL and the exact target migration history reconciled before enabling it. Enabling the flag without verified SQL deployment would make session issuance fail closed, so no environment change is appropriate here.

Also outstanding: disposable PostgreSQL concurrency/retry tests; duplicate-spend and timeout-after-commit tests; two-account/multidevice session and account-switch acceptance; supported Node 24.15.x dependency-backed typecheck/lint/build/security audit; Testnet migration-history reconciliation; and separate read-only Mainnet evidence. These are not safely simulatable from this source-only workspace.

No SQL migration was added/applied, no Supabase schema/data was changed, no GitHub push or Vercel deployment occurred, and no Pi/GHC/wallet/payment/Mainnet operation was performed. Production/Mainnet remain **NOT APPROVED**.
