# RUN372 — Canonical identity principal consolidation

**Package:** `gh-connect@0.338.101`  
**Baseline:** user-designated RUN339 source archive, via local RUN340 payment maintenance and RUN341 identity audit derivatives  
**Scope:** client identity principal semantics, authentication bridge contract, account-switch isolation, regression gates  
**Status:** source-only; NOT APPROVED for production

## Decision

GreenHaven uses one canonical application account principal: the stable GreenHaven user ID returned by the durable server-side mapping for the verified Pi app UID. The Pi UID is the authentication-provider subject used to locate that account; it is not a second GreenHaven account ID and is not allowed to become the canonical app principal before verification.

This is deliberately not a blanket replacement of every stored `gh_user_id` with a Pi UID. Existing sessions, profiles, memberships, wallets, ledgers, marketplace orders, payout authorizations and other records use the stable GreenHaven account key. The mapping also isolates the application from Pi provider identity lifecycle changes. Replacing those keys without a complete target-schema and row-level reconciliation could orphan or misattribute durable and financial records.

## Changes

- `resolveCanonicalUserId` no longer accepts Pi UID as a fallback candidate.
- Pi SDK login without a verified durable mapping retains the local non-production placeholder rather than assigning the Pi UID as `userId`.
- A claimed `verifiedByServer` flag is insufficient by itself: verification now requires a non-empty Pi UID and a non-placeholder canonical GreenHaven account ID.
- Unverified SDK identity no longer marks the GreenHaven account as authenticated/active or accepts server-owned onboarding completion state.
- Profile hydration cannot replace the canonical account principal while a Pi identity is awaiting server mapping.
- Account changes continue clearing previous account credentials, labels, onboarding state and verification timestamps.
- Local onboarding stamps use only the canonical GreenHaven account ID; Pi UID is not written as an alternate local account key.
- Transitional alias helpers remain for reading legacy content references. Their contract explicitly prohibits using aliases as server-side ownership, wallet, payout or financial authorization evidence.
- Added RUN372 source and runtime regression gates and registered them in prebuild, pretypecheck and static verification.
- Bumped package/release metadata to `0.338.101`.

## Verification

- RUN372 principal contract: 9/9.
- Canonical identity runtime: 34 assertions.
- Phase 2 canonical identity: 18/18.
- Phase 4 identity authentication: 16/16.
- Phase 4 identity integration: 17/17.
- Phase 4 identity/community/messaging: 32/32.
- Run 250 immutable mapping integrity: 10/10.
- Run 251 SECURITY DEFINER ACL: 8/8.
- Run 252 search-path hardening: 5/5.
- Account-switch engagement: 15/15.
- Pi auth scope isolation: 6/6.
- Profile identity snapshot: 8/8 source checks and 13 runtime assertions.

The available runtime is Node 22.16.0 while the project requires Node `^24.15.0`; no dependency-backed typecheck, lint or Next.js production build is claimed. Full `npm run verify:static` and live Testnet acceptance must be recorded separately if not run successfully in this environment.

## Explicitly not performed

- No SQL migration was added or applied.
- No identity, profile, session, wallet, payment, ledger, membership, marketplace or entitlement rows were modified.
- No Pi payment, A2U payout, withdrawal, or wallet authorization was executed.
- No GitHub push, Vercel deployment or Mainnet action occurred.

## Required next acceptance

1. Run supported Node 24.15.x dependency-backed typecheck, lint, prebuild and production build.
2. On Testnet, verify two existing accounts resolve to their established GreenHaven IDs after fresh Pi `/v2/me` verification.
3. Switch accounts in one browser and confirm previous cookies, profile data, wallet data, drafts, notification preferences and private content do not leak.
4. Test two-user IDOR boundaries across profile, messaging, communities, marketplace, GHC, Pi wallet authorization and withdrawals.
5. Reconcile the live schema and row counts for every identity-bearing table before proposing any future physical key migration.

**Release decision: NOT APPROVED pending supported-runtime and live Testnet acceptance.**
