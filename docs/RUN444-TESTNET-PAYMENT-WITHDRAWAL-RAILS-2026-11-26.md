# RUN444 — Testnet payment and withdrawal activation profile

**Package:** `gh-connect@0.338.156`  
**Date:** 26 November 2026  
**Parent candidate:** RUN443 / `0.338.155`  
**Scope:** Testnet-only payment/withdrawal configuration, provider safety fences, regression coverage.

## What changed

- Added `config/testnet-payments.env.example`, a dedicated Vercel Preview/Testnet activation profile. It enables Pi A2U, Pi earnings payout requests and execution, the user-triggered payout handoff, GHC→Pi withdrawals, marketplace GHC seller payouts and Paystack transfer requests.
- The profile intentionally contains no credentials, wallet seed, executor key, treasury identity or operator reconciliation key. A rail with missing credentials remains unavailable; enabling a flag does not manufacture provider funding or authorization.
- Paystack transfers on `PI_NETWORK=testnet` now require a non-Production deployment and an `sk_test_` secret. A live Paystack key is rejected on Testnet even if the transfer flag is on. `PAYSTACK_LIVE_TRANSFERS_APPROVED` remains false.
- GHC→Pi withdrawal and marketplace GHC seller settlement are now fenced to `PI_NETWORK=testnet` and non-Production Vercel deployments.
- The generic `.env.example` remains fail-closed. The dedicated activation profile must be copied only into the Testnet Preview environment; never into Vercel Production or Mainnet.

## Required Testnet environment

Use `config/testnet-payments.env.example` as the activation checklist for Vercel Preview. Add valid Testnet Pi API/wallet credentials, a strong executor key, the approved treasury identity and operator key, and a Paystack `sk_test_` key only after their respective ownership and funding checks. Keep `PI_NETWORK=testnet`, `NEXT_PUBLIC_PI_SANDBOX=true`, and `PI_A2U_TESTNET_ONLY=true`.

## Verification and limitations

- `scripts/check-run444-testnet-payment-rails.mjs`: **9/9 PASS**.
- The check confirms the dedicated activation profile, retained safe defaults, no embedded secrets, Paystack Testnet/live-key isolation, and GHC withdrawal/seller-settlement network fences.
- No provider credential was added; no Pi payment, A2U payout, GHC withdrawal, marketplace seller settlement, Paystack transfer, database mutation, GitHub push or Vercel deployment was performed.
- No end-to-end financial transaction or provider sandbox settlement was executed. Therefore these rails are **configured for Testnet activation, not operationally certified**. Add the profile to Vercel Preview, verify the secret types and balances, then run controlled low-value Testnet transactions and reconciliation before declaring acceptance.
- Mainnet and live bank transfers remain **NOT APPROVED**.
