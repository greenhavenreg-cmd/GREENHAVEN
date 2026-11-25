# Run 419 — Run 406 release-version check repair

Date: 2026-11-25

## Root cause

The Vercel prebuild reached check 441/445 and stopped in `scripts/check-run406-server-read-wallet-repair.mjs`. The project package, lockfile, and app release metadata were aligned at `0.338.137`, but this checker still hard-coded `0.338.136`, producing a stale assertion.

## Repair

- Changed the Run 406 release check to validate that `package.json`, both package-lock version fields, and `APP_RELEASE_VERSION` agree dynamically with the current package version.
- Kept all other Run 406 assertions unchanged, including least-privilege server reads, RLS/client access protections, fail-closed visibility, marketplace server authority, explicit registration reward claiming, and separate PI/GHC rails.
- No dependencies, migrations, environment secrets, withdrawal settings, payout gates, or live services were changed.

## Validation

- `node scripts/check-run406-server-read-wallet-repair.mjs`: 9/9 passed.
- `node scripts/check-run337-github-audit-recovery.mjs`: 7/7 passed.
- `node scripts/check-run300-release-integrity.mjs`: 22/22 passed.
- ZIP archive integrity and inclusion of the updated checker and report verified.

The complete 445-check prebuild, Next.js production build, GitHub push, Vercel deployment, and live Testnet/provider acceptance are not claimed. Run the next Vercel build to discover whether any later checks need repair.
