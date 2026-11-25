-- RUN388: enforce Research study windows and response quotas atomically.
-- This migration is REVIEW_REQUIRED and MUST NOT be applied by automation.
-- The project-row lock serializes submissions so a quota cannot be exceeded by
-- concurrent respondents. Service-role callers only; respondents never receive
-- direct table or function privileges.

CREATE OR REPLACE FUNCTION public.gh_research_submit_response(
  p_project_id uuid,
  p_submission_key text,
  p_answers jsonb,
  p_consent_recorded_at timestamptz
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
  v_project public.gh_research_projects%ROWTYPE;
  v_existing public.gh_research_responses%ROWTYPE;
  v_response_id uuid;
  v_submitted_at timestamptz;
  v_now timestamptz := clock_timestamp();
  v_starts_at timestamptz;
  v_ends_at timestamptz;
  v_response_limit bigint;
  v_response_count bigint;
BEGIN
  IF p_project_id IS NULL
    OR p_submission_key IS NULL
    OR char_length(p_submission_key) < 16
    OR char_length(p_submission_key) > 80
    OR p_answers IS NULL
    OR jsonb_typeof(p_answers) <> 'object'
    OR pg_column_size(p_answers) > 65536
    OR p_consent_recorded_at IS NULL
  THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_SUBMISSION');
  END IF;

  SELECT * INTO v_project
  FROM public.gh_research_projects
  WHERE id = p_project_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'RESEARCH_NOT_FOUND');
  END IF;

  -- A retry of an already accepted submission remains idempotently readable even
  -- if the owner subsequently pauses/closes the study or the quota is exhausted.
  SELECT id, submitted_at INTO v_response_id, v_submitted_at
  FROM public.gh_research_responses
  WHERE project_id = p_project_id AND submission_key = p_submission_key;
  IF FOUND THEN
    RETURN jsonb_build_object('ok', true, 'duplicate', true, 'response_id', v_response_id, 'submitted_at', v_submitted_at);
  END IF;

  IF v_project.status <> 'published' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'RESEARCH_NOT_OPEN');
  END IF;

  IF v_project.settings ? 'starts_at' AND v_project.settings->>'starts_at' IS NOT NULL AND v_project.settings->>'starts_at' <> '' THEN
    BEGIN
      v_starts_at := (v_project.settings->>'starts_at')::timestamptz;
    EXCEPTION WHEN others THEN
      RETURN jsonb_build_object('ok', false, 'error', 'RESEARCH_SCHEDULE_INVALID');
    END;
    IF v_now < v_starts_at THEN
      RETURN jsonb_build_object('ok', false, 'error', 'RESEARCH_NOT_OPEN');
    END IF;
  END IF;

  IF v_project.settings ? 'ends_at' AND v_project.settings->>'ends_at' IS NOT NULL AND v_project.settings->>'ends_at' <> '' THEN
    BEGIN
      v_ends_at := (v_project.settings->>'ends_at')::timestamptz;
    EXCEPTION WHEN others THEN
      RETURN jsonb_build_object('ok', false, 'error', 'RESEARCH_SCHEDULE_INVALID');
    END;
    IF v_now >= v_ends_at THEN
      RETURN jsonb_build_object('ok', false, 'error', 'RESEARCH_CLOSED');
    END IF;
  END IF;

  IF v_starts_at IS NOT NULL AND v_ends_at IS NOT NULL AND v_ends_at <= v_starts_at THEN
    RETURN jsonb_build_object('ok', false, 'error', 'RESEARCH_SCHEDULE_INVALID');
  END IF;

  IF v_project.settings ? 'response_limit' AND v_project.settings->'response_limit' <> 'null'::jsonb THEN
    BEGIN
      v_response_limit := (v_project.settings->>'response_limit')::bigint;
    EXCEPTION WHEN others THEN
      RETURN jsonb_build_object('ok', false, 'error', 'RESEARCH_QUOTA_INVALID');
    END;
    IF v_response_limit < 1 OR v_response_limit > 10000000 THEN
      RETURN jsonb_build_object('ok', false, 'error', 'RESEARCH_QUOTA_INVALID');
    END IF;
    SELECT count(*) INTO v_response_count
    FROM public.gh_research_responses
    WHERE project_id = p_project_id;
    IF v_response_count >= v_response_limit THEN
      RETURN jsonb_build_object('ok', false, 'error', 'RESPONSE_LIMIT_REACHED');
    END IF;
  END IF;

  INSERT INTO public.gh_research_responses (
    id, project_id, submission_key, answers, consent_recorded_at, review_status
  ) VALUES (
    gen_random_uuid(), p_project_id, p_submission_key, p_answers, p_consent_recorded_at, 'received'
  )
  ON CONFLICT (project_id, submission_key) DO NOTHING
  RETURNING id, submitted_at INTO v_response_id, v_submitted_at;

  IF v_response_id IS NULL THEN
    SELECT id, submitted_at INTO v_response_id, v_submitted_at
    FROM public.gh_research_responses
    WHERE project_id = p_project_id AND submission_key = p_submission_key;
    IF v_response_id IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'error', 'RESPONSE_REFERENCE_UNAVAILABLE');
    END IF;
    RETURN jsonb_build_object('ok', true, 'duplicate', true, 'response_id', v_response_id, 'submitted_at', v_submitted_at);
  END IF;

  RETURN jsonb_build_object('ok', true, 'duplicate', false, 'response_id', v_response_id, 'submitted_at', v_submitted_at);
END;
$function$;

REVOKE ALL ON FUNCTION public.gh_research_submit_response(uuid, text, jsonb, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.gh_research_submit_response(uuid, text, jsonb, timestamptz) TO service_role;
