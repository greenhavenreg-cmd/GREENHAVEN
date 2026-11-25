-- RUN384: cover the 17 live Testnet foreign keys flagged by Supabase advisors.
-- These eight tables were empty at audit time; indexes are additive and do not
-- change rows, RLS, grants, or financial state. Do not drop the separate 204
-- advisor-reported unused indexes without workload evidence.
BEGIN;
CREATE INDEX IF NOT EXISTS idx_gh_field_report_evidence_geo_unit_fk ON public.gh_field_report_evidence (geo_unit_id);
CREATE INDEX IF NOT EXISTS idx_gh_field_report_evidence_media_asset_fk ON public.gh_field_report_evidence (media_asset_id);
CREATE INDEX IF NOT EXISTS idx_gh_research_agent_assignments_geo_unit_fk ON public.gh_research_agent_assignments (geo_unit_id);
CREATE INDEX IF NOT EXISTS idx_gh_research_challenges_project_fk ON public.gh_research_challenges (project_id);
CREATE INDEX IF NOT EXISTS idx_gh_research_election_contests_geo_country_fk ON public.gh_research_election_contests (geo_unit_id, country_code);
CREATE INDEX IF NOT EXISTS idx_gh_research_evidence_geo_unit_fk ON public.gh_research_evidence (geo_unit_id);
CREATE INDEX IF NOT EXISTS idx_gh_research_evidence_response_project_fk ON public.gh_research_evidence (response_id, project_id);
CREATE INDEX IF NOT EXISTS idx_gh_research_tallies_contest_project_fk ON public.gh_research_tallies (contest_id, project_id);
CREATE INDEX IF NOT EXISTS idx_gh_research_tallies_geo_unit_fk ON public.gh_research_tallies (geo_unit_id);
CREATE INDEX IF NOT EXISTS idx_gh_research_tallies_project_fk ON public.gh_research_tallies (project_id);
CREATE INDEX IF NOT EXISTS idx_gh_research_tallies_source_response_fk ON public.gh_research_tallies (source_response_id);
CREATE INDEX IF NOT EXISTS idx_gh_research_tally_candidate_votes_candidate_contest_fk ON public.gh_research_tally_candidate_votes (candidate_id, contest_id);
CREATE INDEX IF NOT EXISTS idx_gh_research_tally_candidate_votes_tally_contest_fk ON public.gh_research_tally_candidate_votes (tally_id, contest_id);
CREATE INDEX IF NOT EXISTS idx_gh_scoped_evidence_uploads_geo_unit_fk ON public.gh_scoped_evidence_uploads (geo_unit_id);
CREATE INDEX IF NOT EXISTS idx_gh_scoped_evidence_uploads_media_asset_fk ON public.gh_scoped_evidence_uploads (media_asset_id);
CREATE INDEX IF NOT EXISTS idx_gh_scoped_evidence_uploads_project_fk ON public.gh_scoped_evidence_uploads (project_id);
CREATE INDEX IF NOT EXISTS idx_gh_scoped_evidence_uploads_report_fk ON public.gh_scoped_evidence_uploads (report_id);
COMMIT;
