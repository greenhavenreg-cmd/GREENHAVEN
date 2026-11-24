# GreenHaven — Current Project Bundle

**Package:** `gh-connect@0.338.110`  
**Working increment:** RUN389 — Research & Field Research readiness, derived from RUN385 with RUN384 audit baseline.  
**Date:** 2026-11-24  
**Release status:** **NOT APPROVED** for production.

## Delivery identity

RUN386 adds deterministic keyset pagination, a 50-row response inbox page, duplicate-safe load-more and a complete cursor-traversing CSV export capped at 20,000 responses. RUN387 adds owner-only descriptive analytics for numeric, categorical, date and review-status data; low-frequency categories are suppressed and free-text content is excluded. RUN388 adds optional study windows and response quotas. RUN389 adds server-enforced owner/editor/reviewer/field-agent capabilities, team invitations, role changes, suspension/reactivation and collaborator-specific data access. Final response submission now calls a row-locked, idempotent service-role-only database RPC so quotas cannot be exceeded by concurrent requests. Its migration `20261124150000_run388_research_atomic_schedule_quota.sql` is REVIEW_REQUIRED and unapplied; do not deploy the caller before migration approval, disposable PostgreSQL validation, exact Testnet history reconciliation, application and postflight.

This remains a source-only candidate. GitHub Contents write access previously returned HTTP 403; no push or Vercel deployment is claimed. No Supabase migration was applied, no database write was made, and Production/Mainnet and all financial state remain untouched. The package requires Node `^24.15.0`; current runtime is Node 22.16.0 without installed dependencies, so dependency-backed typecheck/lint/build and live browser/device acceptance remain release gates. Research analytics remain descriptive and bounded; geographic analysis, collaboration permission matrix, multilingual studies, offline sync, trusted malware scanner integration, async large exports and full accessibility/load/recovery acceptance remain outstanding.

## Focused source gates

- RUN385 baseline: 19/19
- RUN386 response pagination/export: 17/17
- RUN387 descriptive analytics: 14/14
- RUN388 schedule/quota source contract: 16/16

Focused RUN385–RUN389 contracts pass 19/19, 17/17, 14/14, 16/16 and 21/21. Full static verification passes 63/63; production-safety checks pass 21/21; secret-pattern scan reports zero potential values across 2,804 text files. Migration inventory: 238 source files, including one new REVIEW_REQUIRED candidate. This does not prove any migration is applied.

## Historical RUN372 — canonical identity principal consolidation

RUN341 separates the actual Pi app UID from the canonical internal GreenHaven user ID, prevents old account tokens/profile/onboarding/verification state from leaking across account switches, hardens the App Studio bridge to require durable identity + session + HttpOnly cookie round-trip, fixes last-seen persistence through the shared bounded Supabase REST client, and recognizes the framed Pi app CDN sandbox referrer. Two legacy regression checks were aligned with the true canonical identity model. Identity contract 11/11, lifecycle runtime 24 assertions, and full static verification pass. No database writes/migrations, account mutations, payments, GitHub push, Vercel deployment or Mainnet actions occurred. Full Node 24.15.x typecheck/lint/build and live Testnet acceptance remain outstanding. See `docs/RUN341-IDENTITY-AUDIT-AND-MAINTENANCE-2026-11-23.md`.

## RUN333 baseline changes (retained)

1. Used the existing GH Connect Supabase Testnet project directly; no new Supabase branch was created.
2. Applied `20261118033839_revoke_client_select_on_server_only_tables` to revoke redundant `SELECT` grants from `PUBLIC`, `anon`, and `authenticated` on eight RLS-enabled server-only tables. Postflight confirms service-role CRUD remains intact.
3. Reconciled the Testnet history to 46 entries and regenerated the 230-file source migration inventory, manifest, checklist and apply-order guide. Twenty applied history entries still have no matching source filename and eleven same-slug/different-version candidates remain unverified.
4. Added the authenticated field-agent election tally desk, own-assignment acceptance, provenance-gated polling-unit selection and owner/reviewer-only read-only independent tally comparison. Submissions remain disabled until the held atomic tally RPC and approved geography dataset are installed.
5. Hardened the held tally SQL proposal to require active project membership, exact authoritative polling-unit code, source reference/version and the complete active candidate set.
6. Added per-evidence advisory transaction locking to the held evidence hash-chain trigger to prevent concurrent sequence forks.
7. Corrected final-release audit network classification to use `PI_NETWORK` rather than `PI_ENV`, and made the reported release version derive from `APP_RELEASE_VERSION`.
8. Preserved server-side financial authority, Testnet-only payout fences, no mock backends, and Mainnet separation.

## RUN383 — identity/privacy grants and release-gate repair

1. Read-only Vercel Preview runtime inspection found three `/api/profile/me` upsert failures with HTTP 403.
2. Read-only Supabase catalog inspection confirmed no service_role SELECT/INSERT/UPDATE grants on `gh_user_profiles`, `gh_user_achievements`, `gh_user_progress`, or `gh_user_mutes`; RLS was enabled and client SELECT remained denied.
3. Added `20261124095500_run383_identity_privacy_service_role_grants.sql` with explicit least-privilege grants and client-role revocations. It is classified REVIEW_REQUIRED; it has not been applied.
4. Confirmed Testnet migration history includes daily-claim 48-hour lock/issuance and registration-bonus reconciliation migrations. The daily claim RPCs and registration bonus RPCs are SECURITY DEFINER, service_role-only.
5. Confirmed the Testnet Preview welcome-bonus flag is false while Pi sandbox/network flags are Testnet; the 3 PI bonus remains intentionally disabled pending explicit financial-feature approval.
6. Added the missing blank server-only `GHC_CREATOR_REWARD_OPERATOR_KEY` placeholder to `.env.example` and registered its 7/7 contract gate.
7. Corrected the privileged reward body-bound regression to check the shared bounded-reader contract; 13/13.
8. Full static verification passes (63/63 inherited summary plus RUN383 9/9 and operator-key 7/7); migration inventory 233/233; documentation hygiene passes.
9. Dependency registry access remains unavailable (`EAI_AGAIN`); no package versions or lockfile integrity data were edited. The stored dependency audit remains a release blocker.
10. Vercel reports a `readable-secret` issue on the Testnet Preview `GHC_OPERATOR_RECONCILE_KEY`; an attempted type reclassification returned 404. No Vercel environment value was changed.

## RUN337 GitHub Actions audit / packaging repair

1. Restored the exact safe `.env.example` template from the parent of the failing GitHub commit. It contains blank privileged secrets, Testnet-only Pi defaults and disabled payout/A2U execution. Local populated env files remain excluded.
2. Corrected `.github/workflows/dependency-security.yml` so npm audit exit code 1 for valid vulnerability findings is reported as a security finding rather than a generic audit-command failure. The workflow still fails closed on any known vulnerability and preserves the JSON artifact.
3. Added `scripts/check-run337-github-audit-recovery.mjs` (7/7) to verify environment-template inclusion, secret hygiene, Testnet defaults and fail-closed audit behavior. Registered in static, prebuild, pretypecheck and prelint gates.
4. Updated the RUN332 audit source assertion and registered RUN336/RUN337 reports with documentation hygiene.
5. Inspected GitHub audit artifact 14397778034: 29 findings (2 critical, 21 high, 5 moderate, 1 low). Dependency manifest and lockfile were intentionally not modified because this container cannot access the npm registry and the official `pi-backend@0.1.3` → `stellar-sdk@10.4.1` chain has no safe automatic fix in the report. No lockfile hashes were fabricated, no `npm audit fix --force` was used, and the security gate was not bypassed.

RUN337 repairs the prebuild `.env.example` failure and makes the audit failure diagnostic accurate. The complete audit JSON is preserved in `docs/security/RUN337-NPM-AUDIT-44237574920.json`. It does **not** make the dependency audit pass: 29 findings (2 critical, 21 high, 5 moderate, 1 low) remain. Dependency remediation and a fresh Node 24.15.x clean install/audit remain release blockers. See `docs/RUN337-GITHUB-AUDIT-AND-ENV-TEMPLATE-REPAIR-2026-11-18.md`.

## RUN383 dependency security status

The stored npm audit artifact still reports 29 findings (2 critical, 21 high, 5 moderate, 1 low). The current lock contains affected package versions. The npm registry request failed with `EAI_AGAIN`, and this workspace is Node 22.16.0 rather than the required Node 24.15.x. No dependency or lockfile changes were made without registry metadata and a clean install/test. Dependency remediation remains a release blocker.

## RUN336 GitHub / Vercel build cleanup

1. Election tally optional counts now use explicit `number | null | "invalid"` normalization; required vote counts are explicitly `number` before arithmetic. Invalid input, safe-integer, non-negative, upper-bound, candidate-total, voter and ballot consistency checks remain.
2. Fixed the missing `isPublicRoutePath` import in `components/app-wrapper.tsx`.
3. Added `assignmentId` to the field-agent assignment model to match the authenticated server response and acceptance route.
4. Added the missing React `useRef` import in Communities.
5. Replaced the invalid `selected.isJoined` access with the already resolved `joined` membership decision.
6. Added the numeric accumulator generic to `safeCommunityCountTotal`.
7. Research Studio contest, candidate and exam effects include memoized callback dependencies; no exhaustive-deps suppression was added.
8. Updated the dependent Phase 4 assertion to verify the computed membership state rather than the nonexistent property.
9. Added the 12-check RUN336 source gate to `verify:static`, `prebuild:checks`, `pretypecheck` and `prelint`.

Dependency warning triage is recorded in `docs/RUN336-GITHUB-VERCEL-BUILD-CLEANUP-2026-11-18.md`. No lockfile integrity data was hand-edited, no Pi SDK transitive package was overridden, and no incompatible ESLint major was forced into Next 15. The RUN337 report documents the exact 29-finding audit artifact and why the dependency lock remains unchanged.

## Verification

- RUN336 build cleanup checks: 12/12 PASS.
- Updated RUN335 tally regression checks: 8/8 PASS. A strict standalone TypeScript 5.8.3 check of the exact count-normalization/comparison pattern also passes.
- Tally count-normalization/comparison fixture: strict TypeScript 5.8.3 check PASS.
- Changed tally route and Research Studio TSX syntax transpilation: PASS.
- `npm run verify:static`: PASS (full source/regression suite).
- Prebuild manifest dry-run: 392 checks discovered; dry-run only, not a claim that all 392 executed.
- RUN333 security reconciliation source gate: 11/11.
- Election tally UI/reconciliation source gate: 13/13.
- Election reconciliation runtime tests: 6/6.
- Final release audit environment tests: 4/4.
- Migration source manifest: 230/230.
- Project truth: 11/11.
- Changed TypeScript/TSX syntax transpilation: 7/7 with TypeScript 5.8.3; full project typecheck remains outstanding.
- Full dependency-backed `tsc --noEmit`, ESLint and `next build` were not certified: this packaging environment has no `node_modules` and runs Node 22.16.0; project requires `^24.15.0`.
- `next build`: not run. The Vercel Node 24.15.x build must be rerun to confirm full project typecheck, lint and production build. Browser/device acceptance also remains outstanding.

## Database and release gates

- Testnet migration history: 46 entries; source inventory: 230 SQL migrations.
- Twenty historical applied migration source files are missing; eleven version-drift candidates are not proven equivalent. Do not reconstruct, repair or replay them by guess.
- The research foundation, media evidence engine and scoped evidence-chain migrations remain held pending exact source review and a safe rehearsal. Testnet currently has `gh_research_projects`, but dependent membership, geography, election, assignment, tally and atomic tally RPC objects are absent.
- Trusted scanner provider/worker and provenance-backed authoritative geography dataset remain external prerequisites.
- GitHub branch protection and source push remain outstanding. No Vercel deployment was triggered; fresh Testnet Preview verification is required.
- Mainnet project was not modified. No balances, payment, payout, reward, membership, election or user data rows were changed.

## Safety rule

Never run a bulk migration push while any migration source/history discrepancy or held migration remains. Testnet and Mainnet must be reconciled independently. Production remains NOT APPROVED until the supported-runtime build, exact database history/catalog reconciliation, provider acceptance, Pi Browser/device tests, and release-owner approval all pass.


## RUN338 Pi authentication diagnostics and Supabase review

RUN338 adds token-free Pi SDK/authentication stage codes, backend `/api/auth/pi` stage telemetry, and a post-login HttpOnly cookie round-trip check through `/api/auth/session`. The client now refuses to mark the server session ready until the durable cookie-backed session and Pi identity mapping are confirmed. The read-only Testnet SQL diagnostic script is `docs/RUN338-PI-AUTH-SUPABASE-DIAGNOSTICS.sql`; the read-only database findings and exact limits are documented in `docs/RUN338-PI-AUTH-DIAGNOSTICS-AND-SUPABASE-REVIEW.md`.

RUN338 does **not** claim dependency remediation complete. npm registry access timed out, so package versions and the lockfile were left unchanged rather than fabricating lock metadata. The 29-finding audit remains a blocker; in particular, `pi-backend` → `stellar-sdk` is used by A2U and withdrawal flows and requires compatible Testnet verification before any override. No Supabase write, migration, grant change, GitHub push, Vercel deployment, or Mainnet operation occurred.


## RUN339 — optional ecosystem provider isolation

RUN339 introduces a guarded optional-provider execution boundary that consults the existing canonical ecosystem service-release helper before invoking a provider callback. The callback is the only place where a provider's dynamic import/initialization should occur; Coming Soon, unavailable and unknown services are rejected before that callback runs. Provider exceptions are returned as a typed `PROVIDER_FAILURE` result and are not propagated into core services.

The authenticated app's startup prefetch now warms only released, frequently used surfaces; the ecosystem roadmap screen is loaded only on explicit navigation. Prefetch failures are swallowed as non-fatal. Realtime transport startup and event recovery are best-effort, preserving HTTP-backed core screen availability if realtime initialization or recovery fails.

Regression coverage: unreleased provider callback is never invoked; released provider success is returned; provider exception is contained; unknown service callback is never invoked. Existing ecosystem registry, server release helper, Events and Charity release checks are preserved. This does not claim every unreleased provider adapter has been migrated to the new wrapper: any future provider integration must use `runOptionalEcosystemProvider` and must keep provider imports inside its guarded callback.

No database migrations, Supabase writes, GitHub push, Vercel deployment, or Mainnet operations were performed. Production approval status remains unchanged.


## RUN372 — canonical identity principal consolidation

The Pi UID is treated as an authentication-provider subject. A GreenHaven account ID is established only by the durable, server-verified Pi→GreenHaven mapping. SDK-only and unverified Pi sessions remain unbound; account switches clear previous account state. Existing database and financial ownership identifiers are preserved pending a verified Testnet migration inventory. No database migration, payment operation or deployment was performed.
