# GreenHaven Run 407 — production audit findings and hotfix
Date: 2026-11-25
Scope: connected Testnet Supabase `jhlsjnmfpakvibuuoygx`, GitHub `greenhavenreg-cmd/GREENHAVEN` branch `testnet`, Vercel project `greenhaven`.

## Confirmed live findings

1. **Earnings ledger privilege blocker (fixed in Testnet):** `service_role` had no SELECT, INSERT, or UPDATE privilege on `public.gh_earnings_ledger_entries`. This blocks trusted server-side reward/balance/payout code that reads or writes the ledger. Run 407 grants only those three privileges. Verification after apply: service_role SELECT/INSERT/UPDATE=true, DELETE=false; anon SELECT=false; authenticated SELECT=false; RLS remains enabled.
2. **Runtime auth/profile failures still need deployment-level reconciliation:** Vercel error aggregation for the last seven days showed 27 profile-store upsert 403/409 events across four users, eight Pi-auth stage failures, four `dbSelectByPi` 403s, and four `dbInsertNew` 400s. The current live database privilege check shows SELECT/INSERT/UPDATE already granted to service_role on `gh_pi_identities`, and all three on `gh_user_profiles`. This suggests errors may be from an older deployment, a different configured Supabase target, or schema/constraint mismatch; do not suppress or replace them with memory-only identities.
3. **Service-role privileges are inconsistent across domain tables:** a read-only privilege inventory showed many `gh_*` tables with no SELECT/INSERT/UPDATE grants, including several financial, wallet, marketplace, messaging, media, and reward tables. Do not blanket-grant all tables: each table requires route-by-route authorization and least-privilege review.
4. **Supabase security advisor:** reports 37 RLS-enabled tables with no policies. These may intentionally be server-only, but each must be classified. Server-only tables should have explicit, documented role grants; client-readable/writable tables need narrowly scoped policies. Do not create broad `USING (true)` policies to silence the advisor.
5. **Source/deployment drift:** GitHub `testnet` `package.json` reports version `0.338.119`, while the latest handoff discussed in conversation is Run 406 / `0.338.132`. Current Vercel deployment is READY but not production-targeted and SSO protection is enabled. The source version discrepancy must be reconciled before assuming Run 406 UI fixes are deployed.
6. **Migration history drift (known prior audit):** prior reconciliation recorded 47 migration history rows vs 242 source migration files, with 20 DB rows lacking filename matches and content equivalence unproven. Never replay all migrations or mark them applied by name/count alone. Resolve exact SQL provenance before applying reward campaign/backfill migrations.
7. **Financial execution stays fail-closed:** do not enable Pi A2U or payout execution until the actual Testnet executor, wallet authorization, idempotency, reservation/release recovery, and settlement reconciliation pass end-to-end tests. A ledger credit is not an on-chain Pi transfer.

## Changes applied
- Applied Supabase migration `run407_service_role_earnings_ledger_privileges` to the correct Testnet project.
- Added matching source migration file in this patch archive. Confirm the migration filename/version is compatible with the repository's migration inventory and update the canonical inventory/checklists before merging.

## Required next audit phases
- Verify Vercel Preview environment `NEXT_PUBLIC_SUPABASE_URL` resolves to the correct Testnet project without exposing secrets; inspect key names and branch/environment scopes only.
- Trace profile upsert 403/409 and identity insert 400 to exact route, request payload, SQL constraints, and deployed commit SHA.
- Map every API route to its tables/functions and required service-role privileges; apply only minimal grants, with no blanket grants and no direct client access to financial ledgers.
- Reconcile database migration history to exact source SQL and schema/function definitions.
- Run Node 24.15+ install, typecheck, lint, full static checks, production build, Playwright/browser smoke, Pi Browser auth, account-switch isolation, social visibility, marketplace/cart, membership, rewards, and wallet quote/settlement tests.
- Verify balance/history reconciliation using canonical user IDs and transaction references; never infer balances from UI cache or copy users/transactions between projects without provenance.

## Verification performed
- Supabase migration application succeeded.
- Post-apply privilege query confirmed: service_role SELECT/INSERT/UPDATE true; DELETE false; anon SELECT false; authenticated SELECT false; RLS enabled true.
- Vercel runtime error aggregation inspected (7-day window). Raw runtime logs were unavailable for that period on the current Vercel plan's retention window.
- Full project TypeScript/lint/build and browser/device acceptance were not run in this audit turn.
