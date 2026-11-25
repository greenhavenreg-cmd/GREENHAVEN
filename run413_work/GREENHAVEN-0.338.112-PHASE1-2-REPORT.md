# GreenHaven 0.338.112 — Phase 1 & 2 Onboarding Upgrade

Baseline: `GREENHAVEN-0.338.111-RUN390-BUILD-TYPEFIX-2026-11-24-1.zip`
Date: 2026-11-24

## Implemented

1. **Returning-user identity classification** (`app/api/auth/pi/route.ts`)
   - Any existing Pi-verified identity mapping is now classified as a returning user, even if an older release did not persist `onboarding_completed`.
   - Only a genuinely new identity mapping is sent into first-time onboarding.
   - This fixes the server-side root cause that repeatedly routed legacy users into the registration form.

2. **Optional profile completion** (`app/api/auth/onboarding-complete/route.ts`)
   - Removed the full profile-field checklist from the onboarding-completion endpoint.
   - Completion still requires a server-verified authenticated identity and a durable identity update.
   - Age, safety, wallet and other feature-specific eligibility checks must remain enforced at their relevant feature boundaries.

3. **Skip onboarding safely** (`components/ghc/onboarding.tsx`)
   - Added a persistent “Skip for now” action to the onboarding flow.
   - It calls the existing authoritative completion workflow; it does not locally pretend completion succeeded.
   - Profile data already entered remains optional and can be completed later.
   - Reduced the decorative splash delay from 2.2 seconds to 650 milliseconds.
   - Updated onboarding copy to explain that profile personalization can be completed later.

4. **Completion workflow alignment** (`contexts/ghc-context.tsx`)
   - Removed obsolete handling for the former 422 incomplete-profile response.
   - Retained server confirmation and production fail-closed behavior.

5. **Regression contract** (`scripts/check-run296-onboarding-registration.mjs`)
   - Replaced the old mandatory-profile assertions with progressive onboarding and returning-user identity assertions.

## Verification

Passed:
- `node scripts/check-run296-onboarding-registration.mjs` — 12 assertions.
- `node scripts/check-phase2-design-system-adaptive-shell.mjs` — 15/15.
- `node scripts/check-run379-pi-csp-auth-diagnostics.mjs` — 10/10.

Not verified:
- Full TypeScript check and production build. Dependency installation did not complete in this environment; the partial `node_modules` tree caused TypeScript to report missing type-definition packages. The environment runs Node 22.16.0, while this project requires Node 24.15.0 or newer. Re-run `npm ci` and the build under the project's required Node version.
- Live Pi authentication, Supabase identity writes and Vercel deployment require operator-side Testnet/Preview verification.

## Scope boundaries

This pass covers Phase 1 (identity/onboarding gate repair) and Phase 2 (onboarding UX). It does not change Pi username or wallet authorization capture, Supabase buckets/policies, withdrawal logic, GHC ledger behavior or other unrelated systems.
