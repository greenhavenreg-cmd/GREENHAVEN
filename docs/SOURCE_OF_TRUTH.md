# GreenHaven source authority — 0.338.111 RUN390 Membership, Feed and Marketplace read-path repair (2026-11-24)

**Current source version:** `0.338.111`
**Authoritative working baseline:** `GREENHAVEN-0.338.106-RUN385-RESEARCH-FIELD-RESEARCH-UPGRADE-2026-11-24.zip`  
**Audit parent:** RUN384 full project audit and live Testnet/Preview reconciliation.  
**Current working tree:** RUN390 source-only derivative of RUN389/RUN385. RUN390 adds a least-privilege read-grant migration for the live Membership, Feed privacy and Marketplace failures; it remains REVIEW_REQUIRED and unapplied. RUN386 adds deterministic keyset pagination and bounded complete CSV export; RUN387 adds privacy-suppressed descriptive analytics; RUN388 adds scheduled study availability and atomic response quotas; RUN389 adds server-enforced owner/editor/reviewer/field-agent capabilities and team lifecycle controls.  
**Package identity:** `gh-connect@0.338.111` (user-facing brand: GREENHAVEN).

This source remains a candidate, not a deployment. GitHub write permission was previously denied (HTTP 403); no push or Vercel deployment is claimed. The RUN388 migration is `REVIEW_REQUIRED`; do not deploy its calling code before disposable-PostgreSQL validation, Testnet history reconciliation, explicit operator approval, application and postflight verification. No Supabase migration has been applied by this work. No production database or Mainnet mutation occurred; source migration inventory is not evidence of applied migrations. Production, Mainnet, payment state, balances and financial records remain untouched. TypeScript, lint, and Next.js production build on supported Node 24.15.x remain release gates.

Focused RUN385–RUN390 contracts pass 19/19, 17/17, 14/14, 16/16, 21/21 and 11/11 respectively; full static verification passes 63/63, production-safety checks pass 21/21, and the secret-pattern scan reports zero potential values across 2,808 text files. These checks are source-level and do not replace Node 24.15.x dependency-backed build or live acceptance.

The established architecture remains authoritative: work only on GitHub `testnet` and Vercel Preview; preserve canonical GreenHaven identity, official Pi SDK authentication and server-side Pi Platform token verification; require durable GreenHaven sessions for Research/Field APIs; keep service-role credentials server-side; preserve RLS and client-deny grants; and do not infer cryptographic Pi Browser attestation from user-agent/referrer values. Node 24.15.x dependency-backed typecheck/lint/build, live Pi Browser and database acceptance remain release gates.

## RUN390 — Membership, Feed Privacy and Marketplace read-path repair

Live Testnet catalog inspection identified missing service_role SELECT privileges on `ghc_membership_entitlements`, `gh_user_mutes`, `gh_marketplace_listings`, and `gh_marketplace_variants`. These explain the three reported Preview failures. RUN390 adds a narrowly scoped migration that preserves RLS, denies client table access and grants service_role SELECT only; existing write RPCs remain the only write path. The migration is REVIEW_REQUIRED and unapplied. See `docs/RUN390-MEMBERSHIP-FEED-MARKETPLACE-READ-REPAIR-2026-11-24.md`.

## RUN389 — team collaboration and granular roles

Adds a centralized server-side Research capability matrix. Owners retain full project administration; editors can read responses/analytics and attach their own evidence; reviewers can read and review scanner-cleared evidence; field agents receive no Research Studio data access and must use separately assigned Field Desk scopes. Project lists include active/invited collaborations, collaborator schemas omit exam answer keys, and the owner team workspace supports invitations, role changes, suspension, reactivation and revocation. Exam/election management remains owner-only until every API surface adopts the permission matrix. See `docs/RUN389-RESEARCH-TEAM-ROLES-2026-11-24.md`.

## RUN388 — scheduled studies and atomic response quotas

Study creation now accepts optional opening/closing timestamps and a response quota. The public form checks study availability, while final submission calls `gh_research_submit_response`, a service-role-only SECURITY DEFINER RPC that locks the project row, preserves idempotent retries, validates schedule/quota configuration and enforces the response limit under concurrent submissions. Migration `20261124150000_run388_research_atomic_schedule_quota.sql` is held `REVIEW_REQUIRED` and unapplied. Do not deploy the caller until the migration is approved, validated and installed on Testnet.

## RUN387 — privacy-aware descriptive research analytics

Adds owner-scoped, rate-limited descriptive analytics for review status, numeric distributions, choice counts and valid date ranges. Free-text content is never returned; categorical groups below five are suppressed. Analysis is bounded to 20,000 records and labels incomplete coverage. Geographic analysis is deliberately not inferred from free-text answers; canonical geography and privacy governance remain a separate stage.

## RUN386 — paginated response management and complete bounded export

Replaces the fixed 200-row inbox query with deterministic keyset pagination (`submitted_at DESC, id DESC`), validated opaque cursors, bounded page sizes and no-store responses. The UI supports load-more and traverses the complete cursor before creating a CSV. Export aborts without a partial file if a page fails and is capped at 20,000 responses in the browser.

## RUN385 — Research & Field Research workspace upgrade

RUN385 reorganizes the Research Studio home with project lifecycle metrics, study search/status filters, improved response inbox controls, Pi Browser-only participation messaging, Field Desk session-verification UX and no-index metadata. See `docs/RUN385-RESEARCH-FIELD-RESEARCH-UPGRADE-2026-11-24.md`.

## RUN384 — full project audit and targeted hardening (2026-11-24)

The current live target comparison is documented in `docs/RUN384-FULL-PROJECT-AUDIT-2026-11-24.md`. GitHub `testnet` and the READY Vercel Preview remain at commit `06122b28a5d96ef301e1eb10d344af51c3005702`; RUN384 is local only. The connected Supabase Testnet project is `jhlsjnmfpakvibuuoygx`, healthy on PostgreSQL 17.12, with 234 applied migration records. RUN384 restores the two applied-but-missing call migration source files from the live catalog as explicitly reconstructed sources, adds two held migrations (RUN383 least-privilege identity/privacy grants and RUN384 17 foreign-key indexes), hardens Testnet unlock network fencing, changes `.env.example` financial feature defaults to off, and makes direct media upload fail clearly when private bucket provisioning fails. Neither new migration has been applied. No Production/Mainnet or financial data changes occurred.

## RUN383 — identity and feed-privacy service-role grants (2026-11-24)

Preview runtime logs on the existing `testnet` deployment showed three durable profile upsert failures (HTTP 403). RUN383 adds a held, additive migration with least-privilege `service_role` grants for the server-owned profile, achievement, progress-read and feed mute-list tables while preserving RLS and denying all table privileges to `PUBLIC`, `anon`, and `authenticated`. The supplied feed privacy error may share the missing mute-table grant cause, but that exact runtime error was not found in the recent logs. The live Supabase catalog confirms all four tables lacked service_role table privileges while RLS and client-deny state remained intact; the new migration is `REVIEW_REQUIRED` and has not been applied. Daily-claim and registration-bonus migrations/RPC ACLs are already present in Testnet history. Vercel Preview currently has `GHC_REGISTRATION_BONUS_ENABLED=false`, so the 3 PI welcome bonus is intentionally gated off. RUN383 regression check: 9/9; full static suite passed.

## RUN382 — Supabase REST JSON content-type correction

Pi SDK authentication now reaches the server with a valid access token, but canonical identity insertion failed because the shared Supabase REST helper omitted `Content-Type: application/json` for JSON string bodies. RUN382 centralizes this policy in `lib/server/supabase/rest-headers.ts`, preserves explicit content types and non-string bodies, and adds a five-case behavior test. Full static verification passes 63/63. GitHub write operations returned HTTP 403, so this is not yet in the remote `testnet` branch and is not deployed. No database or environment changes were made.

## RUN381 — Pi authentication CSP correction

The observed Testnet Pi Browser rejection correlated with enforced `connect-src` blocks for exact host `socialchain.app`. RUN381 adds only `https://socialchain.app` to `connect-src`, not a wildcard, and extends the CSP regression check. Live Preview acceptance remains outstanding.

## RUN380 — Pi-only Research and Field access boundary

The complete registered `npm run verify:static` suite now exits 0. The consolidated network/database-independent suite passes 63/63. This does not replace Node 24.15.x dependency-backed typecheck/lint/build or live Pi Browser acceptance.


- Removed `/r/:slug`, `/field`, and `/portal-setup` from the anonymous route allowlist. Only `/privacy`, `/terms`, `/support`, and `/validation-key.txt` remain public. Every ecosystem/service route uses the Pi-authenticated application shell and early Pi SDK loader.
- Middleware now redirects anonymous service-page requests to the root sign-in entry until a `gh_session` cookie exists. This is an early page perimeter only; it does not treat cookie presence as authentication. Protected Research and Field API handlers independently require `requireAccountSecurityContext`, which verifies the GreenHaven server session and enforces durable session storage in production.
- `/field` remains the field reporting workspace inside the authenticated app shell; the public code-entry unlock UI is removed. `/api/field/unlock` is retired and returns HTTP 410. Field session status, surveys, reports, evidence intent/completion and admin review/content APIs require a durable Pi-derived GreenHaven session. Field evidence scope identifiers are derived server-side from canonical Pioneer ID plus the verified session ID.
- Research share pages still use their existing opaque URLs, but the form metadata, submission, evidence-intent/completion and examination APIs now require a durable GreenHaven session. Read-only service metadata and fee-quote APIs used by Marketplace, Communities, Economy, Pi capabilities, push configuration and social quality/reward surfaces also require the durable account-security context. Response evidence submission keys are server-derived per Pioneer; examination attempt hashes are derived from the authenticated Pioneer rather than client-provided respondent keys. New Research projects set `allow_anonymous=false`.
- Pi Browser enforcement is based on the official Pi SDK authentication flow plus server-side Pi Platform token verification and the resulting durable GreenHaven session. User-agent/referrer strings are not treated as cryptographic proof of browser identity. The middleware cookie-presence check is only an early gate.
- Targeted static checks: Pi-only route policy 12/12; RUN380 access boundary 16/16; RUN342 auth scope regression 6/6; RUN375 SDK loader 21/21; field intake 7/7; scoped evidence engine 26/26; research integrity 12/12; Field Research foundation 23/23; Pi Sandbox classification 9/9.
- Full Node 24.15.x dependency-backed typecheck/lint/build, live Pi Browser tests, API bypass tests against Preview, and migration-backed field evidence persistence remain outstanding. The workspace runtime is Node 22.16.0 and dependencies are not installed. No GitHub push, Vercel deployment, database mutation, migration application, Mainnet operation, or financial change occurred. Production remains NOT APPROVED.

## RUN373 Pi authentication frame-routing correction

RUN376 corrects Preview readiness policy and splits payment-configuration readiness from platform readiness. The parent RUN375 archive already includes the exact-host Pi Sandbox classification and early SDK loader work. The uploaded RUN375 archive remains the authoritative parent; RUN376 is a source-only derivative.

## RUN364 full-project audit and gate repair

RUN364 continues from the RUN363 archive. It fixes historical-document path resolution in the shared documentation helper and affected phase/release checkers, updates stale Run 277 Pi-auth assertions to test the current bounded bridge and authorization timeouts, and disables the registration bonus by default in `.env.example`. `npm run verify:static` passes (exit 0); the consolidated static verifier is 63/63. The 396 prebuild checks are enumerated only and have not been executed because the available runtime is Node 22.16.0 rather than the required Node 24.15.0.

The supplied npm audit artifact is preserved at `docs/security/RUN364-NPM-AUDIT-2026-11-18.json`. It reports 22 vulnerable package entries (2 critical, 13 high, 6 moderate, 1 low). Next.js 15.5.26 and DOMPurify 3.4.15 are critical. The Pi backend/Stellar/Axios/TOML chain has no fix reported in that artifact, and the offered Zod fix is a major-version change. No package or lockfile changes were made because a fresh registry audit and dependency-backed compatibility tests are unavailable in this workspace. The dependency gate remains fail-closed. Full details are in `docs/RUN364-FULL-PROJECT-AUDIT-AND-GATE-REPAIR-2026-11-19.md`.

No GitHub push, Vercel deployment, Supabase mutation, migration application, Mainnet action, payment operation or financial-state change occurred. Production remains **NOT APPROVED**.

## RUN336 GitHub / Vercel build cleanup

RUN336 addresses the seven TypeScript diagnostics in the supplied GitHub Actions log: the election tally route now explicitly normalizes optional counts to `number | null | "invalid"` and required counts to `number`; the app shell imports the canonical public-route helper; the field assignment UI type includes `assignmentId`; Communities imports `useRef`, uses the resolved `joined` membership state and gives `reduce` a numeric accumulator. Research Studio callback dependencies remain complete with no lint suppression. RUN336 cleanup checks pass 12/12, the updated RUN335 tally gate passes 8/8, and the complete `npm run verify:static` suite passes. Full dependency-backed typecheck/lint/Next build remains pending on supported Node 24.15.x. Remaining upstream dependency warnings and why they were not force-overridden are documented in `docs/RUN336-GITHUB-VERCEL-BUILD-CLEANUP-2026-11-18.md`.

## Latest implementation

Pioneer-scoped research and durable-session-scoped field evidence uploads are implemented in source, with signed upload URLs, project/report-bound tokens, streamed SHA-256, file signature checks, quarantine-first storage records, central admin review UI, scanner queue/HMAC callback contract, active geographic-unit validation and append-only SHA-256 evidence event chains. The scanner provider itself is not deployed or configured, so uploads remain quarantined until an external trusted scanner is connected and reports clean. Do not claim malware scanning is operational.

## Held migrations

`20261116182000_gh_research_intelligence_platform_foundation.sql`, `20261116190000_gh_media_evidence_engine.sql` and `20261117010001_gh_evidence_scoped_upload_chain_of_custody.sql` are REVIEW_REQUIRED and unapplied. They must be applied in dependency order after target migration-history reconciliation and schema validation. Testnet's earlier Field Reports and Research Studio migrations remain applied. Mainnet untouched.

## Legacy documents

Superseded historical upgrade worklogs are retained under `docs/archive/upgrade-worklogs/` rather than duplicated in the active `docs/` root. These legacy documents preserve historical context only; they do not supersede this source-of-truth file, the current executable source, or the current release evidence.

## Release controls

No push or deployment was performed. Full Node 24.15.0 install/typecheck/lint/build, browser/device acceptance, scanner integration, live Testnet upload/hash/chain verification and populated geographic hierarchy checks remain required. Production NOT APPROVED.

## 2026-11-17 Vercel/GitHub remediation candidate

A local, unpushed remediation candidate restores the existing default-branch `.github/workflows/ci.yml` into the `testnet` source tree because the deployed `testnet` commit lacked that file and the release-integrity prebuild crashed with `ENOENT`. It also adds a root `.gitignore`, makes Run #300 report missing CI metadata cleanly, fixes its case-insensitive `NOT APPROVED` assertions, and synchronizes current release pointers in the audit/acceptance fixtures. The authoritative source archive and SHA-256 above remain the baseline from which this candidate is derived; this addendum does not claim the candidate has been pushed or deployed.

Dependency upgrades are not yet applied: the registry was unreachable, so no refreshed npm audit JSON or reproducible package-lock update could be generated. The deprecated Stellar packages remain transitive through `pi-backend@0.1.3` and must not be overridden without Pi Testnet compatibility evidence. Full Node 24.15.0 install, all 358 prebuild checks, typecheck, lint, build and browser/device acceptance remain required. Production remains NOT APPROVED.

## 2026-11-17 follow-up audit of GitHub `testnet` commit `cecff93`

The newer Vercel log is for `cecff93b5995a10665bb893fa6f70826a6830533`. It confirms the missing CI workflow on `testnet` and four failed Run #300 assertions. The commit diff additionally contains unresolved merge-conflict markers across 14 files covering the migration manifest, verified manifest, source-of-truth/release docs, service registry, social RPC transport, migration inventory generator and Testnet apply-order guide. The archive-derived candidate is clean; those branch files must be reconciled from this authoritative 0.338.92 source rather than manually choosing conflict sides.

The candidate restores the trusted read-only CI workflow and `.gitignore`, hardens Run #300, repairs malformed shared Supabase RPC/REST call sites and dynamic RPC-name interpolation, and extends source checks for conflict markers and malformed dynamic RPC names. It preserves identity immutability, server-owned media authorization, conversation membership authorization, ledger authority and non-spending membership recovery. Candidate verification: Run #300 22/22; Run #301 20/20; Run #250 10/10; RLS source coverage 174 tables; SECURITY DEFINER source audit 481 declarations; migration manifest 229/229; project truth 11/11; Vercel hygiene 17/17; Phase 4 identity snapshot 8/8 plus 13 runtime assertions; dependency-lock integrity PASS.

GitHub's connected write operation returned HTTP 403 (`Resource not accessible by integration`), so the candidate remains local and the live `testnet` branch and Vercel deployment have not been changed. Reauthorize the GitHub integration with repository Contents/commit write access or have a repository maintainer apply the candidate. Supabase inspection was read-only: Testnet has 16 live RLS/no-policy INFO findings and 120 unused-index INFO findings requiring workload-aware review; Mainnet has a SECURITY DEFINER execute-ACL warning for `public.rls_auto_enable()`. No database change was made. Mainnet and all three held migrations remain untouched.

The Vercel npm report's 22 vulnerabilities and package deprecation warnings remain unresolved pending a registry-connected Node 24 clean install, current `npm audit --json`, tested dependency/lockfile updates and full 358-check/typecheck/lint/Next build. The project remains NOT APPROVED for production.


## 2026-11-17 Quiet Premium transformation candidate — 0.338.93

The local source-only derivative is now `gh-connect@0.338.93`, based on the authoritative 0.338.92 archive above. It adds the Quiet Premium design layer for the eleven approved product priorities and a responsive, six-workstream Coming Soon development brief for all 30 unreleased ecosystem services. Registry state remains 42 services / 12 Active / 30 Coming Soon; every Coming Soon destination remains `none`. This is not a feature activation or release-readiness claim. See `docs/QUIET-PREMIUM-TRANSFORMATION-0.338.93.md`. Node 24.15.0 dependency-backed checks and browser/device visual acceptance remain outstanding. GitHub write authorization is still blocked: the connected identity exposes no accessible App installations or repositories and the earlier write returned HTTP 403. No push, deployment, Supabase mutation, migration application or Mainnet change occurred. Production remains NOT APPROVED.

The 0.338.93 candidate adds one independently registered UI regression gate to the prebuild manifest; the current manifest now enumerates 359 checks (dry-run enumeration only, not execution). The new gate verifies the eleven priority-module roots, shared theme-aware premium tokens, focus/reduced-motion support, the 30-track Coming Soon disclosure, and the unchanged 12 Active / 30 Coming Soon registry.


## 2026-11-17 Run #312 notification/RPC follow-up candidate

The working source-only candidate `GREENHAVEN-0.338.93-RUN312-NOTIFICATION-RPC-FIX-2026-11-17.zip` continues from the 0.338.93 repair candidate without changing the parent archive authority or claiming a new production release. It resolves the additional notification RPC and duplicate-import diagnostics surfaced by the next CI typecheck pass. Push and unified notification RPC payloads now have explicit runtime record validation; unified inbox list/create JSON responses are distinguished from the integer scalar return values of unread-count and mark-read SQL functions. Notification-center and push-subscription responses are consistently `private, no-store`; malformed request JSON is rejected before property access. The Pi listing readiness module now imports the canonical REST client once.

Candidate verification: Run #312 repair contract 28/28; Phase 6 performance/accessibility 23/23; scoped evidence engine 25/25; Vercel build hygiene 17/17; changed TypeScript syntax transpilation passed; focused strict TypeScript compilation of the changed notification routes/RPC modules passed using temporary dependency declarations. The full `npm run verify:static` attempt exceeded the available execution window and is not claimed as complete. Full project typecheck/lint/build remain blocked in this workspace by Node 22.16.0 (project requires Node 24.15.0) and incomplete dependencies. No GitHub push, Vercel deployment, Supabase mutation, migration application, Mainnet action, financial mutation, or Coming Soon service activation occurred. All 30 Coming Soon services remain disabled; production remains NOT APPROVED.


## 0.338.96 audit remediation derivative

This local candidate is derived from the exact user-designated 0.338.93 RUN312 archive. It fixes the confirmed Vercel release-hygiene blocker by adding a credential-free `.env.example`, aligns the essential-controls navigation contract to the six visible shell destinations, and updates stale navigation regression assertions. The package, lockfile and app release identity are synchronized at 0.338.96. The source archive above remains the user's baseline; this derivative is a working candidate, not a live deployment.

Live Supabase inspection: Testnet has 16 RLS-enabled/no-policy informational findings. Catalog inspection shows five tables restricted to postgres only, three with postgres/service_role grants, and eight with anon/authenticated/service_role grants but no policies (therefore no row access through RLS). Do not add broad policies to silence the advisor; review grants and intended server-only routes table-by-table. The 120 unused-index findings are not deletion instructions. Mainnet's `rls_auto_enable()` is an enabled `ddl_command_end` event-trigger function with pinned `search_path=pg_catalog`; its ACL includes anon/authenticated, but the function's event-trigger binding means this is not evidence of an ordinary PostgREST RPC. Mainnet remains untouched pending separate platform review.

Vercel's latest build log confirms the current 0.338.93 preview failure is prebuild check 23/359: `.env.example` is missing. A subsequent deployment log failed a stale feed-navigation contract; the check is being aligned to the actual six-item shell. The marketplace check passes against this archive. Full Node 24.15.0 install, complete 359-check run, typecheck, lint, Next build, browser/device acceptance and scanner-provider integration remain unverified. GitHub push and Vercel deployment have not been performed. Production remains NOT APPROVED.


## 0.338.96 Run 313 working derivative

The current local candidate advances the 0.338.94 remediation derivative with explicit in-memory transaction executors/compensators, reverse-order rollback, failed-compensation visibility, bounded completed-history lookup, and an atomic single-update local backup restore. The coordinator is expressly not a database transaction and is not used for financial authority. A dedicated source gate (8 assertions) and runtime simulation (12 assertions) are registered in prebuild/static verification. The user-designated 0.338.93 RUN312 archive remains the source-of-truth archive; this is a local working candidate only. No push, deployment, Supabase mutation, migration application, Mainnet or payment operation occurred.


## 0.338.96 Run 314 working derivative
Run 314 adds 30 screen-level UI and interaction refinements across active modules, with responsive rails and grids, improved message composer and bubble sizing, wallet/payment sheet safe areas, and profile/feed/rewards content hierarchy. These are presentation-level changes only. The user-designated 0.338.93 archive remains the authoritative starting archive; this derivative is not pushed or deployed.

## Held migrations

`20261116182000_gh_research_intelligence_platform_foundation.sql`, `20261116190000_gh_media_evidence_engine.sql` and `20261117010001_gh_evidence_scoped_upload_chain_of_custody.sql` are REVIEW_REQUIRED and unapplied. They must be applied in dependency order after target migration-history reconciliation and schema validation. Testnet's earlier Field Reports and Research Studio migrations remain applied. Mainnet untouched.

## Legacy documents

Superseded historical upgrade worklogs are retained under `docs/archive/upgrade-worklogs/` rather than duplicated in the active `docs/` root. These legacy documents preserve historical context only; they do not supersede this source-of-truth file, the current executable source, or the current release evidence.

## Release controls

No push or deployment was performed. Full Node 24.15.0 install/typecheck/lint/build, browser/device acceptance, scanner integration, live Testnet upload/hash/chain verification and populated geographic hierarchy checks remain required. Production NOT APPROVED.

## 2026-11-17 Vercel/GitHub remediation candidate

A local, unpushed remediation candidate restores the existing default-branch `.github/workflows/ci.yml` into the `testnet` source tree because the deployed `testnet` commit lacked that file and the release-integrity prebuild crashed with `ENOENT`. It also adds a root `.gitignore`, makes Run #300 report missing CI metadata cleanly, fixes its case-insensitive `NOT APPROVED` assertions, and synchronizes current release pointers in the audit/acceptance fixtures. The authoritative source archive and SHA-256 above remain the baseline from which this candidate is derived; this addendum does not claim the candidate has been pushed or deployed.

Dependency upgrades are not yet applied: the registry was unreachable, so no refreshed npm audit JSON or reproducible package-lock update could be generated. The deprecated Stellar packages remain transitive through `pi-backend@0.1.3` and must not be overridden without Pi Testnet compatibility evidence. Full Node 24.15.0 install, all 358 prebuild checks, typecheck, lint, build and browser/device acceptance remain required. Production remains NOT APPROVED.

## 2026-11-17 follow-up audit of GitHub `testnet` commit `cecff93`

The newer Vercel log is for `cecff93b5995a10665bb893fa6f70826a6830533`. It confirms the missing CI workflow on `testnet` and four failed Run #300 assertions. The commit diff additionally contains unresolved merge-conflict markers across 14 files covering the migration manifest, verified manifest, source-of-truth/release docs, service registry, social RPC transport, migration inventory generator and Testnet apply-order guide. The archive-derived candidate is clean; those branch files must be reconciled from this authoritative 0.338.92 source rather than manually choosing conflict sides.

The candidate restores the trusted read-only CI workflow and `.gitignore`, hardens Run #300, repairs malformed shared Supabase RPC/REST call sites and dynamic RPC-name interpolation, and extends source checks for conflict markers and malformed dynamic RPC names. It preserves identity immutability, server-owned media authorization, conversation membership authorization, ledger authority and non-spending membership recovery. Candidate verification: Run #300 22/22; Run #301 20/20; Run #250 10/10; RLS source coverage 174 tables; SECURITY DEFINER source audit 481 declarations; migration manifest 229/229; project truth 11/11; Vercel hygiene 17/17; Phase 4 identity snapshot 8/8 plus 13 runtime assertions; dependency-lock integrity PASS.

GitHub's connected write operation returned HTTP 403 (`Resource not accessible by integration`), so the candidate remains local and the live `testnet` branch and Vercel deployment have not been changed. Reauthorize the GitHub integration with repository Contents/commit write access or have a repository maintainer apply the candidate. Supabase inspection was read-only: Testnet has 16 live RLS/no-policy INFO findings and 120 unused-index INFO findings requiring workload-aware review; Mainnet has a SECURITY DEFINER execute-ACL warning for `public.rls_auto_enable()`. No database change was made. Mainnet and all three held migrations remain untouched.

The Vercel npm report's 22 vulnerabilities and package deprecation warnings remain unresolved pending a registry-connected Node 24 clean install, current `npm audit --json`, tested dependency/lockfile updates and full 358-check/typecheck/lint/Next build. The project remains NOT APPROVED for production.


## 2026-11-17 Quiet Premium transformation candidate — 0.338.93

The local source-only derivative is now `gh-connect@0.338.93`, based on the authoritative 0.338.92 archive above. It adds the Quiet Premium design layer for the eleven approved product priorities and a responsive, six-workstream Coming Soon development brief for all 30 unreleased ecosystem services. Registry state remains 42 services / 12 Active / 30 Coming Soon; every Coming Soon destination remains `none`. This is not a feature activation or release-readiness claim. See `docs/QUIET-PREMIUM-TRANSFORMATION-0.338.93.md`. Node 24.15.0 dependency-backed checks and browser/device visual acceptance remain outstanding. GitHub write authorization is still blocked: the connected identity exposes no accessible App installations or repositories and the earlier write returned HTTP 403. No push, deployment, Supabase mutation, migration application or Mainnet change occurred. Production remains NOT APPROVED.

The 0.338.93 candidate adds one independently registered UI regression gate to the prebuild manifest; the current manifest now enumerates 359 checks (dry-run enumeration only, not execution). The new gate verifies the eleven priority-module roots, shared theme-aware premium tokens, focus/reduced-motion support, the 30-track Coming Soon disclosure, and the unchanged 12 Active / 30 Coming Soon registry.


## 2026-11-17 Run #312 notification/RPC follow-up candidate

The working source-only candidate `GREENHAVEN-0.338.93-RUN312-NOTIFICATION-RPC-FIX-2026-11-17.zip` continues from the 0.338.93 repair candidate without changing the parent archive authority or claiming a new production release. It resolves the additional notification RPC and duplicate-import diagnostics surfaced by the next CI typecheck pass. Push and unified notification RPC payloads now have explicit runtime record validation; unified inbox list/create JSON responses are distinguished from the integer scalar return values of unread-count and mark-read SQL functions. Notification-center and push-subscription responses are consistently `private, no-store`; malformed request JSON is rejected before property access. The Pi listing readiness module now imports the canonical REST client once.

Candidate verification: Run #312 repair contract 28/28; Phase 6 performance/accessibility 23/23; scoped evidence engine 25/25; Vercel build hygiene 17/17; changed TypeScript syntax transpilation passed; focused strict TypeScript compilation of the changed notification routes/RPC modules passed using temporary dependency declarations. The full `npm run verify:static` attempt exceeded the available execution window and is not claimed as complete. Full project typecheck/lint/build remain blocked in this workspace by Node 22.16.0 (project requires Node 24.15.0) and incomplete dependencies. No GitHub push, Vercel deployment, Supabase mutation, migration application, Mainnet action, financial mutation, or Coming Soon service activation occurred. All 30 Coming Soon services remain disabled; production remains NOT APPROVED.


## 0.338.96 audit remediation derivative

This local candidate is derived from the exact user-designated 0.338.93 RUN312 archive. It fixes the confirmed Vercel release-hygiene blocker by adding a credential-free `.env.example`, aligns the essential-controls navigation contract to the six visible shell destinations, and updates stale navigation regression assertions. The package, lockfile and app release identity are synchronized at 0.338.96. The source archive above remains the user's baseline; this derivative is a working candidate, not a live deployment.

Live Supabase inspection: Testnet has 16 RLS-enabled/no-policy informational findings. Catalog inspection shows five tables restricted to postgres only, three with postgres/service_role grants, and eight with anon/authenticated/service_role grants but no policies (therefore no row access through RLS). Do not add broad policies to silence the advisor; review grants and intended server-only routes table-by-table. The 120 unused-index findings are not deletion instructions. Mainnet's `rls_auto_enable()` is an enabled `ddl_command_end` event-trigger function with pinned `search_path=pg_catalog`; its ACL includes anon/authenticated, but the function's event-trigger binding means this is not evidence of an ordinary PostgREST RPC. Mainnet remains untouched pending separate platform review.

Vercel's latest build log confirms the current 0.338.93 preview failure is prebuild check 23/359: `.env.example` is missing. A subsequent deployment log failed a stale feed-navigation contract; the check is being aligned to the actual six-item shell. The marketplace check passes against this archive. Full Node 24.15.0 install, complete 359-check run, typecheck, lint, Next build, browser/device acceptance and scanner-provider integration remain unverified. GitHub push and Vercel deployment have not been performed. Production remains NOT APPROVED.


## 0.338.96 Run 313 working derivative

The current local candidate advances the 0.338.94 remediation derivative with explicit in-memory transaction executors/compensators, reverse-order rollback, failed-compensation visibility, bounded completed-history lookup, and an atomic single-update local backup restore. The coordinator is expressly not a database transaction and is not used for financial authority. A dedicated source gate (8 assertions) and runtime simulation (12 assertions) are registered in prebuild/static verification. The user-designated 0.338.93 RUN312 archive remains the source-of-truth archive; this is a local working candidate only. No push, deployment, Supabase mutation, migration application, Mainnet or payment operation occurred.


## 0.338.96 Run 314 working derivative
Run 314 adds 30 screen-level UI and interaction refinements across active modules, with responsive rails and grids, improved message composer and bubble sizing, wallet/payment sheet safe areas, and profile/feed/rewards content hierarchy. These are presentation-level changes only. The user-designated 0.338.93 archive remains the authoritative starting archive; this derivative is not pushed or deployed.

## 0.338.98 Run 315 working derivative
This candidate fixes the supplied CI lint/build errors and warning, corrects the stale product-design gate, and ensures a diagnostics artifact exists after early build failure. The user's uploaded 0.338.93 archive remains the authoritative baseline; 0.338.98 is a local working derivative only. No GitHub push, Vercel deployment, Supabase mutation, or financial operation was performed.


## 0.338.99 Run 317 working derivative

This local candidate addresses the verified 0.338.98 Next.js production compile error: shared ID generation now uses Web Crypto without Node-only imports, shared consumers use static imports, and push endpoint hashing is isolated to a server-only module. GitHub Actions confirmed the preceding 0.338.98 typecheck and ESLint passed; the production build failed on `node:crypto`. Run 317 adds a 9/9 boundary gate and preserves the 19/19 push contract tests. The user-designated 0.338.93 archive remains the authoritative baseline; 0.338.99 is a local derivative only. No push, deploy, Supabase mutation or financial operation was performed.


## 2026-11-17 Run 324 local working derivative

The local source candidate derived from RUN323 adds timed examination lifecycle/review, owner-scoped election contest/candidate/agent administration, and Phase 3 marketplace/poll/post-engagement hardening. It is source-only. The Research Intelligence migration remains REVIEW_REQUIRED and unapplied; atomic election tally submission, populated geography data, scanner-provider execution, Node 24.15 dependency-backed build checks and Testnet/device acceptance remain blockers. Do not treat this derivative as deployed or production-approved. See `docs/RUN324-PHASE2-EXAM-ELECTION-AND-PHASE3-QUALITY-2026-11-17.md`.

## 2026-11-18 RUN326 local continuation

The current working derivative continues from the user-designated RUN324 archive through RUN325 and RUN326. RUN326 adds an authenticated election tally submission API and a REVIEW_REQUIRED SQL proposal for a single-transaction tally/candidate-vote/audit write with scoped-agent authorization, geography/candidate validation, arithmetic checks and exact-payload idempotency. The proposal depends on the still-held Research Intelligence foundation migration; it is not a generated migration and has not been applied. It also hardens Messaging idempotency so reusing a client message ID with changed body/reply/shared-post/attachment payload returns HTTP 409 rather than silently returning an unrelated prior message. See `docs/RUN326-PHASE2-TALLY-PHASE3-MESSAGING-START.md`. Focused source gates pass; full Node 24.15 dependency-backed typecheck/lint/build, disposable PostgreSQL rehearsal, held migration review, geography import, scanner integration and Pi Browser/device acceptance remain outstanding. No GitHub push, Vercel deployment, Supabase mutation, migration application or Mainnet operation occurred. Production remains NOT APPROVED.


## 2026-11-18 RUN327 Phase 3 source closeout and Phase 4 discovery

RUN327 continues from the verified RUN326 working archive. The RUN326 Phase 3 Feed, Community, Messaging and Marketplace source gates were rerun; messaging idempotency 10/10, Feed quality 25/25, durable Feed preferences 13/13, Community poll accessibility 10/10, engagement aggregate hardening 6/6, Community completion 21/21, Community pagination 12/12, Marketplace search 6/6, Marketplace saved addresses 29/29, creator/media hardening 13/13, upload cancellation/identity 12/12, draft recovery 11/11, durable media URL 7/7 and upload recovery 9/9 passed. Their runtime helper tests passed, and the repository `npm run verify:static` command completed successfully. This closes the RUN326 Phase 3 source work only; held migrations, live multi-account/Testnet, Node 24 dependency-backed typecheck/lint/build and browser/device acceptance remain outstanding.

Phase 4 discovery identified multiple incompatible Phase 4 tracks in the archive: Identity & Authentication, social Community posts/discussion consistency, Messenger community communications/governance, and older financial/cart/profile tracks. RUN327 records the scope conflict and does not silently select one. Phase 4 implementation awaits the user's selection of the intended track.

No GitHub push, Vercel deployment, Supabase mutation, migration application, Mainnet action, payment, payout, reward or account mutation occurred. Production remains NOT APPROVED. See `docs/RUN327-PHASE3-SOURCE-CLOSEOUT-PHASE4-DISCOVERY-2026-11-18.md`.

## 2026-11-18 RUN328 Phase 4 coordinated source implementation

The RUN328 local derivative is packaged as `GREENHAVEN-0.338.99-RUN328-PHASE4-IDENTITY-COMMUNITY-MESSAGING.zip` and continues from the RUN327 Phase 3 closeout archive. It implements all three Phase 4 tracks selected by the user: Identity & Authentication, Community discussion/participation, and Messenger community communications. It corrects step-up rotation/proof ordering, adds a held atomic session-cap RPC (runtime opt-in remains disabled), adds a privacy-aware paginated Community member directory, adds group creation from an existing DM with recipient-accepted invitations, and adds consent-based sharing of only the authenticated actor's public GreenHaven profile. Existing canonical Community post rendering, announcements, events, resources and moderation remain in place and are regression-checked. See `docs/RUN328-PHASE4-IDENTITY-COMMUNITY-MESSAGING-2026-11-18.md`.

The new SQL remains proposal-only at `supabase/proposals/20261118_phase4_identity_group_contact.sql`; it is not a migration and has not been applied. New group/contact/member-directory routes fail closed until their RPC/table dependencies are approved and live. The atomic session-cap runtime flag must remain unset until the SQL is rehearsed and applied. Source verification `npm run verify:static` passed. Node 24.15.x dependency-backed install/typecheck/lint/build, disposable PostgreSQL rehearsal, migration history reconciliation and two-account Testnet/device acceptance remain outstanding. No GitHub push, Vercel deployment, Supabase mutation, migration application or Mainnet operation occurred. Production remains NOT APPROVED.


## 2026-11-18 RUN329 Phase 4 source closeout and Phase 5 five-run / 50-upgrade programme

RUN329 records source-level closeout of the three Phase 4 tracks selected by the user: Identity & Authentication, Community discussion/participation, and Messenger community communications. Focused identity integration 17/17, identity/authentication 16/16, coordinated Phase 4 32/32, community boundaries 9/9, community completion 21/21, pagination 12/12, Messenger community 14/14, Messenger Phase 1 closeout 19/19, held-migration readiness 6/6 source checks, messaging idempotency 10/10 and atomic tally source contract 20/20 passed in the local workspace. This is source closeout only; supported Node 24.15 dependency-backed build, PostgreSQL rehearsal, migration history/catalog reconciliation and authenticated device/Testnet acceptance remain outstanding.

Phase 5 starts with the coordinated RUN327–RUN331 50-upgrade programme in `docs/RUN329-PHASE4-CLOSEOUT-PHASE5-50-UPGRADE-PROGRAM-2026-11-18.md`. It defines exactly ten major upgrades each for migration dependency/rehearsal, election tally and independent reconciliation, authoritative geography/scanner integration, Feed/Community/Messaging, and Marketplace/checkout. The register is scope and acceptance criteria, not a claim that all 50 upgrades have shipped. No SQL migration, Testnet/Mainnet mutation, payment/payout/reward/account mutation, GitHub push or Vercel deployment occurred. Mainnet remains untouched; production NOT APPROVED.

## 2026-11-18 RUN330 Phase 5 gate reconciliation and Phase 6 kickoff

RUN330 reviews the RUN327–RUN331 Phase 5 programme against the actual repository source and regression checks. Marketplace seller/SKU/fulfilment/order foundations, Feed/Community/Messaging foundations and scoped evidence/scanner callback contracts have substantial source coverage. However, Phase 5 is **not closed for release**: RUN327 still requires a disposable PostgreSQL 17 rehearsal and exact target catalog/history reconciliation; RUN328 still requires the agent tally-entry UI and independent multi-agent reconciliation; RUN329 still requires a provenance-backed, licensed authoritative geography dataset and a configured trusted malware-scanner provider/worker. No election result is certified, and unknown/failed/timed-out evidence remains quarantined. Mainnet remains disabled and untouched.

RUN330 starts the established Phase 6 Profile and Identity performance track. Relationship-index keys now reject control characters and identifiers longer than 256 characters; each derived relationship set is capped at 50,000 unique IDs; batch hydration defaults to 500 IDs and has an absolute 5,000-ID cap. Runtime tests cover malformed keys, caller limits, hard caps, per-domain cache isolation and immutable-source invalidation. The block-first relationship policy and exclusion of wallet/ledger/payment data remain unchanged. The dedicated Phase 6 source gate passes 23/23 and runtime contract passes 23 assertions. Full `npm run verify:static` passed after RUN330 (exit 0); `npm run prebuild:checks` remains blocked because TypeScript cannot be resolved without `node_modules`. This is a local source-only derivative; Node 24.15.x typecheck/lint/build and browser/device acceptance remain required. No GitHub push, Vercel deployment, Supabase mutation, migration application, payment/payout/reward/account mutation or Mainnet action occurred. Production remains NOT APPROVED.

## 2026-11-18 RUN331 Phase 1–6 gap register and Phase 7 Communities kickoff

RUN331 continues from the RUN330 local working derivative. It reconciles Phase 1–6 source implementation against the actual remaining release evidence and does not mark externally blocked work complete. It starts the Phase 7 Communities transformation with account-scoped local membership/board cache keys, bounded cache parsing, legacy unscoped-key retirement, `IdentityService` account-switch subscription, previous-account write fencing, selected-community/snapshot clearing and identity-fenced directory reloads. Local cache data remains non-authoritative; server/domain authorization remains the sole source for membership, roles and content access. New tests pass 13/13 runtime assertions and 12/12 source checks and are registered in `verify:static` and `prebuild:checks`. Phase 1–6 release gaps remain explicitly documented: real Pi Browser acceptance; PostgreSQL rehearsal and migration history reconciliation; approved geography and scanner infrastructure; field-agent tally UI and independent reconciliation; Testnet checkout; multi-account/device acceptance; and supported Node 24.15.x build. No SQL, database, financial, account, GitHub, Vercel or Mainnet mutation occurred. Production remains NOT APPROVED. See `docs/RUN331-PHASE1-6-GAP-REGISTER-PHASE7-COMMUNITIES-KICKOFF-2026-11-18.md`.

## 2026-11-18 RUN332 advanced audit and remediation

RUN332 continues from the user-provided RUN331 archive as a source-only remediation candidate. It records a read-only Testnet database audit, GitHub branch/CI audit, Vercel project/deployment audit and the source fixes described in `docs/RUN332-ADVANCED-PROJECT-AUDIT-AND-REMEDIATION-2026-11-18.md`. Testnet currently reports 45 migration-history entries while the source tree contains 229 canonical migration files; exact-version and filename gaps remain unresolved. Twenty applied history entries have no matching source filename in the archive or connected GitHub `testnet` branch. Do not reconstruct or replay these by assumption. The three research/media/scoped-evidence migrations remain held and unapplied pending disposable PostgreSQL 17 rehearsal and catalog/history reconciliation. RUN332 also adds a review-only proposal to revoke redundant authenticated SELECT grants from eight server-only tables; it is not a canonical migration and was not applied.

RUN332 corrects Pi environment-mode precedence, keeps all payment execution flags fail-closed, adds a review-only proposal for redundant authenticated SELECT grants on eight server-only tables, pins GitHub Actions to immutable SHAs, disables persisted checkout credentials and enforces npm audit exit status. Vercel accepted Testnet Preview-only updates for `PI_NETWORK`, `PI_ENV`, `PI_A2U_TESTNET_ONLY` and fail-closed payout/withdrawal/transfer/bonus flags; sensitive values are masked on read-back and a fresh Preview deployment is required to verify runtime behavior. No migration was applied, no GitHub push or Vercel deployment occurred, and Mainnet remains untouched. Production remains NOT APPROVED.


## RUN333 — Existing Testnet security reconciliation (2026-11-18)

RUN333 uses the existing GH Connect Supabase Testnet project directly; no extra branch was created. Applied migration `20261118033839_revoke_client_select_on_server_only_tables` to revoke redundant SELECT grants from `PUBLIC`, `anon`, and `authenticated` on eight RLS-enabled server-only tables. Postflight verified that all eight retain RLS, all client SELECT privileges are absent, and `service_role` retains SELECT/INSERT/UPDATE/DELETE. The Testnet migration history now contains 46 entries. The canonical migration inventory, source manifest, verified manifest, checklist and Testnet apply-order guide have been regenerated to 230 files. The current 46-row history map is `docs/RUN333-MIGRATION-HISTORY-RECONCILIATION.csv`; the RUN332 45-row map remains a historical snapshot. Twenty applied history entries still have no matching source filename and eleven same-slug/different-version candidates remain unverified. The three research/media/scoped-evidence migrations remain held. RUN333 also implements the missing authenticated field-agent tally desk and owner/reviewer-only read-only independent tally comparison. Submissions remain gated until the atomic RPC and provenance-backed polling-unit data are installed. The held evidence-chain trigger source now serializes per-evidence sequence allocation with a transaction advisory lock so concurrent updates cannot fork the chain; this correction is source-only. `npm run verify:static` passes on Node 22.16.0; Node 24.15.x install/typecheck/lint/build remain unverified. No GitHub push, Vercel deployment or Mainnet operation occurred.


## 2026-11-18 RUN337 GitHub audit / environment-template repair candidate

RUN337 restores the safe root `.env.example` from the parent of GitHub testnet commit `9ceeaeafcf0f4b08c2b390fadfed0111a70ce285`, fixing the prebuild `ENOENT` failure. It corrects the dependency-security workflow so npm audit exit code 1 for valid findings is diagnosed as vulnerabilities, not a generic command failure; the workflow continues to fail closed. RUN337 source gate: 7/7; RUN332 audit source gate: 16/16. The exact GitHub audit artifact records 29 vulnerabilities (2 critical, 21 high, 5 moderate, 1 low). Package manifests and lockfile remain unchanged because npm registry access is unavailable in the local build environment and the official Pi SDK transitive chain needs vendor-compatible remediation. No lock hashes were fabricated, no audit bypass or unsafe SDK override was applied. This candidate is not pushed or deployed. Production remains NOT APPROVED.


## 2026-11-18 RUN352 comprehensive financial and migration integrity audit

RUN352 continues from the user-designated RUN344 full project plus the RUN351 patch merged by relative path. It adds a missing marketplace search normalizer, repairs stale runtime/source assertions, removes repeated verification command invocations, and records a read-only audit of Testnet/Mainnet schema state, Pi wallet authorization, GHC balances, membership, marketplace fees, payout ledger reconciliation and all 230 canonical migration records. All 366 `verify:static` commands pass when run in bounded chunks; 44 focused financial/marketplace gates pass. The new 8-case marketplace search runtime suite, 59-case RUN283 active-module suite and 46-case Phase 28 wallet consent suite pass.

The live Testnet payout ledger reconciles across 18 payout requests (five paid, thirteen released) with zero request-level ledger-pattern mismatches; GHC balances are non-negative. One fulfilled marketplace listing-fee intent references a listing no longer present, and three historical fulfilled membership intents are not directly linked to the current entitlement row although those users retain current entitlements; both require historical/provider evidence and were not repaired automatically. Testnet migration history has 46 rows: 15 exact source matches, 11 same-slug/different-version candidates unverified and 20 history rows without source files. The Mainnet project currently has zero public base tables and zero migration-history rows. No Testnet or Mainnet database changes, migrations, financial operations, deployments or credential changes were performed.

RUN352 adds a non-canonical review proposal to revoke redundant client SELECT grants from six server-only financial tables; it was not applied. TypeScript/ESLint/production build and Pi Browser/device acceptance remain blocked by absent `node_modules` and unavailable Node 24.15.x in this runtime. This archive is a source-only audit/remediation candidate, **not production approved**. See `docs/RUN352-COMPREHENSIVE-INTEGRITY-AUDIT-2026-11-18.md` and the three RUN352 CSV inventories. Mainnet remains untouched and requires separate explicit approval.


## RUN339 optional ecosystem provider isolation

RUN339 reuses the existing canonical ecosystem service-release helper to gate optional provider execution. Provider callbacks (and therefore dynamic imports/initialization) are not invoked for Coming Soon, unavailable or unknown services. Provider exceptions are contained as typed failures. App startup prefetch is limited to released core surfaces; the ecosystem roadmap screen loads only on explicit navigation. Realtime bootstrap/recovery is best-effort so HTTP-backed core services remain usable if realtime is unavailable. Dedicated Events and Charity release checks remain intact. See `docs/RUN339-OPTIONAL-ECOSYSTEM-PROVIDER-ISOLATION-2026-11-19.md`.

## RUN377 identity/session ACL correction

The RUN377 audit found that the currently connected Supabase project has both identity/session tables and matching base migration-history records, but `service_role` lacks the SELECT/INSERT/UPDATE privileges used by the application. RUN377 adds a least-privilege additive grant migration and corrects health output so environment configuration is not represented as verified table durability. The Vercel Preview-to-Supabase project-ref mapping is not yet confirmed; the migration is source-only and must not be applied until that target is verified. See `docs/UPGRADE-WORKLOG-0.338.104.md`.
