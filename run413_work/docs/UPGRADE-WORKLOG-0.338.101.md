# Upgrade worklog — 0.338.101 RUN372

## Objective
Consolidate identity semantics so GreenHaven has one canonical application account principal and the Pi UID remains provider authentication metadata.

## Coordinated implementation steps
1. Reviewed the existing Pi identity mapping and session persistence contract.
2. Confirmed existing durable application records use the GreenHaven account key.
3. Removed Pi UID from canonical account-ID fallback resolution.
4. Kept Pi SDK-only identity unbound until server verification completes.
5. Required both verified Pi UID and canonical GreenHaven account ID for server-verified state.
6. Prevented profile hydration from promoting an unverified provider subject.
7. Preserved account-switch cleanup and restricted onboarding stamps to the canonical ID.
8. Retained legacy aliases only for compatibility and explicitly prohibited their use for financial authorization.
9. Added and registered source-level and runtime regression gates.
10. Updated release metadata, project truth and operator acceptance documentation.

## Implementation
- Removed Pi UID as a fallback from canonical GreenHaven account ID resolution.
- Kept SDK-only Pi identities unbound until the server confirms the durable Pi→GreenHaven mapping.
- Required both a Pi UID and a non-placeholder canonical account ID before accepting server-verified identity state.
- Prevented unverified profile hydration from promoting a provider subject to an app account ID.
- Kept account-switch cleanup and restricted onboarding identity stamps to the canonical app account ID.
- Documented transitional Pi UID aliases as read compatibility only, not server-side ownership or financial authorization.
- Added source and runtime regressions to prebuild, pretypecheck and static verification.

## Validation
RUN372 contract 9/9; runtime 34 assertions; canonical identity 18/18; Phase 4 authentication 16/16; identity integration 17/17; identity/community/messaging 32/32; immutable mapping 10/10; RPC ACL 8/8; search-path hardening 5/5; account-switch engagement 15/15; Pi auth scope 6/6; profile identity snapshot 8/8 source checks plus 13 runtime assertions. Release hygiene 17/17; project truth 11/11; documentation hygiene PASS; migration source manifest 231/231.

The full static verifier was attempted but did not complete: its first attempt exposed a stale historical release-pointer assertion, which was corrected; the next attempt stopped because the current worklog for 0.338.101 was missing. The worklog has now been added. Full `npm run verify:static` must be rerun. This is a source-only verification scope. Node.js 22.16.0 is available; the project requires Node.js 24.15.0 (`^24.15.0`), and dependencies are not installed. No full typecheck, lint or Next.js build is claimed.

## Safety boundary
No SQL migration, live database write, identity/profile/session/financial record change, payment, withdrawal, payout, GitHub push, Vercel deployment or Mainnet action was performed. Production remains NOT APPROVED pending supported-runtime and live Testnet acceptance.
