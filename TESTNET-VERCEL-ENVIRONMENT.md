# GreenHaven Testnet Preview environment profile

This is the operator guide for `docs/TESTNET-PREVIEW-ENVIRONMENT.template`. The template is a feature-enabled Testnet Preview overlay. The canonical `.env.example` remains fail-closed for Production/local defaults and is not replaced by this overlay.

## Deployment target

- Use a dedicated GitHub repository and a Vercel project connected to that repository.
- Configure this profile in **Vercel Preview** only. Do not copy it into Vercel Production.
- Keep `PI_NETWORK=testnet`, `NEXT_PUBLIC_PI_SANDBOX=true`, and `PI_ENV=production` together. `PI_ENV=production` selects the official Pi Platform API mode; it does not select Pi Mainnet.
- Set the actual Preview URL in `GHC_E2E_BASE_URL` and `GREENHAVEN_PREVIEW_URL` after the first Preview deployment.

## Testnet feature-enable policy

The profile enables supported application feature flags for Testnet exercise, including Pi purchases, supported rewards/referrals/tips, Pi payout requests and operator-triggered Testnet A2U, GHC-to-Pi withdrawal requests, internal GHC marketplace payouts, and the Paystack test-mode route. It keeps `PI_NETWORK=testnet`, `NEXT_PUBLIC_PI_SANDBOX=true`, `PI_ENV=production`, `GHC_ENV=testnet`, and the Testnet unlock. `PI_ENV=production` selects the official Pi Platform API mode; it does not select Pi Mainnet. Vercel Preview plus `PI_NETWORK=testnet` and sandbox flags are mandatory boundaries.

The following database or provider-dependent paths remain held or require external setup; the overlay does not bypass their runtime controls:

- Atomic emission V13, curation redistribution V2 and daily calibration-cap V2 remain false while their SQL proposals/required durable enforcement are not reconciled and tested. DB-backed daily claims/activity issuance and GHPV settlement therefore remain blocked where those guards apply.
- `PI_EARNINGS_AUTO_EXECUTE=false`: unattended/background payout execution remains off. Pi A2U is operator-triggered only and requires a real Pi Testnet API key, valid Testnet app-wallet seed, executor key, user wallet authorization, PIN proof, funded Testnet wallet, and verified provider settlement.
- GHC-to-Pi requests use `GHC_WITHDRAWAL_GHC_PER_PI=100`, the codebase reference benchmark only. It is not a market rate or redemption promise. The route additionally requires Preview/Testnet, verified Pi identity and wallet, PIN proof, and working database RPCs.
- Paystack transfers are gated on a server-side `sk_test_` key. `PAYSTACK_LIVE_TRANSFERS_APPROVED=false`; do not add an `sk_live_` key to Preview. The enabled flag alone cannot execute without the test credential and provider-side test setup.
- Marketplace GHC payout settlement requires the configured treasury user, service-role access and the atomic settlement RPC. No SQL migration is applied by this bundle.

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

Run the repository's static checks and supported-runtime checks under Node.js 24.15.x, then run the configured Playwright suites against the deployed Preview URL. A passing source/static check is not evidence that Supabase migrations are applied, Pi A2U is funded, Paystack test transfers are configured, or live authenticated E2E has passed. This bundle does not modify Supabase, Vercel environment records, or any deployed deployment.

The current source-of-truth worklog still records unresolved Testnet migration-history discrepancies, held SQL proposals, outstanding provider/device acceptance and an unapproved release status. Do not bulk-push migrations or claim Testnet certification until those items are reconciled and verified. Mainnet remains out of scope.
