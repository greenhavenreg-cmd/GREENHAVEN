# Current source of truth — 27 November 2026

- **Current working candidate:** `gh-connect@0.338.173` / RUN461 Reward Claim Response Integrity.
- **Immediate parent:** RUN460 / `0.338.172` Referral Read/Attribution Hardening.
- **User-designated baseline:** `GREENHAVEN-0.338.172-RUN460-REFERRAL-READ-HARDENING-2026-11-27-2.zip`.
- **Current archive:** `GREENHAVEN-0.338.173-RUN461-REWARD-CLAIM-RESPONSE-INTEGRITY-2026-11-27.zip`.
- **RUN461 scope:** GHC reward-claim RPC responses must be explicit and structurally valid before the API reports success; matured-hold reads validate owner, identifiers, amounts, timestamps and metadata before candidate IDs reach the claim RPC. GHC membership purchases validate owner/reference/tier/amount inputs, enforce a bounded RPC timeout, and require explicit nested spend and active-entitlement evidence before success. Ambiguous RPC responses remain retry-safe through existing database idempotency.

RUN460 referral hardening and RUN450 wallet/withdrawal/membership/referral/mission controls remain preserved. RUN461 changes no reward amount, qualification, maturity window, claim settlement, membership/referral economics, ledger authority or SQL migration. No live database operation was performed.

The source candidate is not accepted, pushed or deployed. The project requires Node.js `^24.15.0`; the available runtime is Node.js 22.16.0 and dependencies are absent. RUN461 focused static contract passed 21/21; full network/DB-independent static verification passed 63/63 suites; RUN460 passed 8/8; RUN450 passed 17/17; Phase 11 reconciliation passed 32/32. The prebuild check was attempted and stops because the `typescript` package is absent. Full dependency-backed verification, TypeScript, lint, production build, browser/device and live Testnet acceptance remain outstanding. No database mutation, Git push, Vercel deployment or provider transaction occurred. Production remains **NOT APPROVED**. See `docs/RUN461-REWARD-CLAIM-RESPONSE-INTEGRITY-2026-11-27.md` and `docs/UPGRADE-WORKLOG-0.338.173.md`.
