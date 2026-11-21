# GreenHaven Testnet feature-enable implementation report

**Source baseline:** GreenHaven 0.338.111, Phase 9 session-integrity metadata archive  
**Target:** Git branch `testnet` / Vercel Preview only  
**Date:** 2026-11-21

## Implemented in the project files

The Testnet Preview environment template is now a feature-enabled testing overlay. It enables the supported Pi purchase surfaces, registration bonus, activity reward, referral settlement, tips, supported curation surface, Pi earnings adapters, payout requests, operator-triggered Pi A2U execution, GHC-to-Pi withdrawal requests, internal GHC marketplace payouts, and the Paystack test-transfer route.

The GHC-to-Pi test conversion uses the existing codebase reference benchmark of **100 GHC per Pi**. The source code explicitly labels this an internal reference benchmark, not a market rate or redemption promise.

The following boundaries remain enabled:

- `PI_NETWORK=testnet`, `NEXT_PUBLIC_PI_SANDBOX=true`, `PI_ENV=production` (official Pi Platform API mode, not Mainnet), and `GHC_ENV=testnet`.
- GHC withdrawals require `GHC_WITHDRAWALS_TESTNET_ONLY=true` and Preview (not Vercel Production).
- Pi A2U requires `PI_A2U_TESTNET_ONLY=true`, Testnet network, Pi sandbox, valid server credentials, wallet authorization, PIN proof and provider verification.
- `PI_EARNINGS_AUTO_EXECUTE=false`; payout execution is operator-triggered, not unattended/background.
- `PAYSTACK_LIVE_TRANSFERS_APPROVED=false`; the enabled Paystack route can only pass its provider gate with a server-side `sk_test_` credential. No live key is supplied.
- E2E session cookies, auth tokens, URLs and IDs remain blank placeholders; tests do not fabricate identities.

## Deliberately not enabled / external blockers

Three database-dependent gates remain disabled because their required SQL changes are review-only or not yet reconciled/applied/replay-tested:

- `GHC_ATOMIC_GLOBAL_EMISSION_V13_ENABLED=false`: DB-backed daily claim and activity issuance remain blocked where the atomic allocator is required.
- `GHC_CURATION_REDISTRIBUTE_V2_ENABLED=false`: the idempotency-safe V2 curation settlement RPC remains blocked.
- `GH_GHPV_CALIBRATION_DAILY_CAP_V2_ENABLED=false`: GHPV settlement remains blocked until durable per-reviewer daily-cap state exists.

These were not bypassed by weakening code, changing migrations, or inventing database behavior. The canonical `.env.example` retains fail-closed defaults for Production/local use.

## Credentials and external configuration

The project template contains 50 environment assignments. Credential values are intentionally blank in the committed template. Provision them directly in Vercel Preview for branch `testnet`, not in Git:

- Pi Developer Portal Testnet API key and domain validation key.
- Pi Testnet wallet private seed and payout executor key if A2U payouts are to be exercised.
- Paystack test secret beginning `sk_test_` if the Paystack sandbox flow is to be exercised.
- Required Supabase URL, anon key, service-role key, PIN proof, beneficiary fingerprint, operator and authentication/security secrets as applicable.
- Actual Preview URL and disposable authenticated E2E test-account sessions.

This work did **not** inspect, replace, or modify live Vercel environment records. It did not change Supabase, database schema/data, migrations, GitHub branches, deployments, Production, or Mainnet.

## Verification performed

- `scripts/check-testnet-profile-safety.mjs`: 12/12 passed.
- `scripts/check-run332-audit-remediation.mjs`: 16/16 passed.
- `scripts/check-run376-economy-curation-integrity.mjs`: 43/43 passed.
- The full Node 24 production prebuild was not run in this environment; the project must run its normal Vercel Preview build after the user pushes the archive.

## Operator handoff

Extract the ZIP, open the project in GitHub Desktop, ensure the current branch is `testnet`, review the diff, and commit/push that branch only. Do not merge or cherry-pick to `main`. After Preview deployment, verify the actual environment variables and provider credentials in Vercel Preview and run authenticated Testnet E2E using disposable accounts. A successful source check does not certify external provider, wallet funding, or database migration readiness.
