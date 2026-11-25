# Run 422 — Run 410 Marketplace Maturity Release Check Repair

Date: 2026-11-25
Candidate release: `0.338.137`

## Failure addressed

The Run 410 marketplace maturity checker still hard-coded `0.338.136` for the package/lockfile version and app release version. The current package, lockfile root entries, and `lib/app-release.ts` consistently declare `0.338.137`.

## Change

Updated `scripts/check-run410-marketplace-maturity.mjs` so the package and both lockfile version fields must agree dynamically, and the app release declaration must match the candidate package version. All marketplace UX/data-availability checks and static/prebuild registration assertions remain unchanged. No marketplace runtime behavior, wallet behavior, financial gates, migrations, permissions, or secrets were changed.

## Targeted verification

- Run 410 marketplace maturity check: 10/10 passed.

## Limitations

The full 445-check Vercel prebuild and Next.js production build have not been confirmed by this repair. No GitHub push, Vercel deployment, live database migration, or live wallet/financial operation was performed.
