# GreenHaven upgrade worklog — 0.338.147 / RUN434

**Date:** 26 November 2026  
**Parent candidate:** `0.338.146` / RUN433 Phase 2 Integrated Social Transformation  
**Accepted source archive:** `GREENHAVEN-0.338.139-RUN426-PHASE0-SOCIAL-EXPERIENCE-FOUNDATION-2026-11-26.zip`  
**Candidate status:** Source-only; not accepted, pushed or deployed.

## Phase 3 scope

Architecture, identity and durable operation boundaries, following the ten-phase completion roadmap. This is not the separate product UX Phase 3 label used by older historical records.

## Audit work

- Rebuilt the route/writer inventory against all 284 current `app/api/**/route.ts` handlers.
- Recorded route methods, auth/session/rate-limit/body-bound/idempotency signals, identity-like request fields, RPC names and table references.
- Manually classified the sensitive routes the lexical scan could not classify by helper name: logout, Pi bootstrap, session read, worker-trigger wrapper and public health summaries.
- Reviewed canonical Pi UID → `gh_pi_identities` → canonical GH ID mapping, `gh_sessions` persistence/validation and session-grade security gate.
- Reviewed cross-route RPC reuse. Shared RPC use is not itself duplicate authority; the duplicate `ghc_execute_spend` transport wrapper was the narrow route-level duplication consolidated here.
- Reviewed the generic transactional outbox proposal. It remains proposal-only because it is not integrated into owner RPC transactions or proven against worker crashes, retries, lease loss, poison payloads, replay and consumer deduplication.
- Inspected Testnet catalog read-only. No Mainnet catalog evidence is claimed.

## Implemented changes

1. Added `lib/server/economy/execute-spend-rpc.ts` as the sole HTTP transport for `ghc_execute_spend`, used by both Wallet/catalog spending and Marketplace GHC order payment. It preserves the canonical database RPC and response parser, server-provided identity/amount/reference, no-store transport and 10-second timeout.
2. Added `operatorKeyValueAuthorized` and changed operational financial routes to accept only `GHC_OPERATOR_RECONCILE_KEY`. `GHC_A2U_ADMIN_KEY` can no longer authorize disputes, refunds, payout corrections or membership operator workflows.
3. Added the server-owned `service:operator-key` audit principal. Dispute, refund and payout-correction records no longer accept caller-supplied `actorId`, `decidedBy` or `approvedBy` values as audit identity. The shared key does not identify a human operator; individual attribution requires a separate session-bound operator identity design.
4. Added `scripts/check-run434-phase3-authority-boundaries.mjs` and `scripts/test-run434-operator-key-isolation.mjs`, registered in `prebuild:checks` and `verify:static`.
5. Added `scripts/audit-run434-phase3-authority-boundaries.mjs`, the current route/writer CSV and this Phase 3 audit report.
6. Synchronized package, lockfile, app release, verified migration manifest and project documentation to `0.338.147`.

## Coordinated release implementation steps

1. Confirmed the accepted source archive and current RUN433 parent candidate before editing.
2. Reopened the archive and verified its ZIP integrity and package identity.
3. Rebuilt the 284-route inventory from the actual App Router source.
4. Classified the lexical auth-review queue by cookie, provider-token, worker-secret, operator-key and public-health behavior.
5. Traced Pi UID verification through the durable identity mapping to the canonical GreenHaven account ID.
6. Traced GH session issuance, durable storage, cross-instance validation and session-grade authorization.
7. Compared route-level RPC reuse and identified the duplicated GHC spend HTTP transport.
8. Consolidated Wallet and Marketplace GHC spend transport without changing the canonical database RPC or amount authority.
9. Removed cross-purpose A2U key fallback from operational financial endpoints.
10. Replaced caller-supplied operator audit actor labels with the server-owned service principal.
11. Reviewed the transactional-outbox proposal and retained it as held until owner-RPC atomicity and consumer retry behavior can be proven.
12. Captured Testnet catalog and advisor evidence read-only, without schema or data mutation.
13. Added source/runtime regression gates and synchronized release metadata and documentation.
14. Re-ran focused identity, wallet, idempotency, documentation and release integrity checks.

## Verification

- Full `npm run verify:static`: **5,306 PASS output lines, zero FAIL lines**.
- Prebuild dry-run: **458 checks discovered**; actual prebuild is blocked by Node 22.16.0 before executing the checks.
- Nine changed TypeScript files pass parser transpilation with zero syntax diagnostics.
- RUN434 source contract: **17/17 PASS**.
- Operator-key isolation runtime test: **6/6 PASS** under Node 22.16.0 with experimental TypeScript stripping.
- Route inventory: **284** route handlers scanned.
- Testnet read-only catalog: **322** public SECURITY DEFINER functions; **0** executable by `anon` or `authenticated`; **311** executable by `service_role`.
- Testnet read-only RLS catalog: **37** public tables with RLS enabled and no policies; **0** grant DML to `anon` or `authenticated`; **27** grant DML to `service_role`.
- Supabase Security Advisor: 37 INFO findings for RLS enabled/no policy, consistent with server-only access; no generic client policies should be added.
- Supabase Performance Advisor: 17 unindexed foreign keys and 183 unused-index notices; no index changes made without query-plan/workload evidence.
- Existing Phase 3 boundary check: **7/7 PASS**.
- Existing Phase 4 identity/authentication check: **16/16 PASS**.
- Existing wallet authorization check: **27/27 PASS**.
- Existing transfer-request idempotency check: **11/11 PASS**.
- RUN341 identity audit: **11/11 PASS**.
- RUN372 canonical identity principal: **9/9 PASS**.
- RUN377 identity/session ACL: **24 assertions PASS**.
- The older `check-phase2-architecture-identity-2026-11-04.mjs` initially found its canonical report path missing because the report had been archived; a compatibility pointer now preserves that contract without restoring stale implementation guidance.

## External acceptance still open

- Node 24.15.0 dependency-backed typecheck, lint, production build and fresh dependency security audit. The current workspace has Node 22.16.0 and no installed dependencies.
- Disposable PostgreSQL rehearsal for held atomic session-cap and RUN429 Community invitation SQL.
- Exact Testnet migration history/catalog reconciliation; do not replay or repair migration history automatically.
- Multi-instance session-cap race tests, account switching, stale/revoked session and identity-store outage tests.
- Duplicate spend, mismatched idempotency payload, timeout-after-commit and retry-after-restart tests on disposable PostgreSQL.
- Two-account/multi-device Testnet acceptance and separate read-only Mainnet evidence.

## Safety boundary

This worklog records a **source-only verification scope**. Passing source contracts do not establish live Testnet/Mainnet behavior or production acceptance.

No SQL migration was added or applied. No Supabase live data/schema mutation, GitHub push, Vercel deployment, Pi provider operation, wallet transaction, GHC transaction, payout, membership change or Mainnet action occurred. RUN429 remains held. Production and Mainnet remain **NOT APPROVED**.
