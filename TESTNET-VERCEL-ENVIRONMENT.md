# GreenHaven Testnet Preview environment profile

This guide documents `docs/TESTNET-PREVIEW-ENVIRONMENT.template`. The template is a **connectivity/authentication-only** Preview overlay. The canonical `.env.example` remains the fail-closed source for Production/local defaults and is not replaced by this overlay.

## Deployment target

- Use the dedicated GREENHAVEN GitHub repository and its Vercel project.
- Configure this profile in **Vercel Preview** only, scoped to Git branch `testnet`. Never copy it into Vercel Production.
- Keep `PI_NETWORK=testnet`, `NEXT_PUBLIC_PI_SANDBOX=true`, and `PI_ENV=production` together. `PI_ENV=production` selects the official Pi Platform API mode; it does not select Pi Mainnet.
- Set the actual Preview URL in `GHC_E2E_BASE_URL` and `GREENHAVEN_PREVIEW_URL` only when running authenticated browser acceptance.
- The Pi Developer Portal app slug for this registered Sandbox app is `greenhaven-2tm2`; keep `lib/system-config.ts` aligned with that registered app identity.

## Testnet safety policy

This profile enables Testnet identity/connectivity and explicit Pi Browser authentication testing only. It does **not** enable purchases, rewards, referrals, tips, curation settlement, payouts, A2U, withdrawals, marketplace payouts or Paystack transfers. Those flags are explicitly false in the profile and must remain fail-closed until their separate provider, database, authorization, settlement, reconciliation and authenticated E2E gates have been approved.

- `GHC_ATOMIC_GLOBAL_EMISSION_V13_ENABLED=false`, `GH_GHPV_CALIBRATION_DAILY_CAP_V2_ENABLED=false` and `GHC_CURATION_REDISTRIBUTE_V2_ENABLED=false` remain mandatory held gates while their SQL proposals and durable enforcement are unreconciled and untested.
- `PI_EARNINGS_AUTO_EXECUTE=false`; unattended/background payout execution remains disabled.
- `PI_A2U_ENABLED=false`, payout request/execution flags false, and withdrawals false. `*_TESTNET_ONLY=true` is a network fence, not authorization to execute.
- `PAYSTACK_TRANSFERS_ENABLED=false` and `PAYSTACK_LIVE_TRANSFERS_APPROVED=false`. Never put a live `sk_live_` key in Preview.
- The Testnet unlock is for connectivity/verification only; it does not authorize ledger writes or financial operations.

Testnet E2E scaffolding remains available, but authenticated suites require disposable Testnet accounts, valid session cookies and the actual Preview URL. Missing inputs must cause tests to skip, not create identities or payment state.

## Required Preview configuration

Configure actual values directly in Vercel Preview Environment Variables; never commit them or paste them into chat/build logs:

- `NEXT_PUBLIC_PI_CLIENT_ID` — exact Client ID for the GREENHAVEN Testnet app in the Pi Developer Portal; verify it matches the registered app, do not infer it from the slug.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or publishable key).
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` — service-role credential is required for durable server-side identity/session persistence; keep it server-only.
- `DOMAIN_VALIDATION_KEY` — exact Pi Developer Portal domain-validation string, server-only, served by `/validation-key.txt`.
- `PI_API_KEY` (or the supported `PI_SERVER_API_KEY` alias) — server-only app credential for Pi Platform API operations that require it. Pi `/v2/me` user authentication verification uses the user's bearer access token; do not misdiagnose a missing app API key as the cause of that specific request failing.
- `GHC_PIN_PROOF_SECRET`, `GHC_BENEFICIARY_FINGERPRINT_KEY` and other auth/security secrets required by the enabled identity/session routes.
- Database connection URLs only where deployment tooling explicitly requires them.
- Wallet seeds, executor keys, Paystack keys and operator credentials are **not needed** for this connectivity-only profile. Do not provision them merely to make sign-in work.

Do not set `GHC_ALLOW_DEV_AUTH=true` on a deployed Preview environment as a substitute for real authentication. Never use client-side identity fallback.

## Verification and release blockers

Run static checks and supported-runtime checks under Node.js 24.15.x, then run Pi Browser Sandbox sign-in, server-side token verification, durable session restoration and authenticated Playwright suites against the deployed Preview URL. A passing source/static check does not prove the Pi Portal Client ID or authorization is correct, Supabase credentials work, migrations are reconciled, or live authenticated E2E has passed.

The current source-of-truth worklog records unresolved Testnet migration-history discrepancies, held SQL proposals and outstanding provider/device acceptance. Do not bulk-push migrations or claim Testnet certification until those items are reconciled and verified. No Mainnet operation is in scope.
