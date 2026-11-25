# Run 420 — Run 407 Audit Release Consistency Repair

Date: 2026-11-25
Project release: `0.338.137`
Source of truth: uploaded `GREENHAVEN-0.338.137-RUN419-RUN406-RELEASE-VERSION-CHECK-REPAIR-2026-11-25-2.zip`

## Failure addressed

Vercel prebuild check 442/445 failed the Run 407 assertion `candidate package and in-app release agree` because the checker still hard-coded release `0.338.135`, while the project package, lockfile, and `lib/app-release.ts` consistently identify `0.338.137`.

## Minimal correction

Updated `scripts/check-run407-audit-integration.mjs` to compare the package version dynamically against both lockfile version fields and the in-app `APP_RELEASE_VERSION` declaration. This keeps the consistency gate strict without pinning it to a stale release number. The duplicate checker in the archived nested snapshot was also updated if present so the bundle does not retain contradictory stale logic.

No migration, ledger grant, wallet behavior, payout setting, environment secret, or deployment behavior was changed.

## Targeted verification

- Run 407 audit integration: 6/6 passed
- Run 406 server-read and wallet repair: 9/9 passed
- Run 405 local handoff: 10/10 passed
- Run 337 GitHub audit recovery: 7/7 passed
- Run 403 reward visibility: 6/6 passed
- Run 300 release integrity: 22/22 passed

The complete 445-check prebuild and production build have not been run/confirmed as part of this repair.
