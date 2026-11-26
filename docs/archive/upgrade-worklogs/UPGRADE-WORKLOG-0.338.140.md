# Upgrade worklog — GreenHaven 0.338.140 / RUN427 Phase 1A

**Date:** 26 November 2026  
**Parent:** 0.338.139 / RUN426 Phase 0  
**Scope:** First user-facing Community directory implementation increment.

## Changes

- Added the Managed directory state alongside My and Discover.
- Derived managed communities from creator identity and authenticated viewer role (`owner`, `admin`, `moderator`).
- Preserved the existing identity alias resolver and authenticated membership-list enrichment.
- Added managed attention filters and an actionable empty state.
- Corrected community card role presentation to use the current viewer's actual role where available.
- Added `scripts/check-run427-phase1-community-directory.mjs` and registered it in `verify:static`.
- Bumped package, lockfile and app release version to `0.338.140`.

## Verification

- RUN427: 7/7 source checks pass.
- RUN426: 15/15 source checks pass.
- Full static suite is blocked by an existing RUN337 source baseline issue: root `.env.example` is absent, causing 3 assertions to fail. The suite exits at RUN337 before completing later gates.
- Typecheck, lint and production build remain unverified because dependencies are not installed in this extracted workspace and the available Node runtime (22.16.0) does not meet the project's `^24.15.0` engine requirement.

## Explicitly not performed

- No database migration or schema change.
- No live Supabase data mutation.
- No Pi/GHC/wallet/payment/payout change.
- No GitHub push or Vercel deployment.
- No Mainnet enablement; Pi remains Testnet-only.

## Next

Continue Phase 1 with an authenticated invitation-list contract (only if the existing invitation model/RPC can safely support it), then complete the community workspace and lifecycle before proceeding through Messages and Discovery. Do not simulate invitation records or weaken server-side authorization to make the UI appear populated.
