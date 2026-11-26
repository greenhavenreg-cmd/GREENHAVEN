# GreenHaven Run 414 — Release metadata synchronization and Phase 24 review repair

Date: 2026-11-25  
Baseline package version: `0.338.137`  
Source: user-supplied `GREENHAVEN-0.338.137-RUN412-TESTNET-PI-WITHDRAWAL-PIN-PROOF-READINESS-2026-11-25.zip`, with coordinated Run 413/414 release-metadata repairs.

## Scope of this handoff
1. Preserve the user-supplied `0.338.137` project source and its existing architecture.
2. Synchronize the in-app release identity with package version `0.338.137`.
3. Synchronize current release references in the README, project truth, verified manifest and source-of-truth record.
4. Maintain this canonical versioned worklog for the Phase 24 release-review gate.
5. Preserve the release-integrity and Phase 24 gates; no check was removed, skipped or weakened.
6. Repair Run 403 so version agreement is checked dynamically against package and lockfile metadata.
7. Repair Run 405 so its release-version assertion is dynamic rather than pinned to `0.338.136`.
8. Clarify that the Run 405 handoff archive is local source and does not establish remote push, deployment, migration, or live provider state.
9. Preserve package and lockfile versions, dependency versions, migration SQL/classifications, wallet and withdrawal implementation, payout flags and application features.
10. Keep the release fail-closed until the supported-runtime build and live acceptance gates are completed.

## Verification evidence
- `scripts/check-phase4-identity-integration.mjs`: 17/17 passed after release-version synchronization.
- `scripts/check-run300-release-integrity.mjs`: 22/22 passed after current release metadata was synchronized.
- ZIP integrity and required source-file presence were checked when packaging the source handoff.
- The Vercel log subsequently reached prebuild check 271/445, after the Phase 22 marketplace atomic-transition gate and Phase 23 migration-integrity gate passed. Phase 24 then stopped because this versioned worklog was absent. This worklog addresses that specific missing-document failure.

## Release boundary and remaining verification
The source-only verification scope is limited to the targeted regression gates described here; it is not a full project acceptance claim. The supported runtime for full checks is Node.js 24.15.0 (`^24.15.0`). This is a source-level repair. The complete 445-check prebuild, Next.js production build, browser/Pi Browser acceptance, and deployment have not been verified by this change. No Supabase migration was applied and no Vercel environment setting was changed. Pi withdrawals, payments and other financial operations remain governed by their existing authorization and fail-closed controls; this worklog does not authorize or enable them.


## R2 reconciliation pass — 26 November 2026

1. Established the Phase 1–6 integrated archive as the active baseline and kept the former Run 423 / Run 411 archive as historical evidence.
2. Recovered repository ignore, CI, dependency-security and dependency-lock integrity files; verified exact Git blob identity against connected GitHub `testnet`.
3. Restored the 245-file migration source manifest and byte-verified each SQL migration.
4. Compared Supabase Testnet migration history by version and name; documented six absent source migrations, five version drifts and duplicate Run 406 history. No migration was applied.
5. Verified RLS and SECURITY DEFINER client privilege boundaries using read-only catalog queries.
6. Removed browser-local membership fallback from paid membership status display; stale display is limited to a previous server-confirmed status.
7. Reduced Rewards and Membership copy and removed redundant developer-style mission explanations.
8. Updated regression contracts for the concise copy and server-authoritative membership behavior.
9. Recovered historical release evidence with explicit notices and updated documentation hygiene classification.
10. Ran `npm run verify:static`: 63/63 passed; release hygiene 17/17; project truth 11/11.
11. Confirmed local Node 22.16.0 is below the pinned Node 24.15.0 runtime; typecheck, lint and full build remain unverified.
12. Confirmed GitHub and Vercel still reference the earlier `bc42129` commit; no push or deployment was performed.

Source-level checks do not constitute live Testnet acceptance. Mainnet and production remain NOT APPROVED.
