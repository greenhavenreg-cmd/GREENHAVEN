# GreenHaven Testnet Preview environment profile

This is the operator guide for `docs/TESTNET-PREVIEW-ENVIRONMENT.template`. The profile enables the supported Testnet feature surfaces without changing the canonical `.env.example`, whose disabled-by-default values are deliberately asserted by the repository's release/security checks.

## Deployment target

- Use a dedicated GitHub repository and a Vercel project connected to that repository.
- Configure this profile in **Vercel Preview** only. Do not copy it into Vercel Production.
- Keep `PI_NETWORK=testnet`, `NEXT_PUBLIC_PI_SANDBOX=true`, and `PI_ENV=production` together. `PI_ENV=production` selects the official Pi Platform API mode; it does not select Pi Mainnet.
- Set the actual Preview URL in `GHC_E2E_BASE_URL` and `GREENHAVEN_PREVIEW_URL` after the first Preview deployment.

## Safe Testnet profile policy

The profile is a **Testnet connectivity and verification overlay**, not a blanket feature-enable list. It keeps `PI_NETWORK=testnet`, `NEXT_PUBLIC_PI_SANDBOX=true`, `PI_ENV=production`, `GHC_ENV=testnet`, and the Testnet unlock. It does not activate money-moving or ledger-mutating rails by default.

The following remain explicitly disabled in the profile and must not be switched on merely to make a UI surface appear active:

- Pi purchases and payout adapters/requests/execution/A2U (`GHC_BUY_WITH_PI_ENABLED`, `PI_EARNINGS_ADAPTERS_ENABLED`, `PI_EARNINGS_PAYOUT_REQUESTS_ENABLED`, `PI_EARNINGS_PAYOUT_EXECUTION_ENABLED`, `PI_A2U_ENABLED`).
- GHC withdrawals and marketplace payouts (`GHC_WITHDRAWALS_ENABLED`, `GHC_MARKETPLACE_GHC_PAYOUTS_ENABLED`). `GHC_WITHDRAWALS_TESTNET_ONLY=true` is a fence, not an enable switch. The conversion rate remains blank until owner-approved.
- Paystack transfers (`PAYSTACK_TRANSFERS_ENABLED=false`) and live approval (`PAYSTACK_LIVE_TRANSFERS_APPROVED=false`). Never use an `sk_live_` key in Preview.
- Registration/activity rewards, referral settlement, tips and curation redistribution until their ledger paths and deployed Testnet prerequisites are verified.
- Atomic emission V13, curation redistribution V2 and daily calibration-cap V2 remain false while their SQL proposals/required durable enforcement are not reconciled and tested.
- `PI_EARNINGS_AUTO_EXECUTE=false` permanently remains the default; unattended payout execution is not part of this profile.

The profile keeps Testnet E2E flags available, but authenticated suites require disposable Testnet accounts, valid session cookies and the actual Preview URL. Missing inputs must cause tests to skip, not create identities or payment state.

## Required Preview configuration

Set real values in Vercel Preview Environment Variables, never in Git:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or publishable key)
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL` or `DATABASE_URL` where the deployment's DB tooling requires it
- `DOMAIN_VALIDATION_KEY` — exact validation string from the Pi Developer Portal; server-only, served by `/validation-key.txt`
- `PI_API_KEY` (preferred) or `PI_SERVER_API_KEY` — Testnet app API key; server-only, never `NEXT_PUBLIC_*`
- `PI_WALLET_PRIVATE_SEED` (Pi Testnet wallet only; restrict access)
- `PI_EARNINGS_EXECUTOR_KEY` (random secret, at least 32 bytes)
- `GHC_A2U_ADMIN_KEY` / other operator keys only where the corresponding route requires them
- `GHC_PIN_PROOF_SECRET`, `GHC_BENEFICIARY_FINGERPRINT_KEY`, and required auth/security secrets
- `PAYSTACK_SECRET_KEY` beginning `sk_test_...` if testing Paystack bank-transfer test flows
- `GHC_E2E_BASE_URL`, `GHC_E2E_COOKIE_A`, and `GHC_E2E_COOKIE_B` for authenticated E2E; use disposable Testnet accounts only

Do not set `GHC_ALLOW_DEV_AUTH=true` on a deployed Preview environment as a substitute for real authentication. Do not commit populated `.env` files or paste secrets into issues, chat, build logs or test reports.

## Verification and known release blockers

Run the repository's static checks and supported-runtime checks under Node.js 24.15.x, then run the configured Playwright suites against the deployed Preview URL. A passing source/static check is not evidence that Supabase migrations are applied, Pi A2U is funded, Paystack test transfers are configured, or live authenticated E2E has passed.

The current source-of-truth worklog still records unresolved Testnet migration-history discrepancies, held SQL proposals, outstanding provider/device acceptance and an unapproved release status. Do not bulk-push migrations or claim Testnet certification until those items are reconciled and verified. Mainnet remains out of scope.
