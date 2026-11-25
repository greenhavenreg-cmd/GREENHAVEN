# Run 417 — Run 405 local handoff check repair

Date: 2026-11-25

## Root cause

The Run 405 regression gate hard-coded release version `0.338.136` while the package, lockfile, and application release metadata are on `0.338.137`. Its handoff assertion also checked for the old version string in `docs/SOURCE_OF_TRUTH.md`, so it incorrectly rejected the current source authority. The handoff document itself still identified source version `0.338.131` and did not make the local-source/live-operations boundary sufficiently explicit.

## Changes

- Changed `scripts/check-run405-local-handoff.mjs` to verify package, root lockfile, and app release versions agree dynamically rather than requiring an obsolete version.
- Updated the Run 405 handoff document's source version to `0.338.137`.
- Added explicit wording that the archive is local/source-only and does not prove a GitHub push, Vercel deployment, migration application, live database mutation, or live provider/runtime health.
- Updated the handoff regression assertion to check the current source version and the explicit local/live distinction.

## Validation

Validation performed: Run 405 local handoff gate 10/10; Run 403 reward-card gate 6/6; Run 402 net-first withdrawal-fee gate passed; Run 301 release-gate hardening 20/20; documentation hygiene passed. `npm run verify:static` was started but exceeded the 120-second execution limit after reaching the notification source gates and documentation hygiene; it is not claimed as a completed full-suite pass. The full 445-check prebuild, Next.js build, GitHub push, Vercel deployment, and live Testnet/provider acceptance are not claimed.
