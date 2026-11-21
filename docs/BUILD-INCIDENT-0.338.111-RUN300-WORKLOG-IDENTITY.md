# Build incident — Run #300 worklog identity mismatch

**Date:** 2026-11-21  
**Affected branch:** `testnet`  
**Observed commit:** `ff9505a`  
**Package:** `gh-connect@0.338.111`  
**Environment:** Vercel Preview only

## Failure

Vercel prebuild stopped at check 54/412 in `scripts/check-run300-release-integrity.mjs`. The failed assertion required the current worklog to contain the exact package identity `gh-connect@0.338.111`.

The current worklog `docs/UPGRADE-WORKLOG-0.338.111.md` described version `0.338.111` in its heading and narrative but did not include the canonical package identity string. All other Run #300 assertions in the supplied log passed.

## Repair

Added an explicit `Package: gh-connect@0.338.111` metadata entry and recorded the incident, root cause, and repair in the current worklog. Added this incident record for traceability. The release-integrity checker was not weakened, skipped, or changed.

## Verification

- Run #300 release integrity: 22/22 passed.
- Phase 24 final release review: PASS.
- Release hygiene: 21/21 passed.
- Project truth: 11/11 passed.
- Dependency security policy: 11/11 passed.
- The full 412-check prebuild was not run here because this workspace has Node.js 22.16.0; the project requires Node.js `^24.15.0`.

## Dependency security remains a separate release blocker

The supplied Vercel install log reports 22 npm audit findings (1 critical, 13 high, 6 moderate, 2 low) and deprecation notices for `isomorphic-dompurify@3.20.0`, `js-xdr`, `stellar-base`, `stellar-sdk`, and ESLint 9.39.5. A fresh registry-backed audit could not be retrieved in this workspace because `registry.npmjs.org` was unreachable (`EAI_AGAIN`). An offline npm audit result is not accepted as evidence that the advisories are resolved. No forced or speculative dependency upgrades were made. The existing dependency-security workflow remains fail-closed and must provide a fresh JSON audit artifact before dependency remediation can be safely scoped and verified.

## Boundaries

No canonical SQL migration, Supabase database, Vercel environment variable, secret, payment rail, wallet authority, ledger, GitHub branch, or deployment was modified. Production/Mainnet remains unapproved and untouched. This archive is a source-only repair candidate for manual review and push to `testnet`.
