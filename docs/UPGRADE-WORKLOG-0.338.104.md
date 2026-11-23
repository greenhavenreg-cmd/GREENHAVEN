# Upgrade worklog — 0.338.104 RUN377

Date: 2026-11-23  
Parent: 0.338.103 RUN376 derived from the user-designated 0.338.102 RUN375 archive  
Scope: Pi identity and GH session persistence ACL audit; readiness evidence correction  
Disposition: Testnet ACL migration applied and postflight-verified; source corrections prepared. No GitHub push, Vercel deployment, payment operation or Mainnet action.

## Findings

1. The friend's missing-table hypothesis is not supported by the currently connected Supabase project inspected during this run. Both `public.gh_pi_identities` and `public.gh_sessions` exist, their columns match the canonical source migrations, and the database migration history contains versions `20261022010019` and `20261022010020`.
2. The same live catalog inspection found that `service_role` had no SELECT, INSERT or UPDATE privileges on either table. The role has `BYPASSRLS`, schema USAGE is present, and the existing deny-all RLS policies remain enabled. This is a concrete access-control defect: the identity store's initial SELECT can fail before it attempts an identity insert; subsequent PATCH/POST operations and session persistence also lack required privileges.
3. The `/api/health` identity/session checks were configuration checks, but reported a pass and `schemaReadiness: ready`. That overstated the evidence. Supabase credentials being present does not prove the table exists, schema matches, or PostgREST role privileges are correct.
4. The request-duration / HTTP-method profile alone cannot identify the exact failed SQL operation. The missing grants make the friend's broader persistence-failure diagnosis plausible, but the exact first failing request still needs a fresh correlated Testnet trace after the grant repair.

## Source changes

- Added `20261123145603_gh_identity_session_service_role_grants.sql` (renamed to the exact version recorded in remote Testnet history). It removes client/public and stale nonessential table privileges from the two server-only tables, then grants only SELECT, INSERT and UPDATE to `service_role`. It preserves RLS and the existing deny-client policies, changes no table definitions, and touches no rows.
- Initially corrected `/api/health` to stop overstating configured credentials; the final correction now performs live, bounded, read-only PostgREST probes of both identity/session table contracts.
- Expanded the read-only Pi auth SQL diagnostic to report service_role SELECT/INSERT/UPDATE/DELETE and client INSERT grants.
- Added RUN377 source regression checks and registered them in prebuild/static verification.

## Target database boundary

The Supabase account currently connected to this workspace exposes project `jhlsjnmfpakvibuuoygx` (`greenhavenreg-cmd's Project`, eu-west-1, ACTIVE_HEALTHY; created 2026-11-20). This is not the historical Testnet project ref recorded in older repository evidence (`tpckwgdsjlkzscjlxiwe`). The user subsequently confirmed that Vercel Preview `SUPABASE_URL` is `jhlsjnmfpakvibuuoygx.supabase.co`, matching this connected project. The RUN377 ACL migration was applied once to this Testnet project and its exact remote version was reconciled to the source filename in the correction addendum below. Mainnet was not modified.

## Verification status

- RUN377 source contract: 17 assertions (run separately).
- Migration inventory and existing RUN376 readiness regression are to be rerun after packaging.
- No live write/insert test was executed. Do not create test identities or session rows merely to probe privileges.
- Node 22.16.0 is available here; the project requires Node `^24.15.0`. Full dependency-backed typecheck, lint and Next.js production build remain unverified.

## Initial source-only verification scope (followed by live Testnet postflight)

The following steps were completed or explicitly bounded in this source increment:

1. Reopened the user-designated RUN375 archive-derived RUN376 working tree.
2. Inspected the exact identity and session route implementation.
3. Inspected both canonical SQL table migrations and their column contracts.
4. Read the connected Supabase project's migration history for the two base migration versions.
5. Queried the live catalogs for table existence, RLS, policies and service-role privileges.
6. Confirmed `service_role` has `BYPASSRLS` and `public` schema USAGE.
7. Compared the actual REST methods used by both server stores with the missing table privileges.
8. Added an additive least-privilege migration without changing table definitions or data.
9. Corrected `/api/health` so credential presence is not reported as verified table durability.
10. Added and executed RUN377 source regression checks and regenerated the migration inventory.
11. Executed the existing RUN376 readiness regression with Node's experimental type stripping enabled.
12. At the initial audit stage, recorded that the Preview project reference still needed user confirmation; the later correction addendum records confirmation, application, and postflight.

This is a source-only verification scope, not live authentication acceptance. Required runtime: Node.js 24.15.0. The available runtime is Node 22.16.0, so dependency-backed typecheck, lint and Next.js production build are not claimed.

## Required Testnet postflight

After the migration was applied to the confirmed Testnet project, verify `has_table_privilege('service_role', ..., 'SELECT'/'INSERT'/'UPDATE')` is true for both tables; confirm anon/authenticated CRUD remains false; confirm RLS and the deny-all policies remain; then perform a real Pi Testnet sign-in (still pending) and confirm `PI_IDENTITY_RESOLVE_OK`, `PI_SESSION_CREATE_OK`, and `PI_AUTH_COMPLETE` for the same correlation ID. Verify the session cookie with `/api/auth/session`. Do not replay the two base migrations; their history records already exist in the inspected database.

**Initial release decision (superseded by the correction addendum): source candidate only; live Testnet auth acceptance pending. Mainnet untouched.**

## RUN377 correction addendum — 2026-11-23

This addendum supersedes any earlier RUN377 statements above that conflict with the live verification below.

### Remote migration history reconciliation and applied ACL repair

- The user confirmed that Vercel Preview `SUPABASE_URL` points to `jhlsjnmfpakvibuuoygx.supabase.co`, matching the connected Supabase project `jhlsjnmfpakvibuuoygx` (eu-west-1, ACTIVE_HEALTHY).
- The canonical base migrations `20261022010019_gh_pi_identities` and `20261022010020_gh_sessions` were already recorded in remote history. Neither was replayed.
- The RUN377 ACL migration was applied once to Testnet. Supabase recorded version `20261123145603`, name `gh_identity_session_service_role_grants`. The archive file is now named `20261123145603_gh_identity_session_service_role_grants.sql`, with SQL content unchanged, so source version and remote version match exactly. It was not reapplied during reconciliation.
- Postflight confirmed `service_role` SELECT/INSERT/UPDATE true and DELETE/TRUNCATE false for both tables; `anon` and `authenticated` have no SELECT/INSERT/UPDATE/DELETE/TRUNCATE privileges. Both tables retain RLS and their deny-all client policies.
- A transaction executed under `SET LOCAL ROLE service_role` inserted and updated one synthetic identity row and one synthetic session row, then rolled back. Read-back counts were one for each table before rollback. A follow-up read confirmed the transaction left no fixture rows. No real identity/session rows were changed.

### Health endpoint correction

`/api/health` now awaits `evaluateLiveReadiness()`. It performs bounded, read-only PostgREST queries against the full expected column sets for `gh_pi_identities` and `gh_sessions`, with `limit=0`, a five-second timeout and a small response cap. It marks each store `ready` only when the live service-role read succeeds; otherwise it reports `failed` (or `missing` when credentials are absent). This verifies table/column visibility and the runtime SELECT path, not INSERT/UPDATE. Those write privileges are verified separately through the Postgres catalog and transactional service-role round-trip above. Other callers of the synchronous readiness evaluator retain their existing behavior.

### Pi auth pipeline review and acceptance boundary

The full `/api/auth/pi` path was inspected. It bounds/parses the request, verifies the access token with Pi Platform `GET /v2/me`, resolves the canonical GreenHaven identity only from the verified Pi UID, persists the identity mapping, issues a durable session, and returns the raw session token only in the HttpOnly cookie. The client then checks `/api/auth/session` and requires the same canonical GreenHaven user ID before marking the server session ready. Pi tokens are not persisted in the session table or emitted in diagnostic logs. Token-free stage telemetry covers request receipt, provider verification, identity resolution, session creation and completion.

A real Pi Browser handshake and cookie round-trip were not executed: this workspace does not possess a real Pi user access token and the corrected source has not yet been deployed to Preview. Do not substitute a synthetic token for provider acceptance. The external Preview health endpoint could not be retrieved from the available web runtime, so deployed HTTP acceptance remains outstanding.

### Corrected verification status

- RUN377 ACL source contract: 24/24 passed.
- RUN376 readiness policy: 14/14 passed.
- RUN353 Pi auth root-cause regression: its two stale assertions were updated to match the existing `isPiDirectAuthFrame()` implementation; 17/17 passed.
- Migration inventory: 232 source migrations; 122 REQUIRED, 1 REQUIRES_APPROVAL, 2 PROPOSAL, 107 REVIEW_REQUIRED. Manifest/checklist/apply-order are regenerated and synchronized. RUN377 is labeled applied on Testnet only and held for other targets.
- Full `npm run verify:static`: PASS (complete suite, exit code 0) after restoring the original RUN301 worklog contracts and updating the stale RUN353 frame-routing assertions.
- The environment remains Node 22.16.0 with no `node_modules`; the package requires Node `^24.15.0`. Dependency-backed typecheck, lint and Next production build are not certified here.

**Current release decision:** Testnet identity/session ACL repair and SQL write-path round-trip are verified, and the full static suite passes. The corrected source archive is prepared for GitHub review, but is not production-approved. Node 24.15.x dependency-backed typecheck/lint/build, deployed Preview health probe, and real Pi Testnet browser authentication/session-cookie acceptance remain release gates. Mainnet remains untouched; do not run bulk `supabase db push`.
