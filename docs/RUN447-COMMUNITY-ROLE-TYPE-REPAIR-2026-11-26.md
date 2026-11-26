# RUN447 — Community directory role type repair

**Package:** `gh-connect@0.338.159`  
**Parent:** RUN446 / `0.338.158`  
**Date:** 26 November 2026

## Vercel evidence

The RUN446 Vercel production bundle compiled successfully, then TypeScript validation failed at `components/ghc/communities-screen.tsx:1900`. A persisted group role was inferred as a general `string`, while `GroupCard` deliberately accepts only the canonical `CommunityRoleLabel` union (`owner`, `admin`, `moderator`, `member`, `guest`).

## Repair

- Added `normalizeCommunityRole`, which converts recognized persisted role values into the canonical UI role union, maps the legacy `mod` alias to `moderator`, and uses a caller-supplied safe fallback for unknown values.
- Kept creator identity as the highest-priority `owner` role.
- The directory uses `member` as the fallback for joined communities and `guest` otherwise; unknown database values can no longer leak into the typed card contract.
- Removed the unnecessary `communityIdentityId` dependency from the Discover list memo, matching its actual dependencies and removing the associated exhaustive-deps warning.
- Stabilized the Discovery preference callback dependencies by capturing the exact `updateProfile` and `addToast` functions rather than closing over the entire `ghc` context object.
- Added a focused RUN447 regression check to both static verification and prebuild checks.

## Verification boundary

The RUN447 focused source contract is the targeted check for this repair. A full TypeScript check and Next.js production build on the required Node.js 24.15.x runtime are still required; the Vercel log supplied by the user is evidence for RUN446 only. The unrelated `discovery-grid-screen.tsx` missing-`ghc` dependency warning remains to be reviewed separately and has not been suppressed. No Git push, deployment, database mutation, provider transaction or Mainnet operation was performed. Testnet payment/withdrawal configuration is carried forward unchanged from RUN444.
