# RUN444 worklog — Testnet payment and withdrawal rails

**Package:** `gh-connect@0.338.156`  
**Parent:** `0.338.155` / RUN443  
**Runtime requirement:** Node.js 24.15.0  
**Verification scope:** source-level and local regression checks only; provider transaction acceptance is not claimed.

1. Inspected the RUN443 payment, withdrawal, Paystack, GHC seller-payout and environment-flag implementations before changing behavior.
2. Added a dedicated Testnet activation profile at `config/testnet-payments.env.example` without weakening the generic `.env.example` defaults.
3. Enabled the Pi A2U, Pi earnings payout request/execution and user-triggered payout handoff flags in the dedicated Testnet profile.
4. Enabled GHC→Pi withdrawals and marketplace GHC seller payout flags in the dedicated Testnet profile.
5. Enabled Paystack transfer requests in the profile while requiring a test secret for Testnet and leaving live-transfer approval false.
6. Hardened the Paystack runtime so a Testnet deployment cannot use a live secret or Vercel Production to initiate transfers.
7. Hardened GHC→Pi withdrawals and marketplace GHC seller settlement so they are restricted to non-Production Testnet.
8. Kept Pi wallet seeds, Pi API credentials, payout executor key, GHC treasury identity, reconciliation key and Paystack secret blank; missing credentials continue to fail closed.
9. Added `scripts/check-run444-testnet-payment-rails.mjs` and registered it in static verification and prebuild checks.
10. Updated release metadata, source-of-truth documents, README, documentation index and the verified source manifest to `0.338.156`.

## Verification

- RUN444 focused contract: **9/9 PASS**.
- RUN337 safe environment regression: **7/7 PASS**.
- RUN384 Testnet/migration boundary contract: **13/13 PASS**.
- Wallet A2U readiness contract: **16/16 PASS**.
- Documentation hygiene: PASS.
- The full static suite passed: **63/63 registered gates, 5,378 PASS lines, zero FAIL lines**. Prebuild dry-run discovered **465 checks**; actual prebuild execution is blocked locally because the workspace has Node 22.16.0 instead of required Node 24.15.0.

## Not performed / acceptance limits

No provider transactions, credential additions, remote Vercel environment changes, database mutations, GitHub push, deployment or Mainnet activity occurred. Operational acceptance remains pending Testnet credentials/funding, controlled low-value transactions, callback/replay tests, payout worker behavior and ledger/provider reconciliation. Mainnet and live bank transfers remain NOT APPROVED.
