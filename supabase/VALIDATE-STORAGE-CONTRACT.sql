-- Read-only validation for GreenHaven Run 394 Storage contract.
-- Run separately in each intended Supabase environment. This file performs no writes.

-- 1. Full bucket inventory. GreenHaven's source currently expects one private
-- application media bucket with category prefixes; investigate other buckets
-- before considering consolidation or visibility changes.
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
ORDER BY id;

-- 2. Canonical application bucket metadata.
SELECT
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  (public = false) AS is_private,
  (file_size_limit = 52428800) AS has_expected_size_limit
FROM storage.buckets
WHERE id = 'gh-media'; -- Replace only if GH_MEDIA_BUCKET is intentionally configured differently.

-- 3. Inspect every Storage object policy; do not infer access from bucket visibility alone.
SELECT
  policyname,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
ORDER BY policyname;

-- 4. Verify RLS on GreenHaven durable media metadata tables.
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('gh_media_assets', 'gh_media_upload_sessions', 'gh_post_media')
ORDER BY tablename;

-- 5. Inspect client-facing table privileges. Expected: no direct anon/authenticated access.
SELECT
  table_name,
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN ('gh_media_assets', 'gh_media_upload_sessions', 'gh_post_media')
  AND grantee IN ('PUBLIC', 'anon', 'authenticated')
ORDER BY table_name, grantee, privilege_type;

-- 6. Confirm restrictive deny-client policies exist on metadata tables.
SELECT
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('gh_media_assets', 'gh_media_upload_sessions', 'gh_post_media')
ORDER BY tablename, policyname;

-- Interpretation:
-- - An empty client-grant result is expected for these server-only metadata tables.
-- - Do not add broad storage.objects policies just to make the app work: upload and
--   download are mediated by authenticated server routes and signed object URLs.
-- - Investigate any unexpected permissive policy before changing bucket visibility.

-- 7. Media metadata inventory by bucket/status (does not delete or rewrite objects).
SELECT bucket, status, count(*) AS media_asset_count
FROM public.gh_media_assets
GROUP BY bucket, status
ORDER BY bucket, status;

-- 8. Upload session lifecycle inventory by bucket/status.
SELECT bucket, status, count(*) AS upload_session_count
FROM public.gh_media_upload_sessions
GROUP BY bucket, status
ORDER BY bucket, status;
