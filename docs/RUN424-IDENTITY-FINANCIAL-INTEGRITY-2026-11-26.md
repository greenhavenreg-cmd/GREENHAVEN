# RUN424 — Identity and financial integrity hardening

**Date:** 26 November 2026  
**Baseline:** GreenHaven 0.338.137 Phase 1–6 integrated R2  
**Network:** Pi Testnet only

## Verified defects corrected

1. **GHC withdrawal quote double-subtracted reservations.** `ghc_wallet_snapshot.balance` is spendable and already excludes open withdrawal reservations. The quote helper accepts posted ledger balance and subtracts reservations itself. The GET route now passes `ledgerBalance`, validates that reservation totals do not exceed the ledger, and returns a fail-closed reconciliation response for inconsistent data. The underlying withdrawal-create RPC remains authoritative and unchanged.
2. **Partitioned session cookie was not cleared with matching attributes.** Production session issuance used `Secure; Partitioned`, but logout/revoke clearing omitted them. The clear-cookie now carries the same production attributes, preserving `SameSite=None`, `Path=/`, and `HttpOnly`.
3. **Wallet snapshot schema fallback hid missing ledger dimensions.** `rpcWalletSnapshot` no longer substitutes `balance` for a missing `ledgerBalance`; malformed or older RPC responses fail closed.

## Verification

- RUN424 source-contract regression gate added to prebuild and static verification.
- Existing targeted checks: identity audit, Pi scope isolation, Pi timeout handling, identity principal, session ACL, privacy grants, referral session isolation, membership session safety, identity mapping, withdrawal single-entrypoint, withdrawal body bounds, withdrawal recovery, Pi withdrawal hardening, unified earnings ledger, wallet ledger resilience, rewards account isolation, reward contract, withdrawal journey, wallet/rewards transparency and cashback ledger.
- Runtime-only tests pass when invoked with Node's experimental TypeScript stripping flag; the default Node 22.16.0 runtime cannot import TypeScript test dependencies directly.
- No Supabase migrations, financial records, Vercel settings, or GitHub branches were modified in this pass.

## Release boundary

The Testnet Preview environment remains explicitly fenced: `PI_NETWORK=testnet`, `NEXT_PUBLIC_PI_SANDBOX=true`, `PI_A2U_TESTNET_ONLY=true`, `PI_EARNINGS_AUTO_EXECUTE=false`, and `GHC_WITHDRAWALS_ENABLED=false` were observed in the connected Preview configuration. Do not enable Mainnet or automated payouts as part of this work.


## RUN425 — Pi sign-in profile upsert reliability

Live Vercel runtime error clusters showed repeated HTTP 409 responses from the profile-store upsert on `/api/auth/pi`. The connected Testnet schema confirms `gh_user_profiles.gh_user_id` is the primary key. The PostgREST request specified `on_conflict=gh_user_id` but omitted `Prefer: resolution=merge-duplicates`, so an existing profile could be treated as a duplicate INSERT rather than an idempotent upsert. The write now requests merge-duplicates and representation, and includes the existing `created_at` value to preserve record age. Pi token verification, canonical identity mapping and session creation remain authoritative; optional profile presentation sync remains recoverable. RUN425 adds a dedicated static regression gate. No migration or live profile row was changed.


## Live operational findings — 26 November 2026

- Vercel runtime error aggregation for `/api/auth/pi` showed two correlated profile-store error groups, each with 10 occurrences across four users: HTTP 409 on profile upsert and the subsequent durable-write failure. These are profile-presentation sync failures, not evidence of Pi Platform token rejection; the Pi auth route intentionally treats this optional sync as recoverable and continues to session issuance.
- RUN425 repairs the missing PostgREST `resolution=merge-duplicates` preference and makes production profile upsert fail closed if the profile read itself is unavailable, avoiding an accidental reset of `created_at`. The live route must be retested after deployment.
- Vercel Preview environment metadata flags `GHC_OPERATOR_RECONCILE_KEY` as `readable-secret` (encrypted value not decrypted or changed). Before operator reconciliation endpoints are used, move this key to Sensitive visibility and rotate it through the authorized operator workflow.
- Testnet safety flags were read-only verified: `PI_NETWORK=testnet`, `NEXT_PUBLIC_PI_SANDBOX=true`, `GHC_ENV=testnet`, `PI_A2U_TESTNET_ONLY=true`, `PI_EARNINGS_AUTO_EXECUTE=false`, and `GHC_WITHDRAWALS_ENABLED=false`. The manual payout execution feature flag is enabled for Testnet Preview only; auto-execution remains off and the Testnet network fence remains on.
- The connected Supabase project is ACTIVE_HEALTHY. Its migration history has 240 records versus 245 source SQL files, with one duplicate migration name (`run406_server_read_privilege_reconciliation`) at two distinct versions. No migration was applied or replayed.
- Security advisor continues to report 37 RLS-enabled tables without policies at INFO level. The separately checked server-only tables have no anon/authenticated SELECT/INSERT/UPDATE/DELETE grants; do not add blanket client policies. Performance advisor reports 17 unindexed foreign keys and 183 unused-index candidates; inspect query plans before changing indexes.


## Least-privilege follow-up proposal

A read-only privilege matrix across identity and financial tables confirmed that `anon` and `authenticated` have no table privileges on the inspected tables. It also found extra `REFERENCES`, `TRIGGER` and `TRUNCATE` privileges for `service_role` on `gh_user_profiles`, `gh_step_ups`, `ghc_transactions` and `ghc_withdrawal_requests`. The application profile writer needs only `SELECT`, `INSERT` and `UPDATE`; the other listed tables are accessed through server-owned RPCs. A held proposal at `supabase/proposals/20261126_run425_revoke_unneeded_service_role_table_privileges.sql` removes only those unnecessary service-role privileges and checks effective postconditions. It is deliberately not in `supabase/migrations/` and has not been applied. Validate role inheritance/default privileges on a disposable PostgreSQL copy and reconcile remote migration history before any Testnet application.
