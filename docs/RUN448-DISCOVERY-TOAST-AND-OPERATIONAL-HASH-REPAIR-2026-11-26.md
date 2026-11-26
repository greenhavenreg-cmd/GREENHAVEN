# RUN448 — Discovery toast and operational RPC hash repair

**Package:** `gh-connect@0.338.160`  
**Parent candidate:** RUN447 / `0.338.159`  
**Date:** 26 November 2026

## Vercel-reported failures addressed

- Removed the duplicate `addToast` property declaration from the `useGHCDiscovery()` local contract. The retained declaration matches the actual success/error/info toast calls.
- Imported `createHash` from `node:crypto` in the server-only marketplace operational RPC module, matching the project's existing Node crypto convention. The SHA-256 evidence fingerprint behavior is unchanged.
- Added `check-run448-discovery-toast-and-operational-hash.mjs` to `verify:static` and `prebuild:checks`.
- Bumped package, lockfile, app release identity and verified manifest to `0.338.160`.

## Verification boundary

The focused RUN448 regression contract and static source checks can verify the declarations and import. A complete `tsc --noEmit` and Next.js production build on the required Node.js 24.15.x runtime remain necessary. The user's supplied log proves RUN447's 468 prebuild checks and optimized bundle compilation, but then shows TypeScript failures; it is not evidence that RUN448 builds. No remote Git, Vercel, database or payment-provider action was performed.
