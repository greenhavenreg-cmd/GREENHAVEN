# Upgrade worklog — 0.338.172 / RUN460

1. Used RUN459 / `0.338.171` as the source baseline.
2. Audited referral status, code and attribution routes plus the referral service and existing SQL RPC contracts.
3. Identified unbounded, cache-unspecified referral GET routes even though both can invoke service-role database operations and code creation.
4. Added separate durable per-user fail-closed limits and private no-store headers to referral status and code GETs.
5. Changed permanent referral attribution to fail closed when durable mutation throttling is unavailable and tightened the per-minute attempt budget.
6. Validated the canonical referral code response shape and normalized aggregate counters/amounts against non-finite and negative values.
7. Added RUN460 regression contract and registered it in static and prebuild verification.
8. Reconciled package, lockfile, app release marker, verified manifest and current source-of-truth documentation to `0.338.172`.
9. Ran RUN460 (8/8), RUN398 (8/8), RUN450 (17/17), then the full static suite (5,472 PASS / 0 FAIL).
10. Attempted prebuild checks; blocked by unsupported available Node versions and missing TypeScript dependencies. No database or remote environment was modified.

**Release decision:** source candidate only. Production is NOT APPROVED pending supported-runtime dependency-backed checks and live Testnet acceptance.

This is **source-only verification scope**; it does not certify the production runtime, typecheck, lint, build or browser/device acceptance. The required runtime is **Node.js 24.15.0** (package engine `^24.15.0`), which is not available in the current workspace.
