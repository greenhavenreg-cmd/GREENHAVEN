# RUN451 — Testnet economy activation (26 November 2026)
Date: 2026-11-26
# RUN451 — Testnet economy activation

Package: `gh-connect@0.338.163`

## Scope

Explicitly turn on the dedicated Testnet Preview profile for GHC activity rewards, registration bonus, curation redistribution, referral settlement, Pi-to-GHC purchase, tips, GHC withdrawals, marketplace GHC seller payouts, Pi A2U, Pi earnings payout request/execution and Paystack test transfers. Align public feature flags so the client surfaces report the same enabled Testnet programs.

## Credential handling

Provider credentials and private keys are not boolean feature flags. The archive must not contain real or fabricated values for `PI_EARNINGS_EXECUTOR_KEY`, `PI_API_KEY` / `PI_SERVER_API_KEY`, `PI_WALLET_PRIVATE_SEED`, `GH_PIN_PROOF_SECRET`, Supabase service-role keys, Paystack secret, or treasury/reconciliation secrets. These remain blank in the example profile; the deployed Preview runtime reads the values already configured in Vercel.

## Boundaries

- The profile is for Vercel Preview + `PI_NETWORK=testnet` + `NEXT_PUBLIC_PI_SANDBOX=true` only.
- Generic `.env.example` remains fail-closed and Production-safe.
- No database migrations are applied by this archive change.
- Registration bonus claimability still requires the Testnet campaign migration and ledger RPC to be installed and reconciled.
- Feature flags do not prove provider credentials are valid or that a payment has settled.
- No Production/Mainnet configuration, real Pi transfer or bank transfer is enabled by this change.
