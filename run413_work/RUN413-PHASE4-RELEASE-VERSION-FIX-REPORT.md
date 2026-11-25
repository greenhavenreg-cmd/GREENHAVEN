# Run 413 — Phase 4 Release Version Alignment

Date: 2026-11-25
Source archive: `GREENHAVEN-0.338.137-RUN412-TESTNET-PI-WITHDRAWAL-PIN-PROOF-READINESS-2026-11-25.zip`
Project package version: `0.338.137`

## Root cause

`scripts/check-phase4-identity-integration.mjs` compares `APP_RELEASE_VERSION` in `lib/app-release.ts` with the authoritative version in `package.json`. The package and lockfile were already aligned at `0.338.137`, but `APP_RELEASE_VERSION` was still `0.338.136`, causing the release-summary check to fail.

## Change

Updated only `APP_RELEASE_VERSION` in `lib/app-release.ts` from `0.338.136` to `0.338.137`. No identity hydration behavior, wallet or withdrawal logic, payout flags, migrations, dependency versions, or Vercel settings were changed.

## Verification

- `node scripts/check-phase4-identity-integration.mjs`: **17/17 passed**.
- Full `node scripts/run-prebuild-checks.mjs`: **not run to completion**. The available local runtime is Node.js `22.16.0`, while the project explicitly requires `^24.15.0`; the runner stopped at its runtime guard before executing the complete prebuild suite.
- No Vercel build or deployment was performed.

## Next step

Use Node.js `24.15.0` or a compatible Node 24 release in the local environment, run `npm run prebuild`, and then push the verified source to GitHub Desktop/GitHub. Do not treat this local targeted check as proof that all prebuild gates or the Vercel deployment pass.
