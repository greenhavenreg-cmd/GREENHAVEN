# Run 423 — Run 411 Marketplace Commerce Release Check Repair

Date: 2026-11-25
Candidate release: `0.338.137`

## Failure addressed

Vercel prebuild check 445/445 stopped because `scripts/check-run411-marketplace-commerce-reliability.mjs` still required package/lock versions and release metadata to equal the stale literal `0.338.136`.

## Change

Updated the Run 411 checker to validate that `package.json` has a non-empty version, both package-lock root version fields match it, and `lib/app-release.ts` declares that same package version. Existing marketplace loading/error/retry, stale-order, durable-order, cart variant, and partial-checkout recovery assertions are unchanged. No application runtime logic was changed.

## Targeted verification

- Run 411 marketplace commerce reliability: 12/12 passed.

## Limitations

This verifies only the focused Run 411 check. The complete 445-check prebuild and Next.js production build have not yet been confirmed. No GitHub push, Vercel deployment, live database migration, or live wallet/financial operation was performed.
