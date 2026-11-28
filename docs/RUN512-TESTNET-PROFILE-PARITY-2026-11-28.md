# RUN512 — Testnet activation profile parity (withdrawals, curation, referral, welcome Pi bonus)

Status: configuration template and static guard only. Production NOT APPROVED. No application logic, SQL, ledger, fee or payment code changed. Nothing was deployed or applied.

## Problem
`config/testnet-payments.env.example` is the profile an operator pastes into Vercel to turn on the Testnet economy. It was missing `PI_EARNINGS_ADAPTERS_ENABLED=true`. Without it the reward-source adapters (`referral`, `activity_reward`, `community`, `promotion`, `utility`, `system`, `creator_earning`) deny every credit, so referral earnings stayed inert even with every other flag on. `GH_WITHDRAWAL_OPERATOR_IDS` (operator withdrawal route) was also absent.

## Change
- Template: added `PI_EARNINGS_ADAPTERS_ENABLED=true` and `GH_WITHDRAWAL_OPERATOR_IDS=`, and documented that the profile belongs in the Vercel Preview environment, that `NEXT_PUBLIC_*` values need a redeploy, that some flags must be exactly `true`, and that a blank `GHC_WITHDRAWAL_GHC_PER_PI` uses the built-in reference rate.
- Guard `scripts/check-run512-testnet-profile-parity.mjs` (in `verify:static`): every gate flag the code reads is enabled in the profile with the value form the code accepts, the code still reads those flags, the profile stays Testnet-only, secrets stay blank, no live provider key is present, and the code still fails closed when `VERCEL_ENV=production`.

## Vercel steps (Preview environment only)
1. Copy the non-secret values from the template into the Preview environment connected to Testnet. Never Production.
2. Add real Testnet credentials for the blank secrets: `PI_API_KEY`, `PI_SERVER_API_KEY`, `PI_WALLET_PRIVATE_SEED`, `GH_PIN_PROOF_SECRET` (32+ chars), `PI_EARNINGS_EXECUTOR_KEY`, `GHC_PAYOUT_RECONCILIATION_KEY`, `GHC_MARKETPLACE_PAYOUT_TREASURY_USER_ID`. Add `PAYSTACK_SECRET_KEY` (test key) only if NGN transfers are wanted.
3. Set `GH_WITHDRAWAL_OPERATOR_IDS` to the operator user ids, if the operator route is used.
4. Apply `supabase/migrations/20261125130000_run397_testnet_registration_bonus_100_pi.sql` to the Testnet database. Until then the welcome bonus returns `REGISTRATION_BONUS_MIGRATION_REQUIRED` and credits nothing.
5. Redeploy (required for the `NEXT_PUBLIC_*` values), then check `/api/economy/earnings/withdrawals/readiness`.

## Feature to flag map
- Welcome Pi bonus: `GHC_REGISTRATION_BONUS_ENABLED` (no unlock fallback), `NEXT_PUBLIC_PI_SANDBOX=true`, the migration above, and the A2U path for payout.
- Curation: `GHC_CURATION_REDISTRIBUTE_ENABLED` and its `NEXT_PUBLIC_` twin.
- Referral earnings: `GHC_REFERRAL_SETTLEMENT_ENABLED` and its `NEXT_PUBLIC_` twin, plus `PI_EARNINGS_ADAPTERS_ENABLED`.
- Withdrawals: `GHC_WITHDRAWALS_ENABLED`, `PI_EARNINGS_PAYOUT_REQUESTS_ENABLED`, `PI_EARNINGS_PAYOUT_EXECUTION_ENABLED`, `PI_A2U_ENABLED`, `PI_A2U_TESTNET_ONLY`, `PI_NETWORK=testnet`, `PI_ENV=production`.

## Not changed
Production behavior is unchanged: the unlock and withdrawals stay off when `VERCEL_ENV=production`. Open release gates (supported Node 24.15+, typecheck, ESLint, production build, device and multi-account Testnet acceptance) are not represented as passed.
