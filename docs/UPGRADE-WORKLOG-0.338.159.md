# Upgrade worklog — 0.338.159 / RUN447

1. Started from the RUN446 `0.338.158` working candidate archive.
2. Reproduced the Vercel TypeScript failure at the community directory `GroupCard` role prop.
3. Added a canonical role normalizer with a typed union return value, legacy `mod` mapping and safe fallback.
4. Preserved creator identity precedence and joined/guest fallback semantics.
5. Removed the unused `communityIdentityId` memo dependency responsible for one reported lint warning.
6. Captured the Discovery `updateProfile` and `addToast` functions directly in the preference callback, resolving the missing-`ghc` exhaustive-deps warning without depending on the full context object.
7. Added and registered `check-run447-community-role-normalization.mjs` in `verify:static` and `prebuild:checks`.
8. Updated package, lockfile, release identity and source documentation to `0.338.159`.
9. Kept the RUN444 Testnet payment/withdrawal profile and all existing financial environment fences unchanged.
10. Kept the accepted archive boundary at 0.338.139; RUN447 is an unaccepted working derivative.
11. Kept migration, remote deployment, provider and Mainnet state untouched.

This is source-only verification scope. The supplied Vercel log establishes successful RUN446 bundle compilation but a TypeScript failure; it is not evidence for RUN447. A full TypeScript check and Next.js production build on the required Node.js 24.15.0 runtime are still required. No remote service, database, Git branch, Vercel deployment or payment rail was changed.
