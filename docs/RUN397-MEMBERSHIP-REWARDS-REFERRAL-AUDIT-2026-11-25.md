# Run 397 — Membership, Rewards and Referral Deep Audit

**Package:** `gh-connect@0.338.124`  
**Baseline:** user-designated `GREENHAVEN-0.338.119-PHASE9-COORDINATED-ONBOARDING-IDENTITY-STORAGE-2026-11-24-3.zip`  
**Classification:** source-only upgrade; production remains **NOT APPROVED**.

## Summary

Run 397 upgrades the registration-reward campaign, referral accounting, account-isolation behavior, release metadata and regression coverage while preserving the existing wallet, membership, GHC ledger, Pi payment and payout architecture.

### Registration rewards — cumulative 100 PI Testnet target

- The campaign target is **100 PI total cumulative registration credits per account**, not an additional 100 PI on top of historical registration rewards.
- Previously valid registration-bonus ledger credits count toward the target. An account with 3 PI already credited is eligible for a 97 PI top-up; an account without prior valid registration credits is eligible for up to 100 PI.
- Credits use the PI earnings ledger's 1e-7 atomic scale, a separate campaign idempotency reference and an account-level advisory transaction lock. The server derives amount and eligibility; the client cannot submit an amount.
- The app fails closed unless `GHC_REGISTRATION_BONUS_ENABLED=1`, `NEXT_PUBLIC_PI_SANDBOX=true`, `PI_NETWORK=testnet`, and the Vercel environment is not Production. It also refuses to run the previous 3 PI RPC as though it were the new campaign if the campaign migration is missing.
- Eligible accounts are automatically reconciled when they open the Rewards surface. An operator-only, bounded backfill covers known Pi identities, durable profiles, sessions and PI-ledger accounts for dormant existing accounts. The backfill requires a literal confirmation phrase, cursor checks and failure propagation.
- **No reward was issued by this source build.** The campaign migration and operator backfill have not been applied or run. Existing accounts receive the new campaign only after an approved Testnet migration plus the backfill or an eligible authenticated visit; the source archive alone does not credit anyone.

### Referral system

- Referral totals now use a service-role-only database aggregate rather than fixed REST sample limits, preventing inviter totals from being silently capped at 200 invite attributions or 100 reward rows.
- Qualifying reward policy is 5% of a server-verified membership charge after discount, capped at 25 GHC per referral and 50 qualifying pending/posted rewards per inviter per rolling 30 days.
- Advisory locking serializes cap checks for each inviter; duplicate referred accounts and membership references remain idempotent; self-referrals remain rejected.
- The summary RPC no longer returns the referrer's internal account ID to the client.
- The UI clears referral-derived state before refresh/account change, no longer treats shared `localStorage` as authority for a referral lock, and includes a clipboard fallback for browsers without `navigator.clipboard`.
- Referral settlement remains governed by the existing server-side operator feature flag. Pending rewards do not imply available funds.

### Membership and rewards safety

- Existing membership purchase, price catalog, entitlement, expiry, downgrade, and Pi/GHC rail-separation rules were preserved.
- Existing rewards history and claims remain server-authoritative; no client-side minting or balance authority was added.
- Existing withdrawal consent, wallet authorization, payout status and provider verification boundaries remain unchanged.
- A pre-existing misplaced root-level `verify:static` command fragment was merged into the actual `scripts.verify:static` command chain, the stale 0.338.119 acceptance check was made version-aware, and the previous worklog was archived rather than left as an unclassified current document.

## New migrations — review required

1. `20261125130000_run397_testnet_registration_bonus_100_pi.sql` — cumulative target status/claim RPCs and bounded service-role-only Testnet backfill.
2. `20261125140000_run397_referral_quality_caps_and_summary.sql` — serialized referral caps and full referral summary RPC.

Both migrations are **REVIEW_REQUIRED** and **not applied**. A read-only inspection of the connected `GH Connect Testnet Supabase` found 47 recorded migration versions versus 242 migrations in the current source inventory. The expected old registration-bonus functions and all required tables exist, but the v2 bonus migration is absent from the recorded history; the database still has the 3 PI RPC implementation. This is a material history drift, so I did not apply the new migrations or run the backfill. Before application: reconcile the exact Testnet migration history, validate function signatures, privileges and table contracts on disposable PostgreSQL, test concurrent claims and referral caps, and confirm the target project's `PI_NETWORK=testnet` and non-Production environment. Never run the registration backfill on Mainnet.

## Verification evidence

- Read-only connected Testnet census: 7 known accounts, 6 Pi identity rows, 7 durable profiles, 264 session rows, 6 accounts with PI ledger rows, 6 accounts with prior registration credits totaling 18 PI, no account already at 100 PI, and no Run 397 campaign entries. No individual account IDs were copied into the report.
- `npm run verify:static`: **passed**, exit code 0; 5,045 `PASS` lines and 0 `FAIL` lines in the captured output.
- `npm run prebuild:checks`: attempted; 473 checks passed before it stopped with `ERR_MODULE_NOT_FOUND` because `typescript` is not installed in this workspace. This is not a successful prebuild result.
- Run 397 focused gate: **16/16**.
- Registration bonus gate: **18/18**.
- Run 396 wallet/payout/membership/rewards gate: **17/17**.
- Membership release gate: **16/16**; membership foundation: **18/18**; membership session safety: **15/15**.
- Rewards history: **20/20**; wallet/rewards/membership closeout: **43/43**; membership transformation: **31/31**; fee/referral contract: **10/10**.
- Migration inventory generator: synchronized, **242** migration files; SQL lexical integrity: passed across 251 migration/proposal files; release hygiene: **17/17**; project truth: **11/11**; documentation hygiene: passed.
- Package, lockfile, in-app release metadata and current source documents are aligned at `0.338.124`.

## Outstanding release gates

This workspace has Node 22.16.0; the project requires Node.js 24.15.0 (`^24.15.0`). Project dependencies are not installed. Dependency-backed TypeScript, lint and Next production build are not certified; the prebuild-check chain is blocked by the missing `typescript` package. SQL lexical checks are not a substitute for running the migrations on disposable PostgreSQL. Only read-only live Testnet schema/function/account checks were performed. Live Supabase migration/backfill, actual Pi Testnet deposits/withdrawals, membership provider payment reconciliation, referral settlement, browser/device testing, GitHub push and Vercel deployment have not been performed.

**Production status: NOT APPROVED.** Keep the new migration files held, keep referral settlement operator-gated, and do not enable this campaign on Mainnet.
