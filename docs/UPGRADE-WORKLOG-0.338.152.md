# GreenHaven upgrade worklog — 0.338.152 / RUN440

**Date:** 26 November 2026  
**Parent candidate:** `0.338.151` / RUN439  
**Scope:** Phase 4 Identity & Authentication — durable session rotation concurrency and revocation-race hardening.

## Findings and changes

A review of `rotateSession` found that its durable update previously matched only the session ID. Two requests could both validate the same old cookie, independently generate replacement tokens, and both receive a success response even though the last database write invalidated the earlier response token. The same unconditional update also lacked an explicit unrevoked-row predicate.

RUN440 changes the rotation update to a compare-and-swap operation:

1. Audited the durable session store and identified the non-conditional token-hash update in `rotateSession`.
2. Confirmed the race: concurrent requests can validate one old cookie before either updates the shared session row.
3. Added a dedicated durable compare-and-swap helper rather than reusing the unconditional generic patch helper.
4. The update predicate matches the exact session ID, the previously presented token hash, and `revoked_at IS NULL`.
5. PostgREST returns the changed row representation; success is accepted only when exactly one row with the expected ID was changed.
6. A stale concurrent rotation, prior revocation or database failure returns no replacement session and fails closed.
7. The memory-only path rechecks the current token-hash index after asynchronous validation so concurrent requests in one process cannot both rotate the same old token.
8. The local cache is updated only after the durable compare-and-swap succeeds and the prior token index is still current.

9. Preserved the stable session ID so the existing step-up binding model is unchanged.
10. Preserved the absolute session expiry through `absoluteExpiresAt`; rotation does not extend that absolute lifetime.
11. Changed durable session enumeration to distinguish an empty account from an unavailable database. Device-management and session-cap callers now receive `SESSION_STORE_UNAVAILABLE` rather than treating a failed database read as an empty list. Session revoke-by-ID also fails closed if ownership enumeration cannot be completed.
12. Reviewed the held Phase 4 group/contact SQL proposal and removed an unbounded global expired-invitation update from group creation. Invitation expiry remains enforced by the per-invitation inbox/response paths; creating one group no longer sweeps every account's pending invitation rows.

## Verification

The contract checks inspect the source boundary and registration; they do not simulate a live PostgreSQL race. All results below are source-only verification scope evidence.

- RUN440 session rotation and session-store availability source contract: **12/12 PASS**.
- RUN440 concurrent memory-session rotation and durable-read outage runtime regression: **7 assertions PASS**.
- Existing Phase 4 identity/authentication contract: **16/16 PASS**.
- Phase 4 identity integration: **17/17 PASS**.
- Coordinated Phase 4 identity/community/messaging: **32/32 PASS**.
- Profile identity snapshot source contract: **8/8 PASS**; runtime: **13 assertions PASS**.
- RUN435 identity input classification: **16/16 PASS**.
- RUN429 durable community invitation source contract: **16/16 PASS**.
- Existing principal remapping runtime regression remains part of the source suite.
- The Phase 4 coordinated identity/community/messaging contract remains **32/32 PASS** after the held-proposal cleanup. No database was available for a real concurrent PostgreSQL transaction rehearsal in this workspace. The source contract is not a substitute for that rehearsal.

## Release and safety boundary

- Package candidate: `gh-connect@0.338.152`.
- Accepted baseline remains `0.338.139`; RUN440 is not accepted, pushed or deployed.
- Phase 3 operational acceptance remains blocked.
- Phase 4 source work continues; Phase 4 operational acceptance is not claimed.
- No migration, Testnet data mutation, financial operation, GitHub push, Vercel deployment or Mainnet action occurred.
- Node.js 24.15.0 dependency-backed typecheck, lint and production build remain outstanding because the workspace runtime is `22.16.0` and dependencies are not installed.
