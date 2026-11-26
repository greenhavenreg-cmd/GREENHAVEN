# RUN445 worklog — Earnings dashboard build repair

**Package:** `gh-connect@0.338.157`  
**Parent:** `0.338.156` / RUN444  

1. Reproduced the source of the Vercel compiler error in `components/ghc/unified-earnings-dashboard.tsx`.
2. Confirmed React state and the render fallback alias were both declared as `snap` in the same function scope.
3. Renamed the state snapshot to `serverSnap` without changing its `Withdrawable | null` type.
4. Updated quote eligibility checks to read from `serverSnap`.
5. Updated the quote amount passed to the server from `serverSnap.withdrawable`.
6. Updated the fee-quote callback dependency array to `[serverSnap]`.
7. Updated loading and degraded-refresh guards to use `serverSnap`.
8. Preserved the render-only `snap` alias for `serverSnap || lastKnownSnapRef.current`.
9. Added a focused regression gate and registered it in static verification and prebuild checks.
10. Updated package, lockfile, in-app release, verified manifest and current source-of-truth metadata to `0.338.157`.

The Vercel-provided log confirms 465/465 prebuild checks passed before the build failed. RUN445 adds one check; the prebuild dry-run now discovers 466 checks. The focused RUN445 source regression and Phase 8 earnings-dashboard contract pass 13/13, and `npm run verify:static` exits successfully. Full Next.js build remains unverified locally because the available Node.js runtime is 22.16.0 rather than the required 24.15.0. No remote changes or payment operations occurred.

**Verification scope:** source-only verification scope; the focused regression gate does not substitute for a dependency-backed Next.js build. **Required runtime:** Node.js 24.15.0 (the local workspace is Node.js 22.16.0).
