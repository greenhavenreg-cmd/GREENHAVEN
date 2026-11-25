# GreenHaven 0.338.116 — Phase 5 & Phase 6 Delivery Report

**Baseline:** `GREENHAVEN-0.338.115-PHASEB-ONBOARDING-UX-2026-11-24.zip` (built on authoritative Run 392)

**Release:** `0.338.116`

**Scope:** Phase 5 — progressive profile completion; Phase 6 — Supabase database/Storage configuration, policy and lifecycle verification.

## 1. Phase 5 — Profile completion restructuring

### Implemented

- Reworked profile completion scoring so it measures optional profile enrichment only: display name, biography, profile photo, location, interests, education and profession.
- Removed verified status, date of birth and age from profile-completion scoring. Pi identity verification and age/eligibility requirements are separate trust/feature gates, not profile-completion tasks.
- Kept the profile completion indicator as a non-blocking improvement prompt; it does not gate general app access.
- Preserved the server-side `getOnboardingProfileGaps()` compatibility helper as an empty result, so optional profile gaps cannot become a registration gate.
- Improved profile patch merge behavior: omitted optional text fields preserve saved values; explicit empty/null values can clear the corresponding optional text field.
- Preserved session-derived profile ownership and server-controlled onboarding lifecycle state. Generic profile PATCH still strips client-supplied `onboarded` and identity fields.
- Preserved the verified Pi identity authority and existing feature-specific checks.

### No profile schema migration required

The current profile schema already supports progressive profile fields and server-side durable writes. No new profile table, duplicate identity table, or profile-completion migration was introduced.

## 2. Phase 6 — Supabase Storage and database integrity

### Source-based findings

- The existing application is built around one private `gh-media` bucket, with `avatars`, `images`, `videos`, `audio` and `documents` as owner-scoped path prefixes rather than separate buckets.
- Durable media records, upload sessions, post-media references and viewer-aware private media delivery already exist.
- Media metadata tables use RLS and deny-client policies; application routes perform authenticated, server-mediated upload and authorized media delivery.
- The application has no need for broad browser-facing `storage.objects` policies under this established service-role/signed-URL architecture. No permissive client policies were added.

### Implemented

- Centralized the canonical bucket policy and MIME allowlist in `lib/server/media/path-policy.mjs`.
- Canonical bucket settings: private visibility, 50 MiB bucket maximum, explicit MIME allowlist.
- Preserved the stricter 40 MiB application video limit; aligned the shared client media limit constant with server enforcement.
- Hardened `ensureMediaBucket()`:
  - validates the bucket identifier;
  - creates only after a confirmed 404;
  - does not attempt creation after auth, permission, rate-limit or server errors;
  - verifies the created bucket by reading it back;
  - verifies an existing bucket's visibility, file-size limit and complete MIME allowlist;
  - fails closed on configuration drift instead of silently accepting or mutating existing settings;
  - verifies create-conflict races by reading the bucket again.
- Updated `/api/media/health` to report canonical bucket-policy conformance and require it for readiness.
- Corrected the reported video maximum to 40 MiB.
- Added a read-only-by-default Storage inventory/audit script. `--provision` creates only a missing bucket and never updates an existing bucket.
- Added operator documentation for Testnet/Mainnet bucket provisioning, policy verification, media lifecycle and safe reconciliation.
- Added a read-only SQL validation script covering bucket inventory, Storage object policies, RLS, client grants and media/upload-session metadata counts.

### Live Supabase read-only audit

One connected Supabase project was available: `greenhavenreg-cmd's Project` (`jhlsjnmfpakvibuuoygx`), status `ACTIVE_HEALTHY`, region `eu-west-1`. The account connection did not identify whether this is the intended Testnet or Mainnet target, so no environment designation is assumed.

Observed on that connected project:

| Check | Live result |
|---|---|
| Storage bucket inventory | 0 buckets |
| `storage.objects` rows | 0 objects |
| `gh_media_assets` rows | 0 |
| `gh_media_upload_sessions` rows | 0 |
| `gh_post_media` rows | 0 |
| RLS enabled on `gh_media_assets` | Yes |
| RLS enabled on `gh_media_upload_sessions` | Yes |
| RLS enabled on `gh_post_media` | Yes |
| RLS enabled on `gh_user_profiles` | Yes |
| Client grants on those metadata tables | None returned |
| Explicit `storage.objects` policies | None returned |

The following existing media migrations were present in that project's migration history:

- `20261022010049_gh_media_assets`
- `20261023040001_gh_pulse_media_platform_v2`
- `20261027010001_gh_media_upload_session_immutable_identity`
- `20261027010002_gh_media_asset_create_immutable_identity`
- `20261027010003_gh_media_upload_finalize_identity`
- `20261022010087_gh_private_media_references_and_viewer_authz`
- `20261022010089_gh_comment_media_attachments`
- `20261116190000_gh_media_evidence_engine`

No new migration was added or applied. The live project has no Storage bucket at present; because it also has zero Storage objects and zero media references, there is no existing media data to migrate in that connected project. The private bucket has **not** been created because live infrastructure changes require explicit environment/operation authorization. Use the documented `node scripts/audit-supabase-storage.mjs --provision` only after confirming the connected project is the intended target.

## 3. Verification

| Check | Result |
|---|---|
| Run 394 Phase 5/6 contract checks | PASS — 24/24 |
| Run 394 profile-completion runtime scenarios | PASS — 3/3 |
| Run 393 Phase B onboarding UX | PASS — 14 assertions |
| Run 391 Phase A identity/onboarding gate | PASS — 12 assertions |
| Run 392 Pi identity/profile/optional gates | PASS — 14 assertions |
| Media API hardening | PASS — 27/27 |
| Run 384 Testnet/storage/migration audit | PASS — 13/13 |
| Secret-pattern scan | PASS — 2,821 text files; no potential secret values |
| TypeScript syntax transpilation of changed TS files | PASS — 4 files |
| Storage audit script help/entrypoint | PASS |
| Full TypeScript project check | NOT VERIFIED — dependencies are not installed in this working environment |
| Full Next.js production build | NOT RUN — this environment is Node 22.16.0; project `.nvmrc` requires Node 24.15.0 |

## 4. Migration, deployment and operational status

- No migration files were added, edited or applied.
- No Storage bucket was created or made public/private on the live project.
- No Storage object policies or database grants were changed live.
- No user media was deleted, moved or rewritten.
- No Git push, Vercel deployment or production environment change was performed.
- Package metadata, lockfile metadata and `APP_RELEASE_VERSION` were aligned to `0.338.116`.
- New static and runtime checks are registered in `verify:static` and `prebuild:checks`.

## 5. Remaining requirements

1. Confirm whether the connected Supabase project is the intended Testnet or Mainnet environment.
2. With explicit authorization, provision the missing private `gh-media` bucket using the operator script and verify it by read-back.
3. Run the SQL validation file in the intended Testnet and Mainnet projects and compare their bucket/policy/migration state.
4. Install dependencies under Node 24.15.0 or newer in the configured Node 24 line, then run the complete TypeScript check and Next.js production build.
5. Run authenticated upload, replacement, signed-download and deletion smoke tests against the intended environment before release.

## Readiness assessment

**Source implementation: complete for Phase 5/6.** Targeted static, runtime, security and read-only live catalog checks passed. **Environment readiness is not complete:** the one connected Supabase project has no Storage bucket, and full build/type verification remains outstanding. No claim is made that Testnet or Mainnet Storage is configured until the target environment is confirmed and the operator verification is completed.
