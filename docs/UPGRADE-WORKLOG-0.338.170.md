# Upgrade worklog — 0.338.170 / RUN458

1. Started from RUN457 / `0.338.169`, preserving RUN453–RUN457 changes.
2. Audited Marketplace cart storage and confirmed the cache used a single browser-wide localStorage key across authenticated accounts.
3. Added verified-canonical-account storage namespaces; provider Pi UIDs and unverified identities are not used as storage principals.
4. Preserved a separate anonymous/local-studio cart and deliberately did not migrate guest cart contents into a signed-in account.
5. Connected Marketplace cart state and global cart badge to `IdentityService` updates so account switches refresh the visible cart immediately.
6. Added RUN458 static and runtime regression coverage, including account A → account B → account A restoration and guest-cart separation.
7. Updated package, lockfile, app release identity, README and current project-truth records to `0.338.170`.
8. Updated the current build context, project truth, source-of-truth authority, README and verified manifest while retaining prior run history.
9. Registered the RUN458 static contract in `verify:static`, `prebuild:checks` and `pretypecheck`.
10. Added runtime coverage for anonymous cart preservation and verified account A → account B → account A isolation.
11. Focused RUN458 static contract passed 8/8; Marketplace cart runtime regression suite passed.
12. Full static verification exposed a release-gate expectation for current build context and versioned worklog metadata; those metadata checks were reconciled before the next run.
13. Captured the active cart namespace during checkout, scoped idempotency keys to it, and fenced post-request cleanup against account switches.
14. Full `npm run verify:static` passed with 5,452 PASS lines and zero FAIL lines.
15. Marketplace cart runtime assertions, Phase 9 Marketplace contracts (20/20), Phase 2 cart contracts (14/14), RUN411 reliability (12/12), RUN300 release integrity (22/22), RUN301 release-gate integrity (20/20) and documentation hygiene passed.
16. `npm run prebuild:checks` was attempted; it stopped because `check-jsx-duplicate-props.mjs` could not load the absent `typescript` package. The available Node.js runtime is 24.11.1, below required Node.js 24.15.0; `node_modules` is absent. This is source-only verification scope, not supported-runtime build acceptance. Supported-runtime typecheck, lint, production build and browser/device/Testnet acceptance remain outstanding.

No database migration, provider transaction, Git push or Vercel deployment was performed.
