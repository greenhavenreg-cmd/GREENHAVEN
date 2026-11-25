# GreenHaven Run 408 — audit integration and ledger ACL repair

Date: 2026-11-25  
Source: user-supplied Run 406 archive (`0.338.132`) plus verified Run 407 audit patch.  
Candidate version: `0.338.133`.

## Integrated changes
- Added `20261125090000_run407_service_role_earnings_ledger_privileges.sql` to the canonical migrations directory.
- Classified the migration `REVIEW_REQUIRED` because the live Testnet application and history were verified, but repository-to-database migration history must still be reconciled before any automated replay.
- Updated the canonical migration generator metadata and generated inventory/checklist after integration.
- Preserved RLS on the earnings ledger; only `service_role` receives SELECT, INSERT and UPDATE. No DELETE privilege or direct `anon`/`authenticated` read access is granted.
- Added the Run 407 audit report to the project documentation.
- Bumped the candidate package version to `0.338.133` and synchronized current source authority documentation. Historical release reports remain historical.

## Verified live result
The correct Testnet database is `jhlsjnmfpakvibuuoygx`. The Run 407 postflight query confirmed:
- `service_role`: SELECT, INSERT, UPDATE = true; DELETE = false.
- `anon` SELECT = false.
- `authenticated` SELECT = false.
- RLS enabled = true.

## Open release blockers
1. Trace profile-store upsert 403/409 and Pi identity insert 400 to exact deployed route, commit, payload and schema constraints.
2. Reconcile Vercel Preview `NEXT_PUBLIC_SUPABASE_URL` target by non-secret project reference and branch scope.
3. Review server-role privileges route-by-route; do not blanket-grant all `gh_*` tables.
4. Classify the 37 RLS-enabled/no-policy tables as intentionally server-only or requiring narrowly scoped policies.
5. Reconcile the remote migration history against exact source SQL; never replay the entire directory or infer equivalence from counts.
6. Run Node 24.15+ dependency install, typecheck, lint, full static verification, production build, and browser/Pi Browser acceptance.
7. Keep Pi payout execution fail-closed until executor authorization, idempotency, reserve/release recovery and settlement reconciliation pass end-to-end tests.

## Release boundary
This is a local source handoff. It does not claim a GitHub push, Vercel deployment, full production build, full application audit completion, or payout enablement. Run 407's SQL change has already been applied to the intended Testnet database; do not blindly replay it. Review the repository migration history before any deployment automation attempts to apply it.
