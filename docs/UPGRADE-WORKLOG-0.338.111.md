# GreenHaven 0.338.111 — Testnet Preview profile reconciliation

Date: 2026-11-21

**Package:** `gh-connect@0.338.111`  
**Target:** `testnet` branch / Vercel Preview only  
**Status:** source-only repair candidate; not pushed or deployed.

## Scope

Reconciled the Testnet Preview environment overlay with the canonical `.env.example`, `docs/ENVIRONMENT-VARIABLES.md`, server-side feature gates, and the owner-provided `GREENHAVEN-VERCEL-PREVIEW-ENV-ONLY-0_338_109.pdf` profile. This is a source configuration and documentation release only.

## Changes

- Recast `docs/TESTNET-PREVIEW-ENVIRONMENT.template` as a Testnet connectivity/verification overlay rather than a blanket feature-enablement profile.
- Preserved the Pi environment distinction: `PI_ENV=production` selects Pi Platform API mode; `PI_NETWORK=testnet` and `NEXT_PUBLIC_PI_SANDBOX=true` select Testnet.
- Kept Pi purchases, payout adapters/requests/execution/A2U, GHC withdrawals, marketplace payouts, Paystack transfers, rewards, referral settlement, tips, and curation redistribution fail-closed by default.
- Kept `PI_EARNINGS_AUTO_EXECUTE=false`, `GHC_CURATION_REDISTRIBUTE_V2_ENABLED=false`, `GH_GHPV_CALIBRATION_DAILY_CAP_V2_ENABLED=false`, and `GHC_ATOMIC_GLOBAL_EMISSION_V13_ENABLED=false`.
- Kept `GHC_WITHDRAWAL_GHC_PER_PI` blank and `PAYSTACK_LIVE_TRANSFERS_APPROVED=false`.
- Added explicit blank private inputs for `DOMAIN_VALIDATION_KEY` and `PI_API_KEY`; they must be supplied from the Pi Developer Portal in Vercel Preview for branch `testnet`, never committed or exposed as `NEXT_PUBLIC_*`.
- Rewrote the operator guide and environment policy to remove the previous contradictory instruction to enable money-moving rails.
- Added `scripts/check-testnet-profile-safety.mjs` to enforce the profile contract in both static verification and prebuild.
- Bumped synchronized project metadata to 0.338.111 and regenerated the migration checklist/verified manifest from the unchanged canonical SQL inventory.

## Release-integrity follow-up — Run #300 current-worklog identity

The Vercel build at commit `ff9505a` reached prebuild check 54/412 and failed only the Run #300 assertion `current upgrade worklog identifies the current package identity`. The current worklog already described release 0.338.111, but omitted the exact canonical package identity string required by the existing release-integrity contract. Added the explicit package metadata above; the checker and its assertion were not relaxed or bypassed.

This is a documentation/source-of-truth synchronization repair. It does not change runtime behavior, dependency versions, financial controls, authentication, authorization, migrations, or provider configuration.

## Safety boundaries

- No SQL migration was added, edited, reordered, deleted, or applied.
- No Supabase project/database was accessed or modified.
- No Vercel environment variable or secret was read, moved, overwritten, or deleted as part of this source archive update.
- No GitHub push or Vercel deployment was performed.
- Production/Mainnet configuration remains out of scope and unchanged.

## Verification status

- Testnet profile safety contract: 12/12.
- Project truth: 11/11.
- Release hygiene: 21/21.
- Run #332 security/environment contract: 16/16.
- Run #267 header and wallet authorization: 12/12.
- Run #269 client-table/sequence ACL: 20/20.
- Run #270 community integrity: 53/53.
- Run #271 social publishing integrity: 42/42.
- Project script integrity: 1,211 command entries, no duplicate commands or missing local script references.
- Phase 10 release closure: 19/19; Phase 10 platform acceptance: 24/24; Phase 24 final release review: PASS.
- Vercel build hygiene: 21/21; migration duplicate integrity: 231 unique versions, SHA-256 digests and basenames; generated inventory check: PASS.

The complete 412-check prebuild and dependency-backed TypeScript/lint/Next.js production build were not run because this workspace uses Node 22.16.0 while the project correctly requires Node 24.15.x. The supplied deployment log's 22 npm audit findings (1 critical, 13 high, 6 moderate, 2 low) remain a separate dependency-remediation task; no forced upgrades or audit-gate bypasses were made. Testnet operational readiness remains NOT CERTIFIED until provider credentials, Testnet migration history/schema, wallet/provider funding, and authenticated Preview E2E are independently verified.
