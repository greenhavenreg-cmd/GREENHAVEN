# Run 405 — Local project handoff and reconciliation readiness

**Source version:** `gh-connect@0.338.137`  
**Purpose:** local source-only implementation package for GitHub Desktop review and handoff. Preparing this tree does not push to GitHub, deploy to Vercel, apply migrations, mutate the live database, or verify live provider/runtime behavior. Source presence and passing local contract checks are not evidence that remote operations occurred or that live services are healthy.

## Included source changes

- Added migration `20261125150000_run405_registration_backfill_account_discovery.sql`. It replaces the service-role-only, bounded Testnet backfill function so account discovery includes durable identity, profile, session, progress, achievement, GHC account/transaction and PI-ledger roots.
- The migration does not issue credits when applied. A separately authorized operator call is required; it needs explicit Testnet confirmation and must be run in reviewed batches. The existing claim RPC's unique campaign reference is retained for idempotency.
- Kept `GHC_REGISTRATION_BONUS_ENABLED` fail-closed by default in source. Do not enable it until this migration is applied, the correct Testnet project is verified, the app deployment includes this source, and the reward status/claim/available-balance RPCs pass live checks.
- Canonical Pi username is shown as the profile identity when available; the GreenHaven ID remains a separate account/lookup identifier. The local profile does not invent a Pi username when no verified mapping exists.
- The Pi sign-in surface remains a single fingerprint-style primary action. It changes from “Sign in” to “Try again” only after an attempted failure. Withdrawal authorization retry wording is also normalized to “Try again”.
- Retains Run 401's scoped premium polish for Feed, Marketplace, Community, Research, Messages, Discovery, Cart and Profile, including responsive and reduced-motion rules.
- Retains Run 402 net-first withdrawal quoting: the requested amount is the user's intended net payout; the server derives gross plus the 3% fee. Listing and community fee values remain Testnet Preview configuration, not source defaults for Production.

## Safe reconciliation procedure

1. Verify the Supabase project reference, environment, and Pi network before any write. Never use the Mainnet project for this campaign.
2. Export read-only snapshots of `gh_pi_identities`, `gh_user_profiles`, `gh_sessions`, `gh_user_progress`, `gh_user_achievements`, `ghc_user_accounts`, `ghc_transactions`, `gh_earnings_ledger_entries`, and withdrawal/payout history.
3. Match accounts by stable internal `gh_user_id`/`user_id` and verified Pi UID. Do not merge records on display names or `@USER` fallbacks. Keep Pi username as the only public username; keep GH ID separately labelled as an account ID.
4. Compare all historical source and destination migration versions and SQL definitions. Do not rewrite migration-history rows merely to make counts match. Classify each migration as exact match, name/version candidate, source-only, destination-only, or SQL mismatch.
5. Apply reviewed migrations in order. Re-run the read-only inventory. Run the bounded backfill with `I_CONFIRM_THIS_IS_THE_INTENDED_TESTNET_PROJECT`, page through every `nextCursor`, and retain each result as evidence. Investigate failures before retrying.
6. Verify that each account's campaign entry is unique and its PI ledger balance is reflected by the authoritative available/withdrawable RPC. Preserve pending/reserved/paid/expired/reversed statuses; never re-credit expired rows automatically and never count a database credit as an on-chain payout.
7. Only enable registration claims after live RPC tests and deploy to the correct Testnet Preview. Keep A2U/withdrawal execution disabled until provider credentials, destination binding, consent, fee math, idempotency, and a real small Testnet payout are verified end to end.
8. Validate authentication, account switching, balance refresh, and mobile Pi Browser layout before Production release.

## Financial invariants

- Registration reward target is cumulative and uses the authoritative PI ledger and a unique reference; no client-supplied amount is accepted.
- Existing valid credits must be reconciled by status and reference. Paid, reserved, expired, reversed and available values are not interchangeable.
- GHC balances are derived from posted transactions and existing spend/hold rules. Never overwrite balances with client/localStorage snapshots.
- A missing Pi identity is a mapping blocker, not permission to attach another user's identity or transactions.
- A 100 PI database ledger entry is not an on-chain Pi transfer.

## Local-source versus live-operations boundary

This archive contains local source and documentation only. It does not establish that GitHub contains these changes, that Vercel is running this version, or that any database migration has been applied. Live Testnet results described in the broader project history are historical evidence for the specific operations recorded there; they must not be generalized to this candidate. A passing source check validates its stated source contract only, not remote deployment, Pi authentication, payment, withdrawal, reward settlement, or database state.

## Validation status

Static source checks can run in the current workspace, but the package requires Node 24.15.0 and dependencies for typecheck/lint/build. Complete these on the user's machine after opening this extracted project. Live migration application, cross-project history import, Testnet Pi Browser authentication and actual A2U withdrawal remain operator/live-environment acceptance tasks, not claims made by this local archive.
