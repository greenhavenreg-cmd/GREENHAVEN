# Run 402 — Net-first withdrawal quote and Testnet fee configuration

Date: 2026-11-25

## Implemented
- Withdrawal amount entered by the user is now treated as the intended **net PI payout** in the quote and create-request API paths.
- Server derives the minimum gross atomic reservation needed to deliver at least the requested net after a 300 bps fee, using integer/BigInt arithmetic; the database quote remains authoritative for available funds, identity, authorization, and final fee/net values.
- Withdrawal UI preview now treats the entered value as net and shows gross debit and fee separately. Quote freshness is bound to the entered net amount; the create request sends that same net intent.
- Registered `scripts/check-run402-net-first-withdrawal-fee.mjs` in the static verification chain.
- Aligned release metadata to `0.338.128`.
- Applied Vercel Preview-only, `testnet`-branch configuration to `gh-connect-5p3o`: `GHC_MARKETPLACE_LISTING_FEE_PI=10` and `GHC_COMMUNITY_CREATE_FEE_PI=5`. These were not added to Production or Development targets.

## Safety limits / not completed
- The Supabase Testnet migration ledger still has unresolved differences from the source migration directory. No migration was applied in this run and no `supabase_migrations.schema_migrations` rows were inserted or rewritten.
- The source contains a 100 PI campaign migration proposal, but it was not applied because migration history and existing RPC definitions need reconciliation. No user was credited in this run.
- No payout was sent and payout execution flags were not enabled. Net-first amount handling changes the application API contract; it still requires dependency-backed typecheck/build and Pi Testnet E2E validation before enabling withdrawals.
- The payout database function still calculates 3% of gross and returns net; the server calculates the gross amount corresponding to the requested net. We must verify on Testnet that database rounding and policy remain 300 bps and that provider settlement uses exactly the quoted `netAtomic`.
- Listing/community fee env values configure fee policy only; a charge is collected only where existing fee settlement and verified payment intent/ledger contracts are satisfied. These settings do not create PI balances.
- No GitHub push or Vercel deployment was performed.

## Checks run
- Run 402 net-first withdrawal contract: PASS.
- Run 400 welcome/sign-in gate: 4/4 PASS.
- Run 401 cross-surface styling gate: 16/16 PASS.
- SQL lexical integrity: PASS across 251 migration/proposal files.
- Release hygiene: 17/17 PASS.
- ZIP integrity checked after packaging.

## Coordinated release implementation steps
1. Re-read the current source archive and preserve existing architecture.
2. Review the withdrawal quote API and payout request API together.
3. Define user-entered amount as intended net PI.
4. Derive gross atomic amount server-side using integer arithmetic.
5. Retain database quote checks for balance and wallet authorization.
6. Preserve request idempotency and payout request fingerprinting.
7. Keep payout execution flags fail-closed until Testnet E2E verification.
8. Apply marketplace fee configuration only to the Testnet Preview branch.
9. Apply community creation fee configuration only to the Testnet Preview branch.
10. Keep the 100 PI migration held pending database migration-history reconciliation.
11. Keep release metadata and verified manifest aligned with package version.
12. Run focused withdrawal, sign-in, cross-surface, SQL lexical and release hygiene checks.

This is a source-level verification scope, not a full production build or live payment certification. The required build runtime is Node.js 24.15.0; the available local runtime in this session is not the project-pinned runtime.
