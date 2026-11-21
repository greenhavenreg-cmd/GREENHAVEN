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

## Membership session-integrity metadata — Phase 9

The current release metadata explicitly records the Phase 9 membership session-integrity guarantees: abortable refreshes, stale-response sequence fencing, immediate clearing of prior-account entitlement on wallet identity changes, and authoritative no-store rehydration after wallet-auth/session-resume/visible-tab events. The implementation and existing regression assertions remain unchanged; this metadata repair keeps the current increment’s release summary aligned with the verified source contract.

## Release-integrity follow-up — Run #300 current-worklog identity

The Vercel build at commit `ff9505a` reached prebuild check 54/412 and failed only the Run #300 assertion `current upgrade worklog identifies the current package identity`. The current worklog already described release 0.338.111, but omitted the exact canonical package identity string required by the existing release-integrity contract. Added the explicit package metadata above; the checker and its assertion were not relaxed or bypassed.

This is a documentation/source-of-truth synchronization repair. It does not change runtime behavior, dependency versions, financial controls, authentication, authorization, migrations, or provider configuration.

## Release blockers and separate environment holds

The consolidated release register remains fail-closed and distinguishes source completion from external operational evidence. The following blockers are still open and must not be represented as completed by a source-only repair:

- Pi Developer Portal / Sandbox authorization and valid Testnet credentials must be verified by the operator.
- Testnet migration history and live schema must be reconciled against the canonical source inventory; unresolved history rows must not be guessed, reconstructed, or replayed.
- Held SQL proposals/migrations require disposable PostgreSQL rehearsal, dependency review, and explicit operator approval before any application.
- Authenticated multi-account Pi Browser / Testnet Preview acceptance, provider funding, and end-to-end checkout evidence remain outstanding.
- Trusted scanner/provider infrastructure and provenance-backed geographic data remain external dependencies for the affected research/evidence workflows.
- A clean dependency-backed install, typecheck, lint, and production build on the supported Node 24.15.x runtime remain required; the supplied Vercel log's dependency vulnerability findings remain unresolved.

**Testnet:** source work is limited to the `testnet` branch and Vercel Preview. Operational readiness remains NOT CERTIFIED until the external gates above are evidenced.

**Mainnet:** Mainnet remains untouched and NOT APPROVED. No Mainnet configuration, credentials, schema, migration history, financial state, or deployment is authorized by this work.

**Production:** Production remains NOT APPROVED. No source-level pass changes this release decision.

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
