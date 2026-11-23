# RUN341 — Identity systems audit and surgical maintenance

Date: 2026-11-23  
Baseline: 0.338.100 / RUN340 local working candidate, derived from the user-designated RUN339 source baseline  
Disposition: source-only identity maintenance. No database writes, migrations, account changes, GitHub push, Vercel deployment, or Mainnet operation.

## Scope audited

- Pi SDK bootstrap and server `/v2/me` verification boundary.
- Pi app UID → immutable `gh_pi_identities` mapping → canonical internal GreenHaven user ID.
- App Studio parent-credential bridge and HttpOnly `gh_session` issuance/round-trip.
- Client identity state, account switching, bearer-token lifecycle and onboarding state.
- Session resolution, account security, profile ownership, profile hydration and public identity projection.
- Connections, messaging/community identity integration and server-side identity mapping contracts.
- Verification and professional/business identity presentation boundaries.
- Supabase identity persistence, service-role transport, migration/RLS/RPC ACL regression checks.

## Findings and fixes

### 1. External Pi UID was being conflated with the canonical GreenHaven user ID

The durable identity store explicitly allocates a stable internal UUID for `gh_user_id`, separate from the app-specific Pi UID. However, client `IdentityService.setFromPi` callers passed the mapped GH ID into the `uid` field, which also populated `piUserId`. This discarded the actual Pi UID alias and contradicted the database model.

**Fix:** `setFromPi` now accepts `canonicalUserId` separately. The canonical GH ID is stored as `userId`; the actual Pi `/v2/me` UID is stored as `piUserId`. Both identifiers remain available for matching without treating the external UID as the canonical database owner.

### 2. Account switching could retain the previous account's bearer token and profile state

`setFromPi` merged new account data into the prior singleton state. When a new Pi UID arrived without a new access token (for example, an SDKLite compatibility path), the previous account's access token, display name, onboarding flag and verification timestamp could survive the switch.

**Fix:** an explicit UID/canonical-ID change starts from a clean identity snapshot. Prior token, profile labels, onboarding state, verification state and account status are not carried into the new account. The current account's token is used only when supplied for that account. `isProductionIdentity()` now requires server verification, not merely an SDK-linked UID.

### 3. App Studio parent-credential bridge could mark the client authenticated after a failed server bridge

The parent-credential path previously treated the server bridge as best-effort and marked the client authenticated even when no durable GreenHaven identity/session was established. It also conflated the parent `appId` with a user's Pi UID.

**Fix:** the bridge now requires a verified response with both durable identity and durable session flags, then confirms the HttpOnly cookie by calling `/api/auth/session` and checking the exact canonical GH user ID. Production-like hosts fail closed if any of those checks fail. The local fallback remains available only where the existing explicit local-development policy allows it. The bridge stores `piAppUid` and `ghUserId` separately.

### 4. Pi identity last-seen maintenance used an invalid relative fetch URL

`touchLastSeen` called Node `fetch()` with a relative PostgREST path and swallowed the resulting failure, so last-seen timestamps could silently stop updating in server runtimes.

**Fix:** last-seen persistence now uses the central timeout-bounded `supabaseRest` client, with a five-second deadline and non-fatal telemetry handling. It does not alter identity ownership or verification.

### 5. Sandbox frame detection omitted the observed Pi app CDN referrer

The archive's sandbox frame helper accepted `sandbox.minepi.com` referrers but omitted the `app-cdn.minepi.com` host observed in the Pi Browser diagnostics.

**Fix:** `app-cdn.minepi.com` is accepted only when the app is actually framed and sandbox mode is active. A top-level page cannot qualify by referrer alone.

### 6. Historical regression checks encoded the old identity model

Two existing checks asserted that the external Pi UID must outrank the canonical GreenHaven user ID. That expectation contradicted the actual durable `gh_pi_identities` schema, where `gh_user_id` is an independent internal identifier.

**Fix:** the checks now verify that the canonical GH ID is authoritative, the Pi UID remains an alias, and account switches clear stale client identity state.

## Verification

- RUN341 identity audit contract: 11/11.
- RUN341 identity lifecycle runtime test: 24 assertions.
- Phase 4 identity authentication: 16/16.
- Phase 4 identity integration: 17/17.
- Phase 4 identity/community/messaging: 32/32.
- Phase 4 profile identity snapshot: 8/8 source checks; runtime snapshot test passed.
- Run #250 immutable Pi identity mapping: 10/10.
- Run #251 SECURITY DEFINER RPC ACL: 8/8.
- Run #252 function search-path hardening: 5/5.
- Phase 1–12 hardening regression: 19/19.
- Phase 2 canonical identity: 18/18.
- Full `npm run verify:static`: PASS (network/DB-independent suite).

## Boundaries and remaining acceptance

- No identity records, profiles, sessions, balances, wallet authorizations, payments or entitlements were mutated.
- No SQL migration was created or applied; the existing identity schema, RLS and service-role-only RPC boundaries were preserved.
- No live Testnet account switch, Pi Browser authentication, cookie persistence, multi-device session revocation or two-user IDOR test was executed.
- Full dependency-backed typecheck, ESLint and Next.js production build remain unverified because this workspace uses Node 22.16.0 (project requires `^24.15.0`) and has no `node_modules`.
- No GitHub push or Vercel deployment occurred. Production remains **NOT APPROVED**.

## Operator acceptance sequence

1. Deploy only to the Testnet Preview after a clean Node 24.15.x install and full typecheck/lint/build.
2. Sign in with Pi account A; verify `/api/auth/pi` maps `piAppUid` to the expected `ghUserId`, and `/api/auth/session` confirms the same durable session.
3. Switch to Pi account B in the same browser; verify no A token, profile identity, onboarding state or session is reused. Confirm B's `piAppUid` and `ghUserId` are distinct and correctly mapped.
4. Sign out and revoke sessions; verify the old cookie is rejected and the new session remains isolated.
5. Repeat on a second device/browser and verify profile, connections, messaging, wallet identity and account-security surfaces all resolve to the same canonical `ghUserId` without exposing private identity fields.
6. Run two-user ownership/IDOR checks on profile, connections, messaging, verification and session management before any release approval.


### RUN373 superseding correction (2026-11-23)

The earlier RUN341 acceptance of `app-cdn.minepi.com` as a Sandbox referrer was incorrect. RUN373 supersedes that specific decision: `app-cdn.minepi.com` is not sufficient evidence of the Developer Sandbox wrapper and must not suppress the App Studio parent-credentials handshake. Only the exact `sandbox.minepi.com` referrer, together with Testnet mode and iframe framing, qualifies. The historical finding above is retained as an audit record, not current executable policy.
