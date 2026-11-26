-- RUN437 Phase 3: READ-ONLY Testnet migration-effect reconciliation.
-- Execute only against the explicitly selected GreenHaven TESTNET project.
-- This file contains SELECT statements only. It does not repair migration history,
-- apply DDL, alter grants, invoke application RPCs, or mutate financial/community data.
-- A present effect is NOT proof that its source migration ran; compare exact SQL,
-- catalog definitions, and approved provenance before any migration-history action.

-- 1) RUN384: all 17 expected foreign-key indexes.
WITH expected(index_name) AS (VALUES
 ('idx_gh_field_report_evidence_geo_unit_fk'),
 ('idx_gh_field_report_evidence_media_asset_fk'),
 ('idx_gh_research_agent_assignments_geo_unit_fk'),
 ('idx_gh_research_challenges_project_fk'),
 ('idx_gh_research_election_contests_geo_country_fk'),
 ('idx_gh_research_evidence_geo_unit_fk'),
 ('idx_gh_research_evidence_response_project_fk'),
 ('idx_gh_research_tallies_contest_project_fk'),
 ('idx_gh_research_tallies_geo_unit_fk'),
 ('idx_gh_research_tallies_project_fk'),
 ('idx_gh_research_tallies_source_response_fk'),
 ('idx_gh_research_tally_candidate_votes_candidate_contest_fk'),
 ('idx_gh_research_tally_candidate_votes_tally_contest_fk'),
 ('idx_gh_scoped_evidence_uploads_geo_unit_fk'),
 ('idx_gh_scoped_evidence_uploads_media_asset_fk'),
 ('idx_gh_scoped_evidence_uploads_project_fk'),
 ('idx_gh_scoped_evidence_uploads_report_fk')
)
SELECT 'RUN384_INDEX' AS check_group, e.index_name AS object_name,
       CASE WHEN i.indexname IS NULL THEN 'MISSING' ELSE 'PRESENT' END AS observed_state
FROM expected e LEFT JOIN pg_indexes i
  ON i.schemaname='public' AND i.indexname=e.index_name
ORDER BY e.index_name;

-- 2) RUN384 + RUN390: exact service_role privileges and client-role denial.
WITH expected(table_name, privilege_type) AS (VALUES
 ('gh_conversation_members','SELECT'),('gh_conversation_members','INSERT'),('gh_conversation_members','UPDATE'),
 ('gh_marketplace_variants','SELECT'),('gh_media_assets','SELECT'),
 ('gh_pi_a2u_executions','SELECT'),('gh_pi_wallet_authorizations','SELECT'),
 ('gh_post_comments','SELECT'),('gh_posts','SELECT'),('gh_posts','UPDATE'),('gh_saves','SELECT'),
 ('gh_seller_payout_requests','SELECT'),
 ('gh_step_ups','SELECT'),('gh_step_ups','INSERT'),('gh_step_ups','UPDATE'),
 ('gh_webauthn_challenges','SELECT'),('gh_webauthn_challenges','INSERT'),('gh_webauthn_challenges','UPDATE'),
 ('gh_webauthn_credentials','SELECT'),('gh_webauthn_credentials','INSERT'),('gh_webauthn_credentials','UPDATE'),
 ('ghc_community_reports','INSERT'),
 ('ghc_membership_entitlements','SELECT'),('gh_user_mutes','SELECT'),('gh_marketplace_listings','SELECT')
)
SELECT 'SERVER_GRANT' AS check_group,
       format('%I.%I:%s','public',e.table_name,e.privilege_type) AS object_name,
       CASE WHEN to_regclass(format('public.%I',e.table_name)) IS NULL THEN 'TABLE_MISSING'
            WHEN has_table_privilege('service_role',format('public.%I',e.table_name),e.privilege_type) THEN 'PRESENT'
            ELSE 'MISSING' END AS observed_state
FROM expected e
UNION ALL
SELECT 'CLIENT_DENIAL', format('%I:%s',e.table_name,e.privilege_type),
       CASE WHEN to_regclass(format('public.%I',e.table_name)) IS NULL THEN 'TABLE_MISSING'
            WHEN has_table_privilege('anon',format('public.%I',e.table_name),e.privilege_type)
              OR has_table_privilege('authenticated',format('public.%I',e.table_name),e.privilege_type)
              THEN 'UNEXPECTED_CLIENT_GRANT' ELSE 'DENIED' END
FROM (SELECT DISTINCT table_name, privilege_type FROM expected) e
ORDER BY 1,2;

-- 3) Expected privileged functions: presence and EXECUTE ACL.
WITH expected(function_name, signature) AS (VALUES
 ('RUN388 research quota','public.gh_research_submit_response(uuid,text,jsonb,timestamp with time zone)'),
 ('RUN396 payout history','public.gh_pi_earnings_payout_list_owned(text,integer)'),
 ('RUN405 registration backfill','public.gh_earnings_testnet_registration_bonus_backfill(text,text,integer)'),
 ('RUN429 invitation create','public.gh_community_invitation_create(text,text,text)'),
 ('RUN429 invitation list','public.gh_community_invitation_list(text,integer)'),
 ('RUN429 invitation respond','public.gh_community_invitation_respond(text,text,boolean)'),
 ('Proposed atomic session cap','public.gh_session_issue_with_cap(text,text,text,timestamp with time zone,timestamp with time zone,timestamp with time zone,timestamp with time zone,text,jsonb,integer)')
), resolved AS (
 SELECT e.*, to_regprocedure(e.signature) AS proc FROM expected e
)
SELECT 'FUNCTION' AS check_group, function_name AS object_name,
       CASE WHEN proc IS NULL THEN 'MISSING'
            WHEN has_function_privilege('service_role',proc,'EXECUTE') THEN 'PRESENT_SERVICE_ROLE_EXECUTABLE'
            ELSE 'PRESENT_SERVICE_ROLE_EXECUTE_MISSING' END AS observed_state,
       CASE WHEN proc IS NULL THEN 'NOT_APPLICABLE'
            WHEN has_function_privilege('anon',proc,'EXECUTE') OR has_function_privilege('authenticated',proc,'EXECUTE')
              THEN 'UNEXPECTED_CLIENT_EXECUTE' ELSE 'CLIENT_EXECUTE_DENIED' END AS client_acl
FROM resolved ORDER BY function_name;

-- 4) RUN429 table posture. Table access intentionally remains RPC-only;
-- SECURITY DEFINER RPCs are separately checked above.
SELECT 'RUN429_TABLE' AS check_group, 'public.gh_community_invitations' AS object_name,
       CASE WHEN c.oid IS NULL THEN 'MISSING'
            WHEN c.relrowsecurity AND NOT has_table_privilege('anon',c.oid,'SELECT')
             AND NOT has_table_privilege('authenticated',c.oid,'SELECT')
             AND NOT has_table_privilege('service_role',c.oid,'SELECT')
              THEN 'PRESENT_RLS_CLIENT_AND_SERVICE_TABLE_ACCESS_DENIED'
            ELSE 'PRESENT_REVIEW_ACL_RLS' END AS observed_state
FROM (VALUES (to_regclass('public.gh_community_invitations'))) v(oid)
LEFT JOIN pg_class c ON c.oid=v.oid;

-- 5) Migration history anomalies. Read-only; preserve all rows as evidence.
SELECT 'MIGRATION_HISTORY_DUPLICATE' AS check_group, name AS object_name,
       count(*)::text || ' rows' AS observed_state
FROM supabase_migrations.schema_migrations
GROUP BY name HAVING count(*) > 1
ORDER BY name;

SELECT 'MIGRATION_HISTORY_TAIL' AS check_group,
       version || ':' || name AS object_name, 'RECORDED' AS observed_state
FROM supabase_migrations.schema_migrations
WHERE version >= '20261123000000'
ORDER BY version, name;

-- 6) Function implementation fingerprint and security posture.
-- Capture this output before considering any history mapping. A matching
-- signature or EXECUTE grant alone does not prove that the function body is
-- equivalent to the source migration. md5 is a comparison aid, not a
-- cryptographic attestation; retain the full definition in the audit record.
WITH expected(label, signature) AS (VALUES
 ('RUN388 research quota','public.gh_research_submit_response(uuid,text,jsonb,timestamp with time zone)'),
 ('RUN396 payout history','public.gh_pi_earnings_payout_list_owned(text,integer)'),
 ('RUN405 registration backfill','public.gh_earnings_testnet_registration_bonus_backfill(text,text,integer)'),
 ('RUN429 invitation create','public.gh_community_invitation_create(text,text,text)'),
 ('RUN429 invitation list','public.gh_community_invitation_list(text,integer)'),
 ('RUN429 invitation respond','public.gh_community_invitation_respond(text,text,boolean)'),
 ('Proposed atomic session cap','public.gh_session_issue_with_cap(text,text,text,timestamp with time zone,timestamp with time zone,timestamp with time zone,timestamp with time zone,text,jsonb,integer)')
), resolved AS (
 SELECT e.label, to_regprocedure(e.signature) AS proc FROM expected e
)
SELECT 'FUNCTION_FINGERPRINT' AS check_group, r.label AS object_name,
       p.proowner::regrole::text AS owner,
       p.prosecdef AS security_definer,
       p.proconfig AS function_settings,
       md5(pg_get_functiondef(p.oid)) AS definition_md5,
       pg_get_functiondef(p.oid) AS full_definition
FROM resolved r JOIN pg_proc p ON p.oid=r.proc
ORDER BY r.label;

-- 7) Exact RUN384 index definitions (not merely name presence).
SELECT 'RUN384_INDEX_DEFINITION' AS check_group,
       i.indexname AS object_name, i.indexdef AS observed_state
FROM pg_indexes i
WHERE i.schemaname='public'
  AND i.indexname IN (
   'idx_gh_field_report_evidence_geo_unit_fk',
   'idx_gh_field_report_evidence_media_asset_fk',
   'idx_gh_research_agent_assignments_geo_unit_fk',
   'idx_gh_research_challenges_project_fk',
   'idx_gh_research_election_contests_geo_country_fk',
   'idx_gh_research_evidence_geo_unit_fk',
   'idx_gh_research_evidence_response_project_fk',
   'idx_gh_research_tallies_contest_project_fk',
   'idx_gh_research_tallies_geo_unit_fk',
   'idx_gh_research_tallies_project_fk',
   'idx_gh_research_tallies_source_response_fk',
   'idx_gh_research_tally_candidate_votes_candidate_contest_fk',
   'idx_gh_research_tally_candidate_votes_tally_contest_fk',
   'idx_gh_scoped_evidence_uploads_geo_unit_fk',
   'idx_gh_scoped_evidence_uploads_media_asset_fk',
   'idx_gh_scoped_evidence_uploads_project_fk',
   'idx_gh_scoped_evidence_uploads_report_fk'
  )
ORDER BY i.indexname;

-- 8) RUN405 function provenance: full definition must be reviewed before
-- any backfill. This query is read-only and never invokes the function.
SELECT 'RUN405_BACKFILL_DEFINITION' AS check_group,
       p.oid::regprocedure::text AS object_name,
       p.prosecdef AS security_definer,
       p.proconfig AS function_settings,
       pg_get_functiondef(p.oid) AS observed_state
FROM pg_proc p
WHERE p.oid=to_regprocedure('public.gh_earnings_testnet_registration_bonus_backfill(text,text,integer)');
