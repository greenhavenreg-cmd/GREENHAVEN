# Run 412 — Testnet Pi withdrawal PIN-proof readiness

Version: `gh-connect@0.338.137`  
Scope: Testnet-only withdrawal request UX and server-side PIN-proof configuration.

## Changes

- `GH_PIN_PROOF_SECRET` remains the canonical server-only HMAC key for request-bound withdrawal PIN proofs.
- `GHC_PIN_PROOF_SECRET` is accepted only as a compatibility fallback when the canonical variable is absent. If both are present, the canonical key wins.
- The secret is never returned by API responses or diagnostics. The minimum accepted key length remains 32 characters.
- Missing-key API responses identify the environment variable names without returning secret material and clarify that funds have not been reserved.
- The Pi withdrawal sheet now tells the user exactly which Testnet Preview environment setting needs attention.
- Package and lockfile versions are aligned at `0.338.137`.

## Testnet enablement boundary

The existing server routes already support Testnet A2U when the explicit request/execution/A2U feature gates are enabled. The source keeps `.env.example` payout gates fail-closed by default. No credential checks, Pi identity authorization, wallet-destination verification, PIN proof, idempotency, balance reservation, provider reconciliation, or settlement guard was bypassed. Mainnet payout execution remains out of scope.

This source update does **not** configure Vercel secrets, fund the Pi app wallet, apply Supabase migrations, deploy the branch, or prove a live withdrawal. After environment configuration and deployment, validate the PIN-proof endpoint, payout health checks, wallet authorization, and a small controlled Testnet A2U payout through provider receipt and ledger reconciliation before treating the feature as operational.

## Verification

Run:

```bash
node scripts/check-run412-testnet-withdrawal-readiness.mjs
node scripts/check-pi-withdraw-consent-identity-0.338.16.mjs
node scripts/check-run302-pi-withdrawal-hardening.mjs
node scripts/check-wallet-a2u-production-readiness.mjs
```
