# Current project truth — 0.338.173 RUN461 Reward Claim Response Integrity (2026-11-27)

**Current package candidate:** `gh-connect@0.338.173`.  
**Current source version:** `0.338.173` (working candidate; not accepted, pushed or deployed).  
**Current status:** **NOT APPROVED**.

RUN461 hardens the authoritative GHC reward-claim response boundary and GHC membership purchase RPC response validation. The claim RPC parser requires explicit success, an exact boolean idempotency field, a bounded transaction identifier and a positive finite amount. Incomplete or malformed successful responses are treated as unavailable/ambiguous so the existing database idempotency path can safely recover. Matured Daily Claim reads validate authenticated owner, cutoff, row count, identifier, amount, timestamp and metadata before hold IDs can reach the claim RPC. Membership purchase responses are bounded by a 10-second timeout and require exact owner/reference/tier/amount linkage, explicit nested spend success and a matching active entitlement. No reward formula, eligibility, maturity window, settlement, ledger policy, membership/referral economics or SQL migration changed.

RUN460 referral read/attribution hardening and RUN454–RUN459 improvements remain preserved. No live database mutation, payout or provider operation was performed.

The full network/DB-independent static verification passed 63/63 suites. Focused contracts passed: RUN461 21/21, RUN460 8/8, RUN450 17/17 and Phase 11 reconciliation 32/32. The prebuild check was attempted but stops because the `typescript` package is absent. Full dependency-backed verification, TypeScript, lint, and Next.js production build under Node.js `^24.15.0`, plus browser/device and deployed Testnet acceptance, remain outstanding. The source migration inventory is not evidence of applied migrations. The available runtime is Node.js 22.16.0 and dependencies are absent. This candidate is not accepted, pushed or deployed and does not establish production readiness. Production remains **NOT APPROVED**.

See `docs/CURRENT-SOURCE-OF-TRUTH-2026-11-27.md`, `docs/RUN461-REWARD-CLAIM-RESPONSE-INTEGRITY-2026-11-27.md` and `docs/UPGRADE-WORKLOG-0.338.173.md`.
