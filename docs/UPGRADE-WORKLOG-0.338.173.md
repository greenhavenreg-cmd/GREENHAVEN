# Upgrade worklog — 0.338.173 / RUN461

1. Established RUN460 v0.338.172 as the only source baseline for this increment.
2. Hardened `rpcClaimPending` to require an explicit successful RPC contract, exact idempotency boolean, bounded transaction ID and positive finite amount.
3. Converted malformed/incomplete RPC success payloads into retry-safe unavailable results; the existing database idempotency contract remains the recovery authority.
4. Hardened matured Daily Claim hold reads with authenticated owner, cutoff, row-count, identifier, amount, timestamp and metadata validation.
5. Hardened GHC membership purchase RPC parsing with a bounded timeout, exact owner/reference/tier/amount binding, explicit success/idempotency booleans and verified returned entitlement.
6. Added the RUN461 21-assertion regression contract and registered it in static and prebuild checks.
7. Synchronized package, lockfile, application release marker, verified manifest and current source documentation to `0.338.173`.
8. Preserved reward calculations, eligibility, 48-hour maturity, settlement, ledger authority, membership/referral rules and all SQL migrations.
9. Ran focused RUN461 (21/21), RUN460 (8/8), RUN450 (17/17), Phase 11 reconciliation (32/32), release integrity, project truth, documentation hygiene and the full network/DB-independent static suite (63/63 suites passed).
10. Attempted `npm run prebuild:checks`; it stops at `scripts/check-jsx-duplicate-props.mjs` because the `typescript` package is absent. Supported-runtime typecheck, lint and production build remain outstanding.
11. Full dependency-backed verification remains blocked by unavailable Node.js 24.15.0 and absent dependencies.
12. No database mutation, migration, provider transaction, Git push or Vercel deployment was performed. Production remains NOT APPROVED.
13. This is source-only verification scope; no live provider/database acceptance is implied.
14. The supported project runtime is Node.js 24.15.0 (`^24.15.0`); the available runtime is below that requirement.
