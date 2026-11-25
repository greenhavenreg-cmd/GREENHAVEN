# RUN391 — Phase A Identity and Onboarding Gate Repair

**Release:** GreenHaven 0.338.113  
**Base:** 0.338.112 Phase 1–2 onboarding archive  
**Date:** 2026-11-24

## Findings

1. The Pi authentication bridge returns a canonical GreenHaven user ID for both newly created and returning identities. The client incorrectly treated the mere presence of `identity.ghUserId` as proof that the identity existed before the current login. This could classify a genuinely new user as returning.
2. Client-side onboarding recovery heuristics could override an explicit server `required` result using a local onboarding stamp, profile shape or cached profile. On shared devices or after account switching, this could transfer one Pi account's onboarding state to another.
3. The app shell also allowed profile shape and local device stamps to override server onboarding state.

## Changes

- `contexts/pi-auth-context.tsx`: `identityExisted` now trusts explicit server classification (`identityExisted`, `isReturning`, or persisted `onboardingCompleted`). The presence of `ghUserId` is no longer used as a returning-user signal.
- `lib/onboarding-local.ts`: once the server has verified the Pi identity, the server's returning/required flags are authoritative. Local profile shapes and device stamps cannot override them. Without server verification, the UI remains `unknown` rather than inferring onboarding state from cached profile data.
- `contexts/ghc-context.tsx`: removed local-stamp/profile-shape overrides of an explicit server-required onboarding state. A verified server-complete state remains complete.
- Added `scripts/check-run391-phaseA-onboarding-identity-gate.mjs` and registered it in prebuild checks.
- Bumped package version to `0.338.113`.

## Verification performed

- RUN391 Phase A identity/onboarding gate contract: PASS (12 assertions).
- RUN296 progressive onboarding registration contract: PASS (12 assertions).
- RUN341 canonical identity audit: PASS (11/11).

## Not verified in this environment

The archive requires Node `^24.15.0`; the available runtime is Node `22.16.0`. Full dependency installation, TypeScript check, lint and production build were not run. Live Pi/Testnet and production database behavior also require operator-side verification.

## Security and behavior boundaries

- Pi `/v2/me` verified UID remains the external identity anchor.
- The server-side Pi-to-GreenHaven mapping remains canonical.
- No client-supplied UID or GH ID is trusted as ownership proof.
- No local profile or localStorage stamp grants authentication or authorization.
- Existing profile data and optional profile completion remain separate from authentication.
