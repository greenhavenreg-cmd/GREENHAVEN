# Build incident: Phase 5 release-summary contract

## Symptom
The Testnet Preview build stopped at prebuild check 001 because `lib/app-release.ts` no longer contained the release-summary phrase required by `scripts/check-phase5-runtime-acceptance.mjs`.

## Resolution
Restored the required phrase `configuration, package metadata and component security review` in the release summary while retaining the Testnet Preview profile-reconciliation details. The acceptance check remains unchanged and active.

## Verification
- Phase 5 runtime acceptance guard: 15/15 passed.
- Release hygiene: 21/21 passed.
- Project truth: 11 checks passed, 0 failures.
- Run #269 client-table/sequence ACL contract: 20/20 passed.
- Full prebuild not run: local runtime is Node 22.16.0; project requires Node ^24.15.0. Run the complete prebuild and build under Node 24 before treating the release as build-certified.

No database migrations, environment secrets, payment authority, wallet authorization, or Production configuration were changed for this repair.
