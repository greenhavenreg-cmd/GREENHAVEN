# CURRENT BUILD CONTEXT — 0.338.104 RUN377 (2026-11-23)

- **User-designated source baseline:** `GREENHAVEN-0_338_102-RUN375-PI-SDK-EARLY-LOAD-2026-11-23 (1).zip`. RUN376 and RUN377 are source-only derivatives of that archive; no GitHub push or Vercel deployment has occurred.
- **Latest work:** RUN377 audits the live identity/session ACL contract, adds a least-privilege grant migration and corrects configuration-only readiness reporting. RUN376 aligns readiness with the effective production auth policy and separates Pi payment configuration readiness from overall platform readiness. The parent RUN375 early SDK loader and RUN374/RUN373 Pi authentication protections remain intact.
- **RUN377 verification:** ACL source contract 17/17; RUN376 readiness-policy regression 14 assertions; project-truth 11/11; release hygiene 17/17; documentation hygiene pass; migration inventory 232/232 synchronized. Full `npm run verify:static` exceeded the workspace execution window after 4,641 output lines without a reported assertion failure; completion is not claimed. Dependency-backed typecheck/lint/build and live Testnet acceptance remain outstanding.
- **Outstanding:** full Node.js 24.15.0 dependency-backed typecheck/lint/build, live Pi Browser Testnet sign-in, multi-account/device acceptance and browser/device tests. Workspace runtime Node 22.16.0, dependencies absent. Production remains NOT APPROVED. See `docs/UPGRADE-WORKLOG-0.338.104.md`.

## Historical build context — 0.338.99


- **User-designated source baseline:** `GREENHAVEN-0.338.93-RUN312-NOTIFICATION-RPC-FIX-2026-11-17.zip`; current local remediation derivative: `gh-connect@0.338.99`, a source-only derivative of the 0.338.93 candidate, itself derived from the supplied authoritative 0.338.92 baseline.
- **Package:** `gh-connect@0.338.99`; package, lockfile and in-app release identity are synchronized.
- **Baseline authority:** the supplied `GREENHAVEN-0.338.92-TESTNET-QUARANTINE-ENV-PREP-2026-11-17-1.zip` remains the authoritative parent archive. The candidate does not replace the user's baseline until accepted.
- **Latest work:** Quiet Premium shared interface layer; CI workflow and release-gate corrections; bounded server-side Supabase RPC/REST transport contracts; Run #312 TypeScript and notification RPC repairs; explicit private no-store notification responses; static gate alignment with the centralized transport and operator-key helpers; research evidence workflows retained in quarantine-first mode.
- **Coming Soon boundary:** the 30 unreleased ecosystem services remain `COMING_SOON` with no destination. Their 30-track upgrade plans are planning objectives, not completed feature implementations or permission to activate them.
- **Scanner limitation:** no trusted AV worker/provider or scanner secret has been configured. Newly uploaded evidence remains quarantined and content routes deny access until a scanner callback reports clean for the exact stored SHA-256.
- **Geography limitation:** active `gh_research_geo_units` references are validated; no national Nigeria hierarchy dataset or GPS/EXIF provenance is included.
- **Migrations:** three evidence migrations remain REVIEW_REQUIRED and unapplied. Existing Testnet migration state is not inferred from source inventory; reconcile against the live target migration history before any database operation.
- **Runtime:** Node 22.16.0 is available in this workspace; the project requires Node `^24.15.0`. Dependencies are not installed. Targeted Run #312 (28/28), Phase 6 (23/23), scoped-evidence (25/25), Vercel hygiene (17/17), and focused strict notification TypeScript checks pass. The full static suite exceeded the available execution window; full Node 24 dependency-backed typecheck/lint/build and browser acceptance are not yet completed.
- **Deployment:** no GitHub push, Vercel deployment or Mainnet changes. Production remains NOT APPROVED.

## Historical prompts and worklogs

This file is the current build context for the 0.338.93 remediation candidate. Earlier prompts, task plans, release worklogs and archived notes are historical context only; they do not override the current executable source, `docs/SOURCE_OF_TRUTH.md`, or the explicit safety boundaries above. Do not treat historical plans as proof that a feature is implemented, a migration is applied, or a release is approved.


## 0.338.96 audit derivative

Added a credential-free environment template to repair the confirmed latest Vercel prebuild blocker. Aligned the essential-controls navigation array and regression contracts with the actual six visible destinations. The user's 0.338.93 archive remains the authoritative starting point; 0.338.96 is the local candidate. No live database, financial, Pi, Mainnet or deployment changes were made.


## 0.338.96 Run 313 transaction hardening

Run 313 makes local transaction orchestration honest and testable: operations need explicit executors; completed operations are compensated in reverse order on failure; compensation failures remain visible; completed history is queryable. Backup restore validates data before applying profile, settings, posts and conversations in one state update. This is in-memory UI/state coordination only and must not be used as a financial/database transaction.


## 0.338.96 Run 314 — screen-by-screen experience pass
The current local candidate adds 30 responsive layout, focus, safe-area, touch and content-hierarchy refinements across the active screens. Component-level hooks were added for the community directory, marketplace listing grid, message inbox/thread composer, wallet scroll region, profile timeline and rewards balance summary. These changes do not modify financial, payment, order, reward or membership authority. The uploaded 0.338.93 archive remains the user-designated source of truth; 0.338.96 is a local working derivative.

## Historical prompts and worklogs

This file is the current build context for the 0.338.93 remediation candidate. Earlier prompts, task plans, release worklogs and archived notes are historical context only; they do not override the current executable source, `docs/SOURCE_OF_TRUTH.md`, or the explicit safety boundaries above. Do not treat historical plans as proof that a feature is implemented, a migration is applied, or a release is approved.


## 0.338.96 audit derivative

Added a credential-free environment template to repair the confirmed latest Vercel prebuild blocker. Aligned the essential-controls navigation array and regression contracts with the actual six visible destinations. The user's 0.338.93 archive remains the authoritative starting point; 0.338.96 is the local candidate. No live database, financial, Pi, Mainnet or deployment changes were made.


## 0.338.96 Run 313 transaction hardening

Run 313 makes local transaction orchestration honest and testable: operations need explicit executors; completed operations are compensated in reverse order on failure; compensation failures remain visible; completed history is queryable. Backup restore validates data before applying profile, settings, posts and conversations in one state update. This is in-memory UI/state coordination only and must not be used as a financial/database transaction.


## 0.338.96 Run 314 — screen-by-screen experience pass
The current local candidate adds 30 responsive layout, focus, safe-area, touch and content-hierarchy refinements across the active screens. Component-level hooks were added for the community directory, marketplace listing grid, message inbox/thread composer, wallet scroll region, profile timeline and rewards balance summary. These changes do not modify financial, payment, order, reward or membership authority. The uploaded 0.338.93 archive remains the user-designated source of truth; 0.338.96 is a local working derivative.

## 0.338.98 Run 315 CI remediation
The latest local derivative fixes the exact CI lint failures, the missing React hook dependency warning, the stale Pass 14 product-design build gate, and early-failure diagnostics artifact handling. A nine-check source gate is registered in prelint, prebuild checks and static verification. Node 24.15.0 dependency-backed lint/build still needs to run in CI.


## 0.338.99 Run 317 — browser-safe crypto build repair

GitHub Actions on 0.338.98 confirmed typecheck and lint passed and all 362 prebuild checks passed; the production build failed with Webpack `UnhandledSchemeError` for `node:crypto`. Run 317 replaces shared dynamic Node crypto imports with Web Crypto, isolates push endpoint hashing in the server-only layer, and adds a 9/9 regression gate. Push contract tests pass 19/19. A fresh Node 24.15.0 CI run must still confirm the production build. No GitHub push, Vercel deployment, Supabase mutation, migration apply, financial operation or Mainnet action occurred.


## 0.338.101 RUN372 — canonical identity principal consolidation

The Pi UID is an authentication-provider subject, not a second GreenHaven account ID. The browser now retains the local placeholder until the server returns a durable, verified Pi-to-GreenHaven mapping; profile hydration and SDK-only login cannot promote the Pi UID into an account principal. Server verification requires a Pi UID and a non-placeholder canonical GreenHaven user ID. Account switches reset prior account-bound state. Existing database keys and financial records are intentionally unchanged pending a complete Testnet data/schema inventory; Pi UID aliases are compatibility lookups only and never financial authorization evidence. No migration, database mutation, payout, deployment or Mainnet action was performed.


## 0.338.102 RUN373 — Pi Sandbox frame-classification correction

The latest Pi auth diagnostics showed `referrerHost=app-cdn.minepi.com` while the runtime reported `sandboxFrame=true`. RUN353's documented trust boundary identifies the exact `sandbox.minepi.com` host as the Developer Sandbox wrapper. RUN373 removes `app-cdn.minepi.com` from Sandbox-frame recognition and factors the exact-host rule into `isTrustedPiSandboxReferrerHost()`. This restores the normal parent-credentials handshake for non-Sandbox Pi-hosted frames while retaining the dedicated SDK authentication path for the confirmed Developer Sandbox. Server-side `/api/auth/pi` verification remains mandatory. The source regression explicitly prohibits reintroducing `app-cdn.minepi.com` as a trusted Sandbox referrer.

This is a source-only Testnet-targeted correction. It does not change environment variables, portal configuration, database schema/data, identity mappings, financial records, Pi payment scopes, or Mainnet behavior. Targeted regression checks are run locally; full Node 24.15.0 typecheck/lint/build and live Pi Browser Testnet acceptance remain outstanding. No GitHub push or Vercel deployment occurred.


## 0.338.103 RUN376 — Preview readiness and payment health

- Readiness now evaluates the effective development-auth policy from `readGhcServerEnv()` instead of the raw `GHC_ALLOW_DEV_AUTH` environment flag. Vercel Preview normally runs with `NODE_ENV=production`; dev auth is already hard-disabled in that runtime. An ineffective stale flag is now reported as a passing, hard-disabled policy with cleanup guidance, not a critical blocker.
- `/api/payments/health` now distinguishes `paymentConfigurationReady` from `platformReady` and overall `ready`. The configuration boolean means only that the Pi API key and client ID are present; it does not prove Pi API reachability or completed transactions. Detailed fields remain protected by the operator key.
- No authentication bypass, secret exposure, payment mutation, migration, Supabase write, GitHub push or Vercel deployment was performed.
- Static checks and source-only regression tests are recorded in `docs/archive/upgrade-worklogs/UPGRADE-WORKLOG-0.338.103.md`. Dependency-backed typecheck, lint, production build and live Testnet payment acceptance remain pending on Node 24.15.0. Production remains NOT APPROVED.

## 0.338.104 RUN377 — identity/session ACL audit

Confirmed: identity/session tables and base migration history exist in the currently connected Supabase project; `service_role` lacks required SELECT/INSERT/UPDATE grants. Added a source-only least-privilege migration, configuration-only readiness semantics, expanded diagnostics and regression gate. No database migration was applied because the Vercel Preview Supabase project-ref mapping remains unverified.
