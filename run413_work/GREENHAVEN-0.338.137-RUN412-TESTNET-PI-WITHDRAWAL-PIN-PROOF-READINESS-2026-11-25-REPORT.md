# GREENHAVEN 0.338.137 — Run 412 report

Date: 2026-11-25  
Baseline: `GREENHAVEN-0.338.136-RUN411-MARKETPLACE-COMMERCE-RELIABILITY-2026-11-25.zip`

## Scope

A coordinated, non-destructive Testnet Pi withdrawal PIN-proof readiness upgrade. Marketplace, identity, ledger, and unrelated modules were preserved.

## Changes

- Kept `GH_PIN_PROOF_SECRET` as the canonical server-only PIN-proof HMAC key and accepted `GHC_PIN_PROOF_SECRET` as a compatibility fallback only when the canonical key is absent.
- Preserved the minimum secret length requirement (32 characters), user/session binding, idempotency binding, short proof expiry, and timing-safe signature comparison.
- Added secret-free environment-variable names to missing-key API diagnostics; no secret material is returned.
- Improved withdrawal-sheet messaging to identify the exact Testnet Preview setting and clarify that a missing signing key does not reserve funds.
- Added `scripts/check-run412-testnet-withdrawal-readiness.mjs`, registered it in both `prebuild:checks` and `verify:static`, and documented the operational boundary.
- Aligned `package.json` and `package-lock.json` at `0.338.137`.

## Verification performed

- Run 412 PIN-proof readiness contract: **8/8 passed**.
- Pi withdraw consent/identity/cart separation contract: **12/12 passed**.
- Run 302 Pi withdrawal hardening contract: **35/35 passed**.
- Wallet A2U production-readiness contract: **16/16 passed**.
- Package/package-lock version alignment: **passed**.

A full Next.js production build and live Testnet A2U transaction were not run in this workspace. The archive does not configure Vercel, deploy a build, apply Supabase migrations, add Pi credentials, or fund the Pi app wallet.

## Testnet enablement and safety

The existing routes support Testnet A2U when explicit server environment gates and provider/database credentials are valid. The sample environment keeps payout gates fail-closed. No identity, wallet authorization, destination validation, PIN-proof, idempotency, reservation, reconciliation, or settlement checks were disabled. Mainnet payout execution is not enabled by this change.

## Follow-up when Vercel configuration is ready

1. Set a cryptographically random server-only value of at least 32 bytes for `GH_PIN_PROOF_SECRET`; the legacy alias `GHC_PIN_PROOF_SECRET` is supported if needed.
2. Supply real Pi Testnet API and app-wallet credentials, executor key, and Supabase service-role key in Preview only.
3. Deploy the Testnet branch and confirm the deployed runtime reports the PIN proof configured without exposing secret values.
4. Verify Pi wallet authorization and destination matching, then run a small controlled Testnet A2U payout through provider receipt and database settlement/reconciliation.
5. Keep Mainnet payout flags disabled until a separately approved release and evidence-backed E2E verification.
