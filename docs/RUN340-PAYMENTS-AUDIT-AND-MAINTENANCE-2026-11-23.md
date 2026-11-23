# Run 340 — Payments systems audit and maintenance

Date: 2026-11-23  
Baseline: user-designated GreenHaven 0.338.100 / RUN339 source tree  
Disposition: source-only maintenance; no payment, payout, balance, entitlement, database, provider, deployment, or Mainnet operation performed.

## Scope reviewed

- Pi U2A payment intents, approval/completion, incomplete-payment recovery, fulfillment, timeline and reconciliation.
- GHC wallet, spend/credit ledger boundaries, cross-feature reconciliation and transaction history.
- Pi earnings, withdrawal quotes, PIN proof, request reservation, worker execution, A2U consent and recovery.
- Membership purchase, renewal, entitlement refresh and orphaned-purchase recovery.
- Marketplace cart/checkout, inventory reservation, payment binding, order lifecycle, seller payout and adjustment/reconciliation.
- Request body bounds, authentication/ownership, rate limits, idempotency, durable state, RLS/RPC ACL regression contracts and release defaults.

## Findings and maintenance

1. **No financial-path source defect was proven by the targeted source and pure-runtime gates.** The audited paths retain server-side authority and fail-closed behavior. This is not a claim of successful live Pi transfers or live database acceptance.
2. A legacy finance/commerce regression expected the earnings dashboard to submit withdrawals directly. The current architecture intentionally routes the action through `components/ghc/pi-withdraw-sheet.tsx`, which owns fresh quotes, PIN proof, idempotency and request submission. The check now verifies that real owner path.
3. Several legacy release checks required phase documents at their former top-level paths even though the project preserves them under `docs/archive/historical-implementation-records/`. The checks now use the existing safe `scripts/lib/read-project-doc.mjs` resolver rather than treating archived documents as missing.
4. The old five-phase operator checklist contained stale enablement examples for registration rewards and payout execution. It is now explicitly superseded and no longer presents those values as an activation recipe. The active Testnet A2U checklist and `.env.example` retain fail-closed defaults.
5. No payment route, ledger RPC, migration, wallet balance, entitlement, provider credential, or financial record was changed. Package version remains 0.338.100; this is a source-only maintenance derivative, not a release or deployment.

## Verification performed

The following targeted source/runtime checks passed after maintenance:

- Payment intent hardening: 11/11.
- Payment retry UX: 10/10.
- Payment request body bounds: 20/20.
- Withdrawal single-entrypoint: 6/6.
- Finance/commerce regression: 14/14.
- Registration top-up: 15/15.
- Dual-asset wallet: 11/11.
- PI claim buttons: 12/12.
- PI withdrawal KYC: 14/14.
- Wallet release gate: 17/17.
- Wallet authorization: 27/27.
- Wallet hardening follow-up: 23/23.
- Wallet transfer integrity: 8/8.
- Withdrawal streaming boundary: 9/9.
- Durable payout limits: 21 route modules checked.
- Marketplace event journal, adjustments and atomic transitions: passed.
- Wallet ledger resilience and consent flow: passed.
- Unified earnings ledger and wallet/rewards/membership separation/closeout: passed.
- PI earnings worker, request lifecycle and settlement recovery: passed.
- PI withdrawal boundary and KYC: passed.
- Withdrawal fee, marketplace commerce, cross-domain settlement, PI intent security and transaction integration: passed.
- Payment recovery, payment timeline, marketplace payment binding, creator commerce integrity and marketplace RPC transport: passed.
- Marketplace A2U integration, order-list RPC hotfix and wallet-address/A2U diagnostics: passed.
- Withdrawal recovery reliability: 18/18.
- PI withdrawal hardening: 35/35.
- Wallet A2U production-readiness source gate: 16/16.
- Wallet security hardening: 12/12.
- Withdrawal health contract: 25/25.
- Pure runtime ledger atomic guards: 22 assertions; cross-domain settlement tests; PI intent contract 12/12; membership renewal policy 15/15 and row parser 14/14; wallet consent 15/15; marketplace fulfilment parser 15/15; payout recovery simulation 13/13; payout release safety 15/15; wallet amount helpers 20/20; CSV safety 9/9.

## Remaining release blockers

- Full dependency-backed checks require the supported Node 24.15.x runtime and installed dependencies; this workspace has Node 22.16.0 and no `node_modules`.
- Live Pi Browser payment approval/completion and A2U transfer receipts remain unverified.
- Live Testnet migration/catalog reconciliation and database-side two-user authorization/IDOR acceptance remain separate operator tasks. Do not replay or bulk-apply migrations from the source inventory.
- Testnet wallet consent, withdrawal PIN proof, reservation, execution and settlement require end-to-end acceptance with two accounts and a funded Testnet provider wallet.
- Production remains **NOT APPROVED**. Mainnet and production payment flags remain untouched and disabled by default.
