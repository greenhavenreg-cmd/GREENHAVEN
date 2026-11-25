# GreenHaven Supabase Storage Operations

**Scope:** Run 394 Phase 6 — reproducible bucket provisioning and safe configuration verification.

## Canonical application media layout

GreenHaven currently uses one private bucket, `gh-media`, with owner-scoped object paths. Categories are path prefixes, not separate buckets:

- `{verified-owner-id}/avatars/{uuid}.{ext}`
- `{verified-owner-id}/images/{uuid}.{ext}`
- `{verified-owner-id}/videos/{uuid}.{ext}`
- `{verified-owner-id}/audio/{uuid}.{ext}`
- `{verified-owner-id}/documents/{uuid}.{ext}`

This preserves the existing media asset registry, upload sessions, post-media references, evidence references and authorized media facade. Do not split or rename buckets without a separately reviewed data migration and consumer inventory.

## Canonical bucket policy

| Setting | Required value |
|---|---|
| Bucket | `gh-media` (or the explicitly configured `GH_MEDIA_BUCKET`) |
| Visibility | Private (`public=false`) |
| Bucket maximum | 50 MiB (52,428,800 bytes) |
| MIME allowlist | JPEG, PNG, WebP, GIF, AVIF; MP4, WebM, QuickTime; supported audio MIME types; PDF |
| Video application maximum | 40 MiB (enforced by application validation) |
| Object ownership path | First path segment is the authenticated server-derived GreenHaven user ID |

The exact MIME allowlist and bucket policy are defined in `lib/server/media/path-policy.mjs`. The upload and finalization routes enforce narrower per-type limits before accepting media metadata.

## Access model

- The bucket stays private. Do not make it public as a shortcut for image rendering.
- Upload intents and signed upload URLs are issued by authenticated server routes after identity, rate-limit, MIME, size and owner-path checks.
- Durable metadata is written to `public.gh_media_assets` and upload lifecycle records; content is delivered through the authenticated, viewer-authorized GreenHaven media facade.
- `gh_media_assets` and related media metadata tables retain server-only access. Do not add broad `anon` or `authenticated` table grants or client-side object write policies.
- Service-role credentials remain server-only. A public bucket is not a substitute for authorization.
- Existing signed URLs and object references are not rewritten by this procedure.

## Reproducible operator procedure

Run separately against the intended Testnet and Mainnet projects. Supply credentials through the operator shell/secret manager; do not commit them or add them to `NEXT_PUBLIC_*` variables.

Read-only verification:

```bash
SUPABASE_URL="https://<project-ref>.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="<server-only-key>" \
GH_MEDIA_BUCKET="gh-media" \
node scripts/audit-supabase-storage.mjs
```

Create only when the configured bucket is absent, then read it back and verify:

```bash
SUPABASE_URL="https://<project-ref>.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="<server-only-key>" \
GH_MEDIA_BUCKET="gh-media" \
node scripts/audit-supabase-storage.mjs --provision
```

The script first lists the live bucket inventory, then checks the configured application bucket. It never updates an existing bucket. If an existing bucket is public or has a different size/MIME policy, it reports a mismatch and stops. Operators must audit all existing objects, media references, signed URL consumers and policies before making any manual change.

## Database and Storage policy verification

Bucket metadata is managed through the Supabase Storage API; it is not represented by ordinary application table migrations. Storage object policies are PostgreSQL policies and must be inspected independently. Use the existing migration ledger and project-specific SQL validation scripts; do not replay a migration merely because it exists in the source archive.

Minimum read-only catalog checks for an authorized operator:

```sql
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'gh-media';

select policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'storage' and tablename = 'objects'
order by policyname;

select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('gh_media_assets', 'gh_media_upload_sessions', 'gh_post_media')
order by tablename;
```

The expected app architecture is server-mediated object access, with no broad client Storage object grants. Review any additional policies against actual deployment state before changing them.

## Lifecycle and data integrity

1. Upload intent creates a server-owned upload session before issuing the signed upload URL.
2. Completion verifies the session owner, bucket, path, MIME, byte count and object metadata.
3. A durable media asset record is created and the upload session is finalized.
4. Media content is served only after current viewer authorization checks.
5. Deletion/orphan cleanup must reconcile storage objects with durable media rows and all consumers before removing bytes. Do not run blanket prefix deletion.
6. Existing media assets and legacy URLs remain in place unless a separately reviewed, reversible migration is approved.

## Deployment readiness

A successful script run verifies only the bucket metadata. It does not prove live RLS/policy state, all object references, actual upload/download behavior, or Testnet/Mainnet parity. Those require live read-only catalog checks and controlled authenticated smoke tests on each target project. No production configuration is changed by the script unless `--provision` is explicitly supplied, and even then it creates only a missing bucket.
