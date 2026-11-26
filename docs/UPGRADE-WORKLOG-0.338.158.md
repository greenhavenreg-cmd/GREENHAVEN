# Upgrade worklog — 0.338.158 / RUN446

1. Started from the RUN445 0.338.157 candidate supplied for this repair.
2. Reviewed the Vercel TypeScript error at the marketplace order payment route.
3. Traced `executeAuthoritativeSpend` to its canonical in-memory store implementation.
4. Confirmed its declared API accepts exactly `(store, input)`.
5. Confirmed the durable `executeGhcSpendRpc` API separately supports `transportError`.
6. Removed only the unsupported options argument from the in-memory fallback call.
7. Preserved the durable RPC transport error override and marketplace payment error handling.
8. Added a focused RUN446 signature regression check.
9. Registered the new check in both static verification and prebuild checks.
10. Updated package, lockfile, release metadata, current source-of-truth and operator documentation to 0.338.158.
11. Ran focused RUN446, RUN445 and RUN444 contracts plus documentation, release and project-truth checks.
12. Ran static verification; an unrelated legacy RUN301 evidence gate exposed stale worklog/build-context expectations, which were then corrected.

## Verification boundary

This is source-only verification scope. The supplied Vercel log proves RUN445's 466 prebuild checks and successful bundle compilation, but RUN445 failed TypeScript validation. RUN446's prebuild dry-run discovers 467 checks; dry-run does not execute them. A full run of `npm run verify:static` and a fresh Next.js production build remain required. The required runtime is Node.js 24.15.0. No Git push, deployment, database mutation, payment or withdrawal transaction was performed.
