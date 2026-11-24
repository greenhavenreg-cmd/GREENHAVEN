# Phase D — Communities Product + Supabase Storage Completion

**Release candidate:** `0.338.118`  
**Parent:** `GREENHAVEN-0.338.117-PHASE7-8-HARMONIZED-2026-11-24.zip`  
**Scope:** complete both Phase D workstreams in place; preserve current architecture and existing durable data contracts.

## 1. Communities product

### Preserved existing product capabilities

- Community discovery with All / Open join / Approval / Invite only filters.
- Board, Updates, Discussion, Events, Chat, Members, About and moderator-only Mod surfaces.
- Durable join request, approval/decline, invitation, membership and role RPC workflows.
- Moderation reports, report resolution, moderation history, post pin/hide controls and member management.
- Existing account-scoped cache isolation and canonical membership/member-directory reads.

### Phase D hardening delivered

1. Added authenticated `GET /api/communities/[id]/roles`. It returns only the current caller's canonical role, obtained through the server-side community-role RPC. It does not accept a caller-supplied user ID.
2. Added durable rate limiting and `Cache-Control: no-store, private` to the role lookup.
3. The community hub now gates the Mod tab, moderation console, moderation-log/reports and moderation controls on a fresh successful server role result. A failed or unavailable lookup fails closed to guest-level UI.
4. The UI no longer trusts a cached/local role to reveal privileged moderation surfaces. Existing write APIs and RPCs continue to enforce authorization independently; UI gating is defense in depth, not a replacement for server authorization.
5. Community directory cards now display normalized Open join / Approval / Invite only / Private access chips.
6. Pending join queues display neutral applicant ordinals instead of exposing raw internal account identifiers in the interface. The opaque ID remains only in the action callback needed by the server decision API.
7. Added a pure runtime policy test for public, approval, invite-only and private labels/filter semantics.

## 2. Supabase Storage infrastructure

### Canonical design retained

- One private `gh-media` bucket (or the explicitly configured `GH_MEDIA_BUCKET`) with owner-scoped category prefixes.
- Private visibility, 50 MiB bucket ceiling, explicit 16-type MIME allowlist and a stricter 40 MiB video application limit.
- Authenticated server-issued upload intents and signed upload URLs.
- Upload sessions, owner/path/bucket validation, actual object metadata verification, durable media asset creation and session finalization.
- Viewer-authorized media delivery through the application facade.
- Server-only metadata tables and service-role credentials; no broad client object/table access is introduced.

### Phase D acceptance hardening delivered

1. Added a dedicated Storage completion gate covering exact private bucket configuration, safe create-only-if-404 provisioning, conflict re-read, owner-path validation, signed URL origin restrictions, upload-session ownership, stored byte/MIME verification, idempotent finalization, private viewer delivery and read-only catalog inspection.
2. Kept the existing operator audit read-only by default. `--provision` remains an explicit operator-only action and creates only a missing bucket; it never repairs or mutates an existing bucket.
3. Kept bucket metadata management on the Storage API. `storage.buckets` and `storage.objects` are not modified through application SQL. The SQL validation file remains read-only and inspects bucket metadata, object policies, metadata-table RLS/grants and lifecycle counts.
4. No new bucket, object policy, metadata table or migration was added. No live bucket was created or altered. Existing storage objects, signed URL consumers, upload sessions and media references are untouched.

## 3. Verification

Dedicated gates added to both `prebuild:checks` and `verify:static`:

- `scripts/check-phaseD-communities-completion.mjs`
- `scripts/test-phaseD-community-policy.mjs`
- `scripts/check-phaseD-storage-completion.mjs`

The full Phase D gates are source/runtime contract checks. They do not prove remote bucket configuration, applied database policy, authenticated browser behavior or Testnet/Mainnet parity.

## 4. Supabase guidance checked

The implementation follows current Supabase Storage guidance: private buckets require authorization for retrieval; Storage object access is controlled by RLS; overwriting requires additional SELECT and UPDATE access; bucket configuration is managed through the Storage API; and direct SQL mutation of Storage metadata is avoided. Relevant current references:

- https://supabase.com/docs/guides/storage/buckets/fundamentals
- https://supabase.com/docs/guides/storage/buckets/creating-buckets
- https://supabase.com/docs/guides/storage/security/access-control
- https://supabase.com/docs/guides/storage/schema/design

No relevant 2026 Storage breaking change required a change to the current bucket/upload design. Supabase CLI v3 changes hosted/local command defaults, so this work intentionally does not invoke CLI migration or hosted Storage commands.

## 5. Remaining external acceptance

- Node `24.15.x` clean dependency install, TypeScript, lint, full prebuild and Next.js production build.
- Browser/mobile/responsive/RTL/accessibility acceptance and at least two independent community accounts.
- Live Testnet checks for caller-role behavior, role revocation, join approval/decline, moderation log durability and private member visibility.
- Live Testnet and Mainnet read-only bucket and `storage.objects` policy catalog comparison.
- Controlled authenticated upload/download/denial tests, including cross-account media access denial, expired/replayed upload sessions and upload interruption/retry.
- Reconcile actual media rows and object references before any cleanup or migration work. No orphan cleanup is authorized by this phase.

**Release status:** source-only candidate; **NOT production approved**. No migration was added, edited, replayed or applied. No bucket or object was created, updated or deleted. No financial, Pi, Mainnet, Git push or Vercel deployment action occurred.
