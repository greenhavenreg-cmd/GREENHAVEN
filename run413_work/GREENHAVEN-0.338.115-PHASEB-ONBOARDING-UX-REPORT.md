# GreenHaven 0.338.115 — Phase B Onboarding UX Transformation

**Baseline:** `GREENHAVEN-0.338.114-RUN392-PHASE3-4-PI-IDENTITY-OPTIONAL-PROFILE-2026-11-24-1.zip`

**Scope:** Phase B only — onboarding UX and progressive profile enrichment. This upgrade builds on the Run 391 Phase A onboarding identity gate and Run 392 verified Pi username/profile synchronization and explicit wallet-consent work.

## Implemented

- Reworked the first profile step to clearly describe name, birth date, gender, location and bio as optional profile enrichment.
- Removed compulsory first/last name, date-of-birth, gender and location requirements from general onboarding progression. Values are validated only when supplied; an entered birth date must still satisfy the existing adult validation.
- Removed minimum selection requirements for connection goals and interests and removed the required-photo gate.
- Kept profile enrichment saves conditional, so empty optional steps do not issue empty profile updates or overwrite existing profile values.
- Kept existing profile values and the verified Pi username as the initial display fallback. The verified Pi username is no longer incorrectly split into required first/last-name inputs.
- Added an authenticated Pi identity presentation to the profile setup step.
- Added a direct “Enter GreenHaven” path from the welcome introduction and retained “Skip for now” within the progressive flow.
- Added visible, accessible persistence error messaging to welcome and profile-flow footers.
- Preserved the existing durable avatar upload flow and server-confirmed onboarding completion behavior.
- Added `scripts/check-run393-phaseB-onboarding-ux.mjs` and wired it into `check:run393` and `verify:static`.
- Bumped project version to `0.338.115` in package metadata and lockfile metadata.

## Security and scope boundaries

- No Pi authentication or canonical identity authority was replaced.
- No wallet authorization, withdrawal destination, PIN, payout, ledger or balance logic was changed.
- No Supabase migration, bucket visibility, Storage policy or live database setting was changed in this Phase B UX task.
- Age-restricted feature eligibility remains a feature-level responsibility; an entered date of birth is still validated by the existing adult-date helper.
- Server-side onboarding completion still requires the established server identity confirmation. Optional profile fields do not bypass that gate.

## Verification

| Check | Result |
|---|---|
| Run 393 Phase B onboarding UX contract | PASS — 14 assertions |
| Run 391 Phase A identity/onboarding gate | PASS — 12 assertions |
| Run 392 Pi username/profile/optional-gate contract | PASS — 14 assertions |
| Phase 7 premium profile experience | PASS — 9/9 |
| TypeScript TSX transpilation of onboarding component | PASS |
| Full TypeScript project check | BLOCKED — dependencies were not installed |
| Clean dependency install | TIMED OUT; environment Node is v22.16.0 while project requires Node ^24.15.0 |
| Full Next.js production build | NOT RUN — dependency install unavailable and runtime version mismatch |

## Migration and deployment status

No migration was added or modified. No database operation, live Supabase configuration change, Git push, Vercel deployment or production setting change was performed.

## Readiness

**Phase B source implementation: complete.** Static contracts and TSX syntax transpilation pass. Full project typecheck, clean build and device-level onboarding QA remain unverified because this execution environment has Node v22.16.0 and dependency installation did not complete; the project requires Node v24.15.0 or newer within the configured major line.
