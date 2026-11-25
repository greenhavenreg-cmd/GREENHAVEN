# Run 414 — Release Metadata Synchronization

Date: 2026-11-25
Package version: `0.338.137`
Baseline: `GREENHAVEN-0.338.137-RUN412-TESTNET-PI-WITHDRAWAL-PIN-PROOF-READINESS-2026-11-25.zip`

## Trigger

The Vercel prebuild failed at check 39/445 in `scripts/check-run300-release-integrity.mjs`. Package/lockfile and in-app release identity matched `0.338.137`, but four authoritative metadata checks still referenced `0.338.136`: README, project truth, verified manifest, and current source-of-truth.

## Changes

- Updated the README current source version to `0.338.137`.
- Updated the active header/current identity fields in `docs/PROJECT_TRUTH.md`.
- Updated `VERIFIED_MANIFEST.txt` `project_version` to `0.338.137`.
- Updated the active identity pointer in `docs/SOURCE_OF_TRUTH.md` and recorded this metadata-only repair.
- Added no migrations and changed no package/dependency versions, payout flags, wallet/withdrawal logic, environment settings, or database state.
- Kept all integrity checks intact. Historical version references were not mass-rewritten.

## Verification

The targeted Run #300 release-integrity gate and Phase 4 release identity gate are run after the edits. Full 445-check prebuild, Next.js build, live Testnet behavior, and Vercel deployment are not claimed by this source-only repair.
