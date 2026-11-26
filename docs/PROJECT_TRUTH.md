# Current project truth — 0.338.161 RUN449 Environment Template Restoration candidate (2026-11-26)

**Current package candidate:** `gh-connect@0.338.161`.
**Current source version:** `0.338.161` (working candidate)
**Package identity:** `gh-connect@0.338.161`
**User-designated accepted baseline:** `GREENHAVEN-0.338.139-RUN426-PHASE0-SOCIAL-EXPERIENCE-FOUNDATION-2026-11-26.zip`.

RUN449 restores the missing root `.env.example` required by existing prebuild and release contracts. RUN444 check 5/469 had failed with `ENOENT`; the restored template keeps privileged credentials blank and generic payout/A2U flags disabled, while preserving the separate Testnet Preview activation profile. The focused RUN449 contract passes 6/6. The supplied dependency audit reports 22 findings (1 critical, 13 high, 6 moderate, 2 low); no blind upgrades or audit bypass were applied, and the complete npm audit artifact is required for remediation.

RUN448 removes the duplicate Discovery `addToast` type property and imports Node `createHash` in the marketplace operational RPC module. The focused RUN448 regression contract passes. A full TypeScript check and Next.js production build on Node.js 24.15.0 remain required; the supplied Vercel log documents RUN447 failures, not a successful RUN448 build. No remote push, deployment, database mutation or provider transaction occurred.

RUN447 source change: community directory roles are normalized to the canonical GroupCard role union, with legacy alias and safe fallback handling; creator ownership remains first priority. The RUN447 focused contract is registered in static and prebuild checks. The supplied Vercel log reports this error on RUN446; RUN447 has not yet been built by Vercel.

## RUN447 Community role type repair

**Current source version:** `0.338.159` (working candidate)
**Current package candidate:** `gh-connect@0.338.159`. `components/ghc/communities-screen.tsx` now passes a `CommunityRoleLabel`-typed value to `GroupCard` through `normalizeCommunityRole`; the focused RUN447 regression gate is included. The unused Discover memo dependency was removed. No remote push, deployment, database mutation or provider transaction occurred.

> **Current authority notice (26 November 2026):** The last user-designated accepted source archive remains `GREENHAVEN-0.338.139-RUN426-PHASE0-SOCIAL-EXPERIENCE-FOUNDATION-2026-11-26.zip`; 0.338.159 is a working candidate, not yet accepted, pushed or deployed.

RUN446 source verification: marketplace spend signature contract passes; RUN445 earnings snapshot contract passes; RUN444 Testnet payment/withdrawal contract passes. The supplied RUN445 Vercel log confirms 466 prebuild checks and bundle compilation, but TypeScript validation then failed. RUN446 corrects that type mismatch; a fresh Node 24.15.x Vercel build is required to confirm it.

## RUN446 Marketplace spend signature repair

The in-memory marketplace GHC payment fallback now calls `executeAuthoritativeSpend` with its declared two-argument signature. The transport-error option remains on the durable RPC path only. The focused RUN446 check is registered in static and prebuild checks. No remote push, deployment, database mutation or provider transaction occurred.

> **Current authority notice (26 November 2026):** The working package candidate is `gh-connect@0.338.158` (RUN446 Marketplace Spend Signature Repair), documented in `docs/CURRENT-SOURCE-OF-TRUTH-2026-11-26.md`. The last user-designated accepted source archive remains `GREENHAVEN-0.338.139-RUN426-PHASE0-SOCIAL-EXPERIENCE-FOUNDATION-2026-11-26.zip`; 0.338.158 is not accepted, pushed or deployed.

# Current project truth — 0.338.158 RUN446 Marketplace Spend Signature Repair candidate (2026-11-26)

**Current package candidate:** `gh-connect@0.338.158`.
**Current source version:** `0.338.158` (working candidate)
**Package identity:** `gh-connect@0.338.158`
**User-designated parent baseline:** `GREENHAVEN-0.338.139-RUN426-PHASE0-SOCIAL-EXPERIENCE-FOUNDATION-2026-11-26.zip`.

RUN445 source verification: focused earnings-dashboard contract 13/13; `npm run verify:static` exits 0; prebuild dry-run discovers 466 checks. The actual Next.js build remains unverified in the local Node 22.16.0 workspace.

## RUN445 build repair

The unified earnings dashboard React state is now named `serverSnap`; `snap` is retained as the render-only alias for the live-or-last-known display snapshot. The fee quote callback dependency is aligned with the state name. This resolves the duplicate lexical declaration identified by the RUN444 Vercel build log. A fresh production build under Node 24.15.x remains required for acceptance.

> **Current authority notice (26 November 2026):** This document is historical context. The working package candidate is `gh-connect@0.338.157` (RUN445 Earnings Dashboard Build Repair), documented in `docs/CURRENT-SOURCE-OF-TRUTH-2026-11-26.md`. The last user-designated accepted source archive remains `GREENHAVEN-0.338.139-RUN426-PHASE0-SOCIAL-EXPERIENCE-FOUNDATION-2026-11-26.zip`; 0.338.157 is not yet accepted, pushed or deployed.


# Current project truth — 0.338.157 RUN445 Earnings Dashboard Build Repair candidate (2026-11-26)

**Current package candidate:** `gh-connect@0.338.157`, derived from the user-designated 0.338.139 RUN426 archive through RUN427–RUN441. It is not yet accepted, pushed or deployed. RUN443 applied the four migrations previously held by RUN442; combined with RUN442, seven operations are installed on Testnet. RUN388/RUN396/RUN405/RUN429 RPCs and ACLs were postflight-verified; RUN429 includes the corrected Community-before-Invitation lock order. No backfill or financial operation was invoked. Disposable PostgreSQL concurrency rehearsal, exact migration-history reconciliation, Node 24.15.0 build and two-account Testnet acceptance remain outstanding. Full static verification passed 63/63 gates with 5,369 PASS lines and zero failures; prebuild dry-run discovered 464 checks. Node 24.15.x dependency-backed typecheck/lint/build and end-to-end Testnet acceptance remain outstanding.

**Current source version:** `0.338.157` (working candidate)
**Coordinated programme:** `docs/PHASE-7-8-HARMONIZED-PROGRAM-2026-11-24.md`  
**Package identity:** `gh-connect@0.338.157`  
**User-designated parent baseline:** `GREENHAVEN-0.338.139-RUN426-PHASE0-SOCIAL-EXPERIENCE-FOUNDATION-2026-11-26.zip`; current candidate is its controlled derivative.  
**Delivery report:** `RUN414-RELEASE-METADATA-SYNCHRONIZATION-REPORT.md`  
**Marketplace audit:** `docs/RUN411-MARKETPLACE-COMMERCE-RELIABILITY-AUDIT-2026-11-25.md`


## RUN444 Testnet payment/withdrawal state (26 November 2026)

A dedicated activation profile is provided at `config/testnet-payments.env.example`. It enables Pi A2U, Pi earnings payout requests/execution, GHC purchases with Pi, GHC tips, referral settlement, Testnet rewards/curation, GHC→Pi withdrawals, marketplace GHC seller payouts and Paystack test transfers for non-Production Testnet. Paystack Testnet requires `sk_test_`; live keys are rejected. Generic `.env.example` remains fail-closed. No provider credentials or transaction were supplied/performed; operational acceptance remains pending. See `docs/RUN444-TESTNET-PAYMENT-WITHDRAWAL-RAILS-2026-11-26.md`.

## RUN443 current Testnet migration state (26 November 2026)

Seven migration operations across RUN442/RUN443 are installed on Testnet `jhlsjnmfpakvibuuoygx`. RUN443 applied RUN388, RUN396, RUN405 and RUN429 with the RUN441 lock-order correction. Generated versions: `20261126161545`, `20261126161553`, `20261126161603`, `20261126161651`. The database reports 247 history rows, 246 distinct names and a duplicate RUN406 history name. Seven source timestamp mappings are generated-version drift; other historical drift remains. No backfill or financial operation was invoked. Disposable PostgreSQL concurrency rehearsal and exact history reconciliation remain outstanding. See `docs/RUN443-TESTNET-MIGRATION-APPLICATION-REPORT-2026-11-26.md`.

- Correct workspace census after Run 397: one verified Pi identity (`EUCLIDABO`), one profile, one GHC account, nine session rows for that same account, no PI earnings entries before the campaign, and four GHC transaction rows. After applying the campaign, one 100 PI `available` entry exists; withdrawal quote eligibility is true, but provider execution remains disabled.
- Run 397 raises the cumulative registration reward target to 100 PI on Testnet only. Existing valid registration-bonus ledger credits are counted toward the target; the new campaign uses a distinct idempotency key and account lock. The app requires both `GHC_REGISTRATION_BONUS_ENABLED=1`, `NEXT_PUBLIC_PI_SANDBOX=true`, `PI_NETWORK=testnet`, and a non-Production Vercel environment, and fails closed until the new campaign RPC is present.
- A service-role-only bounded backfill was run with the explicit Testnet confirmation. It processed one account and credited one available 100 PI ledger entry. It did not import the five other identities from the previously inspected database because they are not present as verified identities in this correct project.
- Referral rewards are 5% of a verified qualifying membership charge, capped at 25 GHC per referral and 50 qualifying rewards per inviter per rolling 30 days. A new service-role summary RPC avoids old REST pagination undercounts. Settlement remains operator-gated.
- Historical RUN406/RUN397 snapshot: the registration campaign was recorded as `20261125065113`; RUN406 server-read grants were recorded twice under adjacent versions. At that earlier snapshot the inventory contained 245 SQL migrations and Testnet had 239 history rows. RUN443 supersedes those counts with 246 source files and 247 Testnet history rows (246 distinct names); see the RUN443 migration report.
- Run 397 source checks pass 16/16; Run 396 wallet/payout/membership checks pass 17/17; membership release checks pass 16/16 and 18/18; rewards history passes 21/21; cross-feature wallet/rewards/membership closeout passes 43/43. Full Node 24.15.x dependency-backed typecheck, lint, production build and browser/device acceptance remain unverified.
- Node 22.16.0 is available in this workspace; the project requires Node `^24.15.0`. Dependencies are not installed. The registration migration and one 100 PI ledger credit were applied on Testnet. No Pi A2U transfer, payout execution, GHC balance mutation, Mainnet change, Git push or Vercel deployment occurred. Production remains **NOT APPROVED**.

Run 407 grants SELECT, INSERT and UPDATE on `gh_earnings_ledger_entries` to `service_role` only. Postflight confirmed DELETE=false, anon/authenticated SELECT=false and RLS=true. The source migration is `20261125090000_run407_service_role_earnings_ledger_privileges.sql`; because the live migration history must be reconciled, it remains REVIEW_REQUIRED for any target and must not be blindly replayed.\n\n## Historical RUN390 project-truth snapshot (0.338.111)

The detailed RUN390 and earlier records below are retained as historical implementation evidence. Their original version/archive references are not the current release pointer.

## RUN390 — server-side read permission repair

RUN390 identifies the live Testnet causes of the three supplied Preview errors: service_role lacked SELECT on `ghc_membership_entitlements`, `gh_user_mutes`, `gh_marketplace_listings` and `gh_marketplace_variants`. A least-privilege migration grants SELECT only to service_role while preserving RLS and client-role denial. It remains REVIEW_REQUIRED and unapplied.

## RUN389 — team collaboration and granular permissions

RUN389 adds a server capability matrix and a team workspace. Editor and reviewer permissions are intentionally distinct; field agents have no Research Studio response capabilities. Invitations, role changes, suspension, reactivation and revocation are owner-controlled, while invitees can accept only their own pending invitations. The UI is not the security boundary: server route checks are authoritative.

## RUN388 — scheduled studies and atomic quotas

Optional study windows and quotas are persisted in the existing settings JSON. The final submit path uses the held `gh_research_submit_response` RPC to serialize quota checks against the project row, preserve idempotent retries and reject closed/not-yet-open studies. Migration `20261124150000_run388_research_atomic_schedule_quota.sql` is REVIEW_REQUIRED and unapplied.

## RUN387 — descriptive analytics

Owner-only analytics summarize review status, numeric answers, categorical answers and dates. Free-text responses are excluded; categories with fewer than five responses are suppressed. A 20,000-row bound and explicit coverage label prevent a partial sample being represented as complete.

## RUN386 — response pagination and export

The inbox now uses stable timestamp+ID keyset cursors, bounded pages, load-more and full cursor traversal for CSV export. Browser export is bounded to 20,000 responses and fails closed on page retrieval errors.

## RUN385 — Research & Field Research workspace

The initial RUN385 dashboard, search/filter, share-link security messaging, Field Desk session-verification state and private-page indexing controls remain included.

## RUN384 — full project audit and targeted hardening (2026-11-24)

The live GitHub/Vercel Testnet branch remains at commit `06122b28a5d96ef301e1eb10d344af51c3005702`; RUN384 is local only. Full `npm run verify:static` passes 63/63; the RUN384 focused source contract passes 13/13, unlock runtime/feature-off checks 9/9, and repository secret-pattern scan reports zero potential secret values across 2,788 text files. The connected Supabase project is healthy and its 234 applied migration versions are reconciled against the source inventory after restoring two missing historical call migration files from the live catalog (explicitly marked reconstructed, not byte-identical). RUN384 adds a held least-privilege identity/privacy grant migration, a held 17-FK-index migration, held method-scoped service_role grants for 13 additional server REST tables, a root SECURITY.md, and a repository secret-pattern gate, a Mainnet/unknown-network fence for Testnet exercise unlocks, fail-closed `.env.example` feature defaults, and direct-media bucket provisioning failure handling. Supabase reports no RLS-disabled public tables, no anon/authenticated direct table grants, and no public/anon/authenticated execution of the inspected SECURITY DEFINER functions. Thirty-seven no-policy tables remain server-only and intentionally denied to clients. The 3 PI welcome bonus remains disabled by the existing Preview flag; no GHC/PI credit was issued. Full details and limits are in `docs/RUN384-FULL-PROJECT-AUDIT-2026-11-24.md`.

## RUN383 — identity and feed-privacy service-role grants (2026-11-24)

Preview runtime logs on the existing `testnet` deployment showed three durable profile upsert failures (HTTP 403). RUN383 adds a held, additive migration with least-privilege `service_role` grants for the server-owned profile, achievement, progress-read and feed mute-list tables while preserving RLS and denying all table privileges to `PUBLIC`, `anon`, and `authenticated`. The supplied feed privacy error may share the missing mute-table grant cause, but that exact runtime error was not found in the recent logs. The live Supabase catalog confirms all four tables lacked service_role table privileges while RLS and client-deny state remained intact; the new migration is `REVIEW_REQUIRED` and has not been applied. Daily-claim and registration-bonus migrations/RPC ACLs are already present in Testnet history. Vercel Preview currently has `GHC_REGISTRATION_BONUS_ENABLED=false`, so the 3 PI welcome bonus is intentionally gated off. RUN383 regression check: 9/9; full static suite passed.

## RUN382 — Supabase REST JSON content-type correction

Pi SDK sign-in and access-token return now succeed in App CDN frame context with no CSP violations. The subsequent server verification failed while inserting the canonical Pi identity because `supabaseRest()` sent a JSON string body as `text/plain;charset=UTF-8`. RUN382 adds a shared JSON-aware header policy, preserving explicit content types, non-string bodies, server-only service-role authorization, no-store behavior, and existing identity immutability. `npm run verify:static` passes 63/63; the focused header test passes 5/5. The change is local only because GitHub write operations returned HTTP 403. Preview retest is pending.

## RUN381 — Pi authentication CSP correction

The 2026-11-24 Testnet Pi Browser diagnostics recorded enforced `connect-src` blocks for `socialchain.app` immediately before authentication rejection. The parent CSP allowed this origin in frame directives but not `connect-src`. RUN381 adds only `https://socialchain.app` to `connect-src`, with no wildcard. The updated regression gate checks both conditions. Live Testnet Preview authentication retest remains outstanding.

## RUN380 — Pi-only Research and Field access control

- Full `npm run verify:static` completed with exit code 0; the consolidated static suite passed 63/63. This remains network/database independent and does not certify the Node 24.15.x dependency-backed build or live Pi Browser acceptance.

- The anonymous page allowlist no longer includes `/r/:slug`, `/field`, or `/portal-setup`. Only legal/help documents and the Pi domain-validation resource remain public. `/field` remains available as a Pioneer-authenticated field reporting workspace.
- Middleware redirects service-page requests without a `gh_session` cookie to the root sign-in entry. This is not treated as authentication: affected Field/Research API handlers require the durable account-security context, which verifies the server session and checks production session-store durability.
- Shared field access-code unlock is retired (HTTP 410). Field reporting, survey retrieval, evidence uploads/completion, session status, and admin evidence/report operations now require a durable Pioneer session. Field evidence scope is derived from canonical Pioneer identity and verified GH session ID.
- Research share pages and all published-form, evidence, and examination APIs require the durable Pioneer session. Read-only service metadata/fee-quote APIs used by Marketplace, Communities, Economy, Pi capabilities, push configuration, social reward/quality, and portal setup/compliance endpoints also require the durable session. Research response submission keys and examination respondent hashes are server-derived from the authenticated Pioneer. New projects disable anonymous participation.
- Pi SDK authentication and server-side Pi Platform verification remain the identity authority. Browser user-agent/referrer checks are not claimed as cryptographic browser attestation.
- Targeted checks: route policy 12/12; RUN380 boundary 17/17; RUN342 auth scope 6/6; RUN375 loader 21/21; field intake 7/7; scoped evidence 26/26; research integrity 12/12; field foundation 23/23; Sandbox classification 9/9.
- Node 24.15.x dependency-backed typecheck/lint/build, live Pi Browser and Preview API bypass tests, and database-backed field evidence verification remain outstanding. Node 22.16.0 is available and dependencies are not installed. No push, deployment, migration, database write, Mainnet action or financial operation occurred.

## RUN377 identity/session privilege audit

The connected Supabase project inspected in this run has `gh_pi_identities` and `gh_sessions`, and records both base migration versions. Its live ACLs deny `service_role` the SELECT/INSERT/UPDATE rights used by the application. RUN377 adds a least-privilege source migration and corrects `/api/health` so Supabase credential presence is reported as `configured_unverified`, not verified table durability. The Preview deployment-to-project reference is unconfirmed; no live database migration was applied.

## Historical RUN364 and earlier records



## RUN364 full-project audit and gate repair (2026-11-19)

- RUN364 is a local source-only derivative of the RUN363 archive; it is not pushed or deployed. Production remains **NOT APPROVED**.
- Fixed the Phase 8 documentation-path failure and related historical-document lookup failures across the registered phase/release checks. The shared resolver now supports canonical docs, historical implementation records, archived worklogs and phase notes.
- Updated stale Run 277 Pi-auth assertions to match the current bounded SDK bridge wait and 25-second official authorization timeout.
- Changed `.env.example` registration bonus default to disabled (`GHC_REGISTRATION_BONUS_ENABLED=0`); explicit enablement and Testnet sandbox checks remain required.
- `npm run verify:static` completed successfully (exit 0); consolidated static verifier 63/63. The 396 prebuild checks were enumerated only, not executed, because this workspace is Node 22.16.0 while the project requires Node `^24.15.0`. Typecheck, lint and Next.js build remain unverified.
- The supplied npm audit artifact confirms 22 unresolved findings (2 critical, 13 high, 6 moderate, 1 low). Next.js 15.5.26 and DOMPurify 3.4.15 are the critical affected packages. The Pi backend/Stellar/Axios/TOML chain has no fix reported by that artifact; Zod's offered fix is a major update. No dependency or lockfile changes were made, no audit gate was bypassed, and no unsafe Pi SDK override was introduced. See `docs/RUN364-FULL-PROJECT-AUDIT-AND-GATE-REPAIR-2026-11-19.md`.
- No GitHub push, Vercel deployment, Supabase mutation, migration application, Mainnet action, payment operation or financial-state change occurred.

**Current source version:** `0.338.99`  
**Package identity:** `gh-connect@0.338.99`  
**Latest user-provided source archive:** `GREENHAVEN-0.338.99-RUN331-PHASE1-6-GAP-REGISTER-PHASE7-COMMUNITIES.zip`  
**RUN331 archive SHA-256:** `851ac3a540b76572b1325c6e06a35de069649f37db5cb11d24aca124d239fafa`  
**Current local working derivative:** RUN337 GitHub audit/environment-template repair on top of RUN336; not pushed or deployed.  
**Current status:** **NOT APPROVED** for production.

## RUN337 GitHub Actions audit / packaging repair

- Restored the exact safe `.env.example` from the parent of failing GitHub commit `9ceeaeafcf0f4b08c2b390fadfed0111a70ce285`; the failing branch and RUN336 archive both lacked the file even though repository ignore rules explicitly allow it.
- Corrected the dependency audit workflow diagnostic. npm audit's normal exit 1 for vulnerability findings is now reported distinctly from registry/report errors; the gate still fails closed on any findings.
- Added RUN337 regression gate (7/7) and updated RUN332 audit source check (16/16).
- The actual uploaded GitHub audit artifact reports 29 findings: 2 critical, 21 high, 5 moderate, 1 low. Dependency remediation is NOT complete. The exact Pi SDK dependency chain and the registry-unavailable constraint are documented in `docs/RUN337-GITHUB-AUDIT-AND-ENV-TEMPLATE-REPAIR-2026-11-18.md`.
- The package manifest and lockfile were not hand-edited. No npm audit gate was bypassed, no unsafe Pi SDK override was introduced, and no clean audit/build claim is made.
- No GitHub push or Vercel deployment occurred. Production remains NOT APPROVED.

## Source authority

RUN331 is the latest user-provided 0.338.99 archive. RUN332 and RUN333 are local source derivatives of that archive; neither has been pushed or deployed. RUN333 uses the existing GH Connect Supabase Testnet project directly and applied one narrow grant-revocation migration, documented in `docs/RUN333-TESTNET-SECURITY-RECONCILIATION-2026-11-18.md`. Testnet now records 46 migration entries; the canonical source inventory contains 230 files. Twenty applied history entries still lack matching source filenames and eleven same-slug/different-version records remain unverified. The three research/media/scoped-evidence migrations remain held. Preview/testnet-only Vercel environment update requests were accepted; sensitive values are masked and runtime verification awaits a fresh preview build. Preserve the existing GreenHaven and Pi identity, wallet and financial boundaries, and migration history.

## RUN336 GitHub / Vercel build cleanup

- Corrected the tally route count parsing with explicit `number | null | "invalid"` optional-count normalization and explicit numeric required-count assignments. All count bounds and consistency checks remain.
- Fixed the missing public-route policy import, the field-agent `assignmentId` model, the Communities `useRef` import, the invalid `selected.isJoined` property access, and the unknown `reduce` accumulator.
- Research Studio loader callback dependencies are present; no hook lint suppression was added.
- Updated the dependent Phase 4 assertion to verify the computed `joined` membership decision.
- RUN336 build cleanup checks pass 12/12; RUN335 tally checks 8/8; election UI 13/13; reconciliation runtime 6/6; Phase 4 identity/community/messaging 32/32. Full `npm run verify:static` passes.
- The source errors in the supplied seven-error typecheck log are addressed. Full dependency-backed typecheck/lint/Next build remain unverified because this packaging environment lacks `node_modules` and uses Node 22.16.0 rather than required `^24.15.0`.
- Remaining npm warnings are documented in `docs/RUN336-GITHUB-VERCEL-BUILD-CLEANUP-2026-11-18.md`: deprecated `isomorphic-dompurify@3.20.0`, Stellar packages transitively required by the exact official `pi-backend@0.1.3` pin, and ESLint 9 EOL while Next 15's ESLint 10 compatibility remains unverified. No unsafe overrides or hand-edited lock metadata were introduced.
- These are source-only changes. No GitHub push, Vercel deployment or database mutation occurred. Production remains NOT APPROVED.

## RUN333 current Testnet state (retained by RUN336)

- Existing Testnet project only; no additional Supabase branch created.
- Applied `20261118033839_revoke_client_select_on_server_only_tables` and verified that the eight target tables retain RLS, client SELECT privileges are absent, and service-role SELECT/INSERT/UPDATE/DELETE remain.
- Live migration history: 46 entries. Canonical source migration inventory: 230 files. Current mapping: `docs/RUN333-MIGRATION-HISTORY-RECONCILIATION.csv`.
- Historical source gaps remain: 20 applied history entries have no matching filename; 11 same-slug/different-version candidates are unverified. Do not reconstruct or bulk-replay.
- RUN333 adds the authenticated field-agent tally desk, own-assignment acceptance, and owner/reviewer-only read-only independent comparison. Tally submission remains gated on the held atomic RPC and a provenance-backed polling-unit dataset; no result is certified.
- Testnet currently has `gh_research_projects`, but not the dependent research membership, geography, election contest/candidate/assignment/tally tables or atomic tally RPC. The new field-agent desk fails closed until those dependencies are safely installed.
- Three research/media/scoped-evidence migrations remain held. No scanner/geography acceptance is inferred.
- RUN336 retains all RUN333 Testnet state. Its project-wide static verification passes, but supported Node 24.15.x dependency-backed typecheck/lint/build remain outstanding.
- Mainnet untouched; no GitHub push or Vercel deployment. Production remains NOT APPROVED.

## 0.338.92 implementation

- Authenticated Pioneers can upload images, video, audio and PDF files to a published project using short-lived signed Storage URLs and a one-hour project/submission-key scoped upload session. Up to five files per submission key are accepted. Files attach to the response only when that exact submission key is submitted.
- Authenticated Pioneers can upload evidence only to a durable report created by the same verified GreenHaven session scope. Field-session codes do not become GreenHaven accounts or admin credentials.
- The central administrator Evidence Review Centre lists Research and Field Desk evidence and records review decisions. Admin access is checked against `GHC_FIELD_ADMIN_USER_ID`.
- Upload completion streams the object through SHA-256 hashing and checks basic file magic bytes against the claimed MIME type. This is MIME-spoofing resistance, not malware detection.
- All new evidence enters `scan_status=pending` and `verification_status=quarantined`. Content delivery is denied until a trusted scanner reports a matching SHA-256 digest as clean. Scanner queue and HMAC-authenticated callback endpoints are implemented; a separate trusted scanning worker/provider and `GHC_EVIDENCE_SCANNER_SECRET` configuration are still required. No file is claimed to have been malware-scanned in this source-only increment.
- Database triggers append evidence creation, scan and review changes to a restricted append-only SHA-256 hash chain. Hashes are evidence-integrity indicators, not a guarantee of physical authenticity or legal certification.
- Optional geographic-unit references are checked against active `gh_research_geo_units` records. For election-observation projects, supplied geographic IDs must resolve to `level_key='polling_unit'`. No national Nigeria geography dataset, international data package, GPS capture, EXIF verification or polling-unit roster is imported in this increment.

## Migration status

The new evidence workflow depends on three additive migrations, all source-only and REVIEW_REQUIRED at packaging time:

1. `20261116182000_gh_research_intelligence_platform_foundation.sql` — project roles, research evidence base, geographic hierarchy, election/exam/challenge/poll foundations and audit events. Its challenge participation function was reordered after the referenced tables to fix a forward type dependency.
2. `20261116190000_gh_media_evidence_engine.sql` — media asset references and Field Desk evidence relation.
3. `20261117010001_gh_evidence_scoped_upload_chain_of_custody.sql` — scoped upload sessions, scan/quarantine fields, field-session report binding, geographic metadata and append-only hash-chain events.

The existing Testnet migrations `20261116170409_gh_field_reports_public_intake` and `20261116171144_gh_research_studio_public_forms` remain applied and recorded. The three migrations above remain unapplied and held for review. RUN333 applied only the separate server-only SELECT-grant revocation migration on Testnet. Mainnet was not changed.

## Verification limits

The supported runtime requirement is Node.js `^24.15.0`. Full TypeScript, lint, and Next.js production build verification must run on that supported runtime with the locked dependencies installed. The current source-only workspace does not establish those dependency-backed checks.

The source migration inventory is not evidence of applied migrations; it records repository SQL files and classifications only. RUN333 postflight verified the new Testnet grant migration and its privilege effects; all other source files still require exact target-history/catalog reconciliation before application.

The source includes static contract checks and pure file-signature tests. Full Node 24.15.0 dependency-backed TypeScript, lint, production build and browser/device end-to-end acceptance remain outstanding because the available workspace is Node 22.16.0 and dependencies are not installed. Scanner provider execution, signed upload against Testnet, evidence chain postflight and geographic lookup against populated data are not runtime-verified.

No GitHub push, Vercel deployment, Mainnet migration or financial state change was performed. Source presence does not establish database application, runtime success, scanner execution or test acceptance. Production remains NOT APPROVED.


## 0.338.96 full-project audit remediation candidate

- Added a safe `.env.example` containing blank server-only credential placeholders, explicit public/server-only sections, and disabled Pi payout execution defaults. It contains no real credentials.
- Reconciled the essential-controls navigation list with the actual six visible shell destinations: Home, Discover, Messages, Communities, Cart and Profile. The wallet remains an overlay.
- Updated stale regression assertions that still expected the older five-item navigation contract.
- Updated package, lockfile and in-app release identity to 0.338.96.
- No database schema, migration, RLS policy, payment, payout, wallet balance, Pi execution, production environment or deployment was changed.

Focused source checks: release hygiene 17/17; Run #312 notification repair 28/28; Run #304 filter/search release 30/30; scoped evidence engine 25/25; media evidence engine 22/22; Phase 10 release closure 17/17. Full Node 24.15.0 dependency-backed verification remains outstanding because the available environment is Node 22.16.0 and npm installation did not complete.

## Canonical visible navigation

The current visible shell navigation contains six destinations, in order: Home · Discover · Messages · Communities · Cart · Profile. Matches remains available as a secondary/deep-link tab; Wallet remains an overlay.


## 0.338.96 transaction and interaction hardening (Run 313)

- Replaced the misleading in-memory transaction operation flags with explicit ordered operation executors and reverse-order compensation handlers. Failed operations now trigger compensations for completed operations; incomplete compensation is recorded as `failed`. Completed transaction records are retrievable from bounded history.
- Explicitly documented that this in-memory coordinator is not a database transaction and is never authoritative for wallets, payments, rewards, orders, or entitlements. Financial state remains server/RPC/ledger-owned.
- Backup restore now validates the complete snapshot arrays before applying one consolidated state update, preventing subscribers from observing partial profile/settings/posts/conversations restoration.
- Added Run 313 source and runtime regression gates to prebuild and static verification.
- No live database, wallet, Pi, A2U, Mainnet, GitHub, or Vercel operations were performed. Full Node 24.15.0 build and device acceptance remain required; production remains NOT APPROVED.


## 0.338.96 Run 314 — 30 screen-level experience upgrades
- Added a 30-rule adaptive UI layer for Wallet, payment recovery and sheets, Messages, Communities, Marketplace, Feed, Profile, Rewards, Membership and Settings.
- Added explicit component hooks for the responsive community directory grid, marketplace listing grid, conversation rows/bubbles/composer, wallet scroll region, profile timeline and rewards balance panel.
- No payment, wallet, ledger, reward, membership entitlement, order lifecycle, Pi consent, A2U, migration, or Mainnet authority changed.
- Full Node 24.15.0 dependency-backed checks and visual browser/device acceptance remain required.
## 0.338.92 implementation

- Authenticated Pioneers can upload images, video, audio and PDF files to a published project using short-lived signed Storage URLs and a one-hour project/submission-key scoped upload session. Up to five files per submission key are accepted. Files attach to the response only when that exact submission key is submitted.
- Authenticated Pioneers can upload evidence only to a durable report created by the same verified GreenHaven session scope. Field-session codes do not become GreenHaven accounts or admin credentials.
- The central administrator Evidence Review Centre lists Research and Field Desk evidence and records review decisions. Admin access is checked against `GHC_FIELD_ADMIN_USER_ID`.
- Upload completion streams the object through SHA-256 hashing and checks basic file magic bytes against the claimed MIME type. This is MIME-spoofing resistance, not malware detection.
- All new evidence enters `scan_status=pending` and `verification_status=quarantined`. Content delivery is denied until a trusted scanner reports a matching SHA-256 digest as clean. Scanner queue and HMAC-authenticated callback endpoints are implemented; a separate trusted scanning worker/provider and `GHC_EVIDENCE_SCANNER_SECRET` configuration are still required. No file is claimed to have been malware-scanned in this source-only increment.
- Database triggers append evidence creation, scan and review changes to a restricted append-only SHA-256 hash chain. Hashes are evidence-integrity indicators, not a guarantee of physical authenticity or legal certification.
- Optional geographic-unit references are checked against active `gh_research_geo_units` records. For election-observation projects, supplied geographic IDs must resolve to `level_key='polling_unit'`. No national Nigeria geography dataset, international data package, GPS capture, EXIF verification or polling-unit roster is imported in this increment.

## Migration status

The new evidence workflow depends on three additive migrations, all source-only and REVIEW_REQUIRED at packaging time:

1. `20261116182000_gh_research_intelligence_platform_foundation.sql` — project roles, research evidence base, geographic hierarchy, election/exam/challenge/poll foundations and audit events. Its challenge participation function was reordered after the referenced tables to fix a forward type dependency.
2. `20261116190000_gh_media_evidence_engine.sql` — media asset references and Field Desk evidence relation.
3. `20261117010001_gh_evidence_scoped_upload_chain_of_custody.sql` — scoped upload sessions, scan/quarantine fields, field-session report binding, geographic metadata and append-only hash-chain events.

The existing Testnet migrations `20261116170409_gh_field_reports_public_intake` and `20261116171144_gh_research_studio_public_forms` remain applied and recorded. The three migrations above were not applied by this source upgrade. Mainnet was not changed.

## Verification limits

The supported runtime requirement is Node.js `^24.15.0`. Full TypeScript, lint, and Next.js production build verification must run on that supported runtime with the locked dependencies installed. The current source-only workspace does not establish those dependency-backed checks.

The source migration inventory is not evidence of applied migrations; it records repository SQL files and classifications only. RUN333 postflight verified the new Testnet grant migration and its privilege effects; all other source files still require exact target-history/catalog reconciliation before application.

The source includes static contract checks and pure file-signature tests. Full Node 24.15.0 dependency-backed TypeScript, lint, production build and browser/device end-to-end acceptance remain outstanding because the available workspace is Node 22.16.0 and dependencies are not installed. Scanner provider execution, signed upload against Testnet, evidence chain postflight and geographic lookup against populated data are not runtime-verified.

No GitHub push, Vercel deployment, Mainnet migration or financial state change was performed. Source presence does not establish database application, runtime success, scanner execution or test acceptance. Production remains NOT APPROVED.


## 0.338.96 full-project audit remediation candidate

- Added a safe `.env.example` containing blank server-only credential placeholders, explicit public/server-only sections, and disabled Pi payout execution defaults. It contains no real credentials.
- Reconciled the essential-controls navigation list with the actual six visible shell destinations: Home, Discover, Messages, Communities, Cart and Profile. The wallet remains an overlay.
- Updated stale regression assertions that still expected the older five-item navigation contract.
- Updated package, lockfile and in-app release identity to 0.338.96.
- No database schema, migration, RLS policy, payment, payout, wallet balance, Pi execution, production environment or deployment was changed.

Focused source checks: release hygiene 17/17; Run #312 notification repair 28/28; Run #304 filter/search release 30/30; scoped evidence engine 25/25; media evidence engine 22/22; Phase 10 release closure 17/17. Full Node 24.15.0 dependency-backed verification remains outstanding because the available environment is Node 22.16.0 and npm installation did not complete.

## Canonical visible navigation

The current visible shell navigation contains six destinations, in order: Home · Discover · Messages · Communities · Cart · Profile. Matches remains available as a secondary/deep-link tab; Wallet remains an overlay.


## 0.338.96 transaction and interaction hardening (Run 313)

- Replaced the misleading in-memory transaction operation flags with explicit ordered operation executors and reverse-order compensation handlers. Failed operations now trigger compensations for completed operations; incomplete compensation is recorded as `failed`. Completed transaction records are retrievable from bounded history.
- Explicitly documented that this in-memory coordinator is not a database transaction and is never authoritative for wallets, payments, rewards, orders, or entitlements. Financial state remains server/RPC/ledger-owned.
- Backup restore now validates the complete snapshot arrays before applying one consolidated state update, preventing subscribers from observing partial profile/settings/posts/conversations restoration.
- Added Run 313 source and runtime regression gates to prebuild and static verification.
- No live database, wallet, Pi, A2U, Mainnet, GitHub, or Vercel operations were performed. Full Node 24.15.0 build and device acceptance remain required; production remains NOT APPROVED.


## 0.338.96 Run 314 — 30 screen-level experience upgrades
- Added a 30-rule adaptive UI layer for Wallet, payment recovery and sheets, Messages, Communities, Marketplace, Feed, Profile, Rewards, Membership and Settings.
- Added explicit component hooks for the responsive community directory grid, marketplace listing grid, conversation rows/bubbles/composer, wallet scroll region, profile timeline and rewards balance panel.
- No payment, wallet, ledger, reward, membership entitlement, order lifecycle, Pi consent, A2U, migration, or Mainnet authority changed.
- Full Node 24.15.0 dependency-backed checks and visual browser/device acceptance remain required.

## 0.338.98 Run 315 — CI lint and build remediation

- Replaced internal raw anchors in the public research form with Next.js `Link` components for `/` and `/privacy`.
- Removed inline suppressions for `@typescript-eslint/no-require-imports`, a rule absent from the configured ESLint plugin set; retained the existing cryptographic Web Crypto-first implementation and fail-closed fallback behavior.
- Added `state.posts` to the `deleteComment` callback dependency list because the callback reads the current posts snapshot when reconciling comment counts.
- Restored the shared `gh-section-title` class on the reusable section heading, satisfying the actual design-system contract.
- Updated the Pass 14 product-design gate to validate dynamic package/app release synchronization rather than a stale 0.236.0 label.
- Added a CI failure-context artifact file before upload so early prebuild failures do not cause a missing-artifact warning.
- Added a nine-assertion Run 315 source regression gate to prelint, prebuild checks and static verification.
- No Supabase changes, migration application, GitHub push, Vercel deployment, wallet/payment changes, payout enablement or Mainnet operations.
- Local workspace has no installed dependencies and runs Node 22.16.0; the required Node 24.15.0 dependency-backed lint and production build remain unverified. Production remains NOT APPROVED.


## 0.338.99 Run 324 — Phase 2 / Phase 3 local source derivative (2026-11-17)

The current local working candidate adds timed examination delivery/review and election-observation administration to the RUN323 derivative. Exam answer keys are excluded from public projections; respondents use a server-HMAC-hashed session key; deadlines, attempt limits, autosave, server scoring and owner-controlled result release are implemented in source. Election contest/candidate/agent administration is owner-scoped. The Phase 3 increment hardens marketplace search/quantity validation, poll vote presentation and feed/profile/community post engagement counts.

Verification: `npm run verify:static` passed. New exam/election source contract 22/22; membership API 13/13; field intake 7/7; research integrity 12/12; marketplace search 6/6; community poll accessibility 10/10; post count contract 6/6 and runtime 9/9; active-module runtime 58/58; changed TS/TSX syntax transpilation 10/10. The full prebuild/typecheck/lint/build remain unverified because this workspace has Node 22.16.0 and lacks installed project dependencies (including `typescript`); the repository requires Node 24.15.0.

Phase 2 is not operationally closed: the Research Intelligence migration remains REVIEW_REQUIRED and unapplied; election tally submission still requires an atomic database RPC and reconciliation tests; authoritative geographic datasets and the trusted malware-scanning provider remain external prerequisites; real Testnet/device acceptance is outstanding. Phase 3 remains an ongoing product-quality programme, not a completed global-launch certification. No GitHub push, Vercel deployment, Supabase migration, live DB mutation, wallet/payment operation or Mainnet action occurred. Production remains NOT APPROVED. See `docs/RUN324-PHASE2-EXAM-ELECTION-AND-PHASE3-QUALITY-2026-11-17.md`.


## RUN338 Pi authentication diagnosis (2026-11-18)

- Added token-free, stable diagnostic codes around Pi SDK script/init, `Pi.authenticate`, Pi Platform `/v2/me` verification, durable Pi identity mapping, GH session creation, and the `/api/auth/session` cookie round-trip.
- The client now confirms the HttpOnly session cookie returns, the session is durable, and the verified GH identity matches before treating the authenticated server session as ready.
- Supabase Testnet read-only review found 6 Pi identity rows and 264 GH session rows (176 revoked, 72 expired-unrevoked, 16 active); no blank identity keys, malformed SHA-256 hash lengths, or invalid expiry ordering. Both tables have RLS and deny-all policies, while `anon` and `authenticated` still hold unnecessary table-level SELECT grants; no grant was changed.
- `gh_security_events` contained 44 successful `auth.pi.success` events in the preceding 7 days, last at 2026-11-17 15:17:33 UTC, with no matching rejection/stage failure events. This proves historical server-bridge success, not that the latest mobile browser attempt reached the route.
- A read-only SQL diagnostic script is provided at `docs/RUN338-PI-AUTH-SUPABASE-DIAGNOSTICS.sql`.
- Dependency remediation and lockfile regeneration remain incomplete: npm registry requests timed out in this environment. `package.json` dependency versions and `package-lock.json` were not altered, and the 29-finding security audit remains a blocker. The `pi-backend` → `stellar-sdk` chain is used by A2U/withdrawal flows and must not be overridden without Pi Testnet payment/receipt tests.
- No GitHub push, Vercel deployment, Supabase write, migration, grant change, financial mutation or Mainnet operation was performed.

## RUN377 identity/session finding

Both identity/session tables and their base migration-history rows exist in the currently connected Supabase project. The `service_role` SELECT/INSERT/UPDATE privilege gap is confirmed there. RUN377 contains a source-only least-privilege grant migration and readiness evidence correction. The Preview database target mapping is unconfirmed, so no live database change or sign-in acceptance is claimed.

## Run 402 update (2026-11-25)
Release source version is `0.338.132`. Run 406 restores least-privilege server-side reads for social visibility, marketplace catalog and membership entitlements; exposes registration rewards in Wallet without automatic claims; and refines wallet presentation. Run 403 keeps reward status visible when paused; Run 405 expands bounded backfill account discovery, preserves canonical Pi usernames, and documents source-to-destination reconciliation steps. Run 402 covers net-first withdrawal fee handling and Testnet-only marketplace/community fee configuration. GitHub push, Vercel deployment, full migration-history reconciliation, remaining-account mapping, and live payout acceptance remain blockers.


## RUN431 Phase 2 Discovery preferences integration

Full `npm run verify:static` passes with zero failures (5,247 PASS output lines); documentation hygiene, release hygiene (17/17) and project truth (11/11) pass. Prebuild dry-run discovers 452 checks, but actual prebuild is blocked by Node 22.16.0 instead of required Node 24.15.0.

RUN430 hardens saved collection local-storage failure handling and adds a cross-feature source contract for feed engagement, comments, reactions, saves, shares, stories and notification targets. It does not add a database migration or claim that device-local collections sync across devices. See `docs/RUN430-PHASE2-SOCIAL-ENGAGEMENT-2026-11-26.md`.


## RUN431 Phase 2 Discovery preferences integration

Discover connection-intent preferences now persist through the authenticated, server-authoritative social profile update path. The Discovery context exposes the existing profile update and toast actions; local intent storage remains a non-authoritative compatibility mirror. The source contract checks context wiring, confirmation messaging, authenticated profile ownership and the server profile field. No migration or live database mutation was introduced.


## RUN432 Phase 2 Community creation draft recovery

The Community creation wizard now restores account-scoped draft state, including the current step and stable create idempotency ID. Transient image previews and payment-confirmation state are excluded. Draft retention is bounded to 30 days and successful creation clears the saved draft. RUN432 adds a 10-check source contract and 15 helper assertions; no database migration is introduced.


## RUN433 Phase 2 integrated social transformation

The five-stage source audit now maps the Community, Messaging, Discovery and integration journeys to their existing canonical components, APIs, RPCs and authorization boundaries. RUN431 adds server-authoritative connection-intent preference persistence; RUN432 adds resumable Community creation drafts; RUN433 adds a 22-check integration contract. Direct calling remains disabled until TURN/signaling and production policy are verified. No database migration or live data mutation is part of RUN433.


## RUN434 Phase 3 — Architecture, Identity & Durable Operation Boundaries (2026-11-26)

RUN434 scans 284 API route handlers and records route-level RPC/table references, auth/session/body/rate-limit/idempotency signals and caller-supplied identity fields. It consolidates duplicated `ghc_execute_spend` transport into one server-side helper, restricts the operational reconciliation key to `GHC_OPERATOR_RECONCILE_KEY` (no A2U worker-key fallback), and replaces caller-supplied operator audit actor labels with the explicit `service:operator-key` principal. Focused architecture boundary checks pass 17/17 and operator-key runtime checks pass 6/6. The generic transactional outbox remains proposal-only because it is not integrated atomically into owner RPCs or verified under worker/consumer failure. Testnet read-only catalog evidence confirms 322 public SECURITY DEFINER functions with zero anon/authenticated EXECUTE grants and 37 RLS/no-policy tables with zero anon/authenticated DML grants. No database migration or live data mutation occurred. Full `npm run verify:static` passes with 5,306 PASS output lines and zero FAIL lines; prebuild dry-run discovers 458 checks. Nine changed TypeScript files parse without syntax errors. Supported Node 24.15.x dependency-backed typecheck/lint/build, disposable PostgreSQL, Testnet history reconciliation, two-account/session concurrency and Mainnet evidence remain open. Production remains NOT APPROVED. See `docs/RUN434-PHASE3-AUTHORITY-AUDIT-2026-11-26.md`.


## RUN435 Phase 3 identity input classification (2026-11-26)

RUN435 reviews all eight routes flagged by RUN434 for caller-supplied identity-like body fields. Authenticated session identity remains the actor/owner; client actor aliases are ignored or stripped; target/counterparty IDs are separately resolved or validated. The registered regression contract passes 16/16. This does not clear the held atomic session-cap proposal or the database, multi-account, Node 24.15.x, Testnet migration-history and Mainnet evidence gates. No migration/live data mutation/push/deploy/payment/Mainnet action occurred. Production remains NOT APPROVED.


## RUN440 update

The session rotation path now uses a durable compare-and-swap update keyed by session ID, prior token hash and unrevoked state. A response is successful only for exactly one returned row; conflicts and storage errors fail closed. The memory-only path rechecks the current token mapping to prevent same-process concurrent rotations from both succeeding. RUN440 source contract passes 12/12; runtime concurrency/outage regression passes 7 assertions. No SQL migration, live database change, push, deployment or Mainnet action occurred.


RUN441 Phase 4 update: 34 runtime assertions pass for canonical account remapping, multi-device session isolation, owner-only revocation, step-up proof account/session scope and revocation, and out-of-order profile hydration. Source contract passes 21/21. Two held SQL corrections address Community invitation lock-order inversion and Messenger member-count concurrency. The disposable PostgreSQL 17 rehearsal was not executed because no PostgreSQL/psql/Docker runtime was available. No migration or live database mutation occurred; RUN429 remains REVIEW_REQUIRED.
