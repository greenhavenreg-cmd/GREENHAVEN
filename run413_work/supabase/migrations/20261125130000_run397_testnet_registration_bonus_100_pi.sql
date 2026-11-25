-- RUN397: Testnet-only 100 PI cumulative registration reward campaign.
-- Existing v1/v2 registration credits count toward the 100 PI cumulative target.
-- The app/API remains fail-closed behind GHC_REGISTRATION_BONUS_ENABLED=1 AND
-- NEXT_PUBLIC_PI_SANDBOX=true. This migration is REVIEW_REQUIRED and is not an
-- instruction to apply on Mainnet. The service-role-only backfill RPC requires
-- an explicit operator confirmation string and processes bounded batches.

CREATE OR REPLACE FUNCTION public.gh_earnings_registration_bonus_status(p_user_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_user text := NULLIF(trim(COALESCE(p_user_id, '')), '');
  v_ref text;
  v_target numeric(38,0) := 1000000000; -- 100 PI at 1e-7 atomic scale
  v_prior numeric(38,0) := 0;
  v_campaign numeric(38,0) := 0;
  v_campaign_exists boolean := false;
BEGIN
  IF v_user IS NULL OR length(v_user) > 160 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_INPUT');
  END IF;
  v_ref := 'registration_bonus:testnet_100:v1:' || v_user;

  SELECT EXISTS (
    SELECT 1 FROM public.gh_earnings_ledger_entries
    WHERE user_id = v_user AND unique_ref = v_ref
  ) INTO v_campaign_exists;

  SELECT COALESCE(SUM(GREATEST(amount_atomic, 0)), 0)::numeric(38,0)
    INTO v_prior
    FROM public.gh_earnings_ledger_entries
   WHERE user_id = v_user
     AND asset = 'PI'
     AND source_kind = 'system'
     AND source_table = 'registration_bonus'
     AND status IN ('available', 'reserved', 'paid')
     AND unique_ref <> v_ref;

  IF v_campaign_exists THEN
    SELECT COALESCE(amount_atomic, 0)::numeric(38,0) INTO v_campaign
      FROM public.gh_earnings_ledger_entries
     WHERE user_id = v_user AND unique_ref = v_ref
     LIMIT 1;
    RETURN jsonb_build_object(
      'ok', true, 'enabled', true, 'claimed', true, 'claimable', false,
      'campaign', 'testnet_registration_100_v1', 'targetPi', 100,
      'priorAmountAtomic', v_prior::text, 'priorAmountPi', v_prior / 10000000.0,
      'amountAtomic', v_campaign::text, 'amountPi', v_campaign / 10000000.0,
      'totalTargetPi', 100, 'uniqueRef', v_ref,
      'message', 'Your Testnet registration reward has already been credited.'
    );
  END IF;

  IF v_prior >= v_target THEN
    RETURN jsonb_build_object(
      'ok', true, 'enabled', true, 'claimed', true, 'claimable', false,
      'campaign', 'testnet_registration_100_v1', 'targetPi', 100,
      'priorAmountAtomic', v_prior::text, 'priorAmountPi', v_prior / 10000000.0,
      'amountAtomic', '0', 'amountPi', 0,
      'totalTargetPi', 100, 'uniqueRef', v_ref,
      'message', 'Historical registration rewards already meet or exceed the 100 PI Testnet target.'
    );
  END IF;

  RETURN jsonb_build_object(
    'ok', true, 'enabled', true, 'claimed', false, 'claimable', true,
    'campaign', 'testnet_registration_100_v1', 'targetPi', 100,
    'priorAmountAtomic', v_prior::text, 'priorAmountPi', v_prior / 10000000.0,
    'amountAtomic', (v_target - v_prior)::text,
    'amountPi', (v_target - v_prior) / 10000000.0,
    'totalTargetPi', 100, 'uniqueRef', v_ref,
    'message', 'A one-time Testnet registration reward will bring your cumulative registration credits to 100 PI.'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.gh_earnings_registration_bonus_claim(p_user_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_user text := NULLIF(trim(COALESCE(p_user_id, '')), '');
  v_ref text;
  v_target numeric(38,0) := 1000000000;
  v_prior numeric(38,0) := 0;
  v_amount numeric(38,0) := 0;
  v_existing numeric(38,0) := 0;
  v_credit jsonb;
BEGIN
  IF v_user IS NULL OR length(v_user) > 160 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_INPUT');
  END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('registration_bonus:testnet_100:v1:' || v_user, 0));
  v_ref := 'registration_bonus:testnet_100:v1:' || v_user;

  SELECT COALESCE(amount_atomic, 0)::numeric(38,0) INTO v_existing
    FROM public.gh_earnings_ledger_entries
   WHERE user_id = v_user AND unique_ref = v_ref
   LIMIT 1;
  IF FOUND THEN
    RETURN jsonb_build_object('ok', true, 'duplicate', true, 'claimed', true,
      'claimable', false, 'credited', false, 'amountAtomic', v_existing::text,
      'amountPi', v_existing / 10000000.0, 'totalTargetPi', 100,
      'uniqueRef', v_ref, 'message', 'Your Testnet registration reward has already been credited.');
  END IF;

  SELECT COALESCE(SUM(GREATEST(amount_atomic, 0)), 0)::numeric(38,0)
    INTO v_prior
    FROM public.gh_earnings_ledger_entries
   WHERE user_id = v_user
     AND asset = 'PI'
     AND source_kind = 'system'
     AND source_table = 'registration_bonus'
     AND status IN ('available', 'reserved', 'paid')
     AND unique_ref <> v_ref;

  v_amount := GREATEST(v_target - v_prior, 0);
  IF v_amount = 0 THEN
    RETURN jsonb_build_object('ok', true, 'duplicate', true, 'claimed', true,
      'claimable', false, 'credited', false, 'amountAtomic', '0', 'amountPi', 0,
      'priorAmountPi', v_prior / 10000000.0, 'totalTargetPi', 100,
      'uniqueRef', v_ref, 'message', 'Historical registration rewards already meet or exceed the 100 PI Testnet target.');
  END IF;

  v_credit := public.gh_earnings_post_credit(
    v_user, v_amount, 'system', v_ref, 'available', 'registration_bonus',
    'testnet_100_v1', 'testnet_registration_reward',
    jsonb_build_object('campaign', 'testnet_registration_100_v1', 'targetPi', 100,
      'priorAmountAtomic', v_prior::text, 'creditedAmountAtomic', v_amount::text,
      'cumulativeTargetOnly', true, 'network', 'TESTNET')
  );
  IF COALESCE((v_credit->>'ok')::boolean, false) IS NOT TRUE THEN
    RETURN jsonb_build_object('ok', false, 'error', COALESCE(v_credit->>'error', 'CREDIT_FAILED'));
  END IF;

  RETURN jsonb_build_object('ok', true,
    'duplicate', COALESCE((v_credit->>'duplicate')::boolean, false),
    'credited', NOT COALESCE((v_credit->>'duplicate')::boolean, false),
    'claimed', true, 'claimable', false, 'entryId', v_credit->>'entryId',
    'amountAtomic', v_amount::text, 'amountPi', v_amount / 10000000.0,
    'priorAmountPi', v_prior / 10000000.0, 'totalTargetPi', 100,
    'uniqueRef', v_ref,
    'message', CASE WHEN COALESCE((v_credit->>'duplicate')::boolean, false)
      THEN 'Your Testnet registration reward has already been reconciled.'
      ELSE 'Testnet registration reward credited to your PI earnings ledger.' END);
END;
$$;

-- Operator-only bounded backfill. Run only after confirming the connected DB is
-- the intended Testnet and after reviewing the migration history. Call repeatedly
-- with the returned nextCursor until done=true. It never touches Mainnet itself;
-- environment identity must be confirmed by the operator before invocation.
CREATE OR REPLACE FUNCTION public.gh_earnings_testnet_registration_bonus_backfill(
  p_confirmation text,
  p_after_user_id text DEFAULT '',
  p_limit integer DEFAULT 250
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_user text;
  v_result jsonb;
  v_processed integer := 0;
  v_credited integer := 0;
  v_already_met integer := 0;
  v_failed integer := 0;
  v_next text := NULL;
  v_limit integer := LEAST(GREATEST(COALESCE(p_limit, 250), 1), 500);
BEGIN
  IF p_confirmation IS DISTINCT FROM 'I_CONFIRM_THIS_IS_THE_INTENDED_TESTNET_PROJECT' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'TESTNET_CONFIRMATION_REQUIRED');
  END IF;
  FOR v_user IN
    SELECT account_id FROM (
      SELECT gh_user_id AS account_id FROM public.gh_pi_identities
      UNION SELECT gh_user_id FROM public.gh_user_profiles
      UNION SELECT gh_user_id FROM public.gh_sessions
      UNION SELECT user_id FROM public.gh_earnings_ledger_entries WHERE asset = 'PI'
    ) accounts
    WHERE account_id IS NOT NULL AND btrim(account_id) <> ''
      AND account_id > COALESCE(p_after_user_id, '')
    ORDER BY account_id
    LIMIT v_limit
  LOOP
    v_processed := v_processed + 1;
    v_next := v_user;
    BEGIN
      v_result := public.gh_earnings_registration_bonus_claim(v_user);
      IF COALESCE((v_result->>'ok')::boolean, false) IS NOT TRUE THEN
        v_failed := v_failed + 1;
      ELSIF COALESCE((v_result->>'credited')::boolean, false) IS TRUE THEN
        v_credited := v_credited + 1;
      ELSE
        v_already_met := v_already_met + 1;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      v_failed := v_failed + 1;
    END;
  END LOOP;
  RETURN jsonb_build_object('ok', v_failed = 0, 'processed', v_processed,
    'credited', v_credited, 'alreadyMetOrPreviouslyCredited', v_already_met,
    'failed', v_failed, 'nextCursor', v_next, 'done', v_processed < v_limit,
    'message', 'Review every batch result. Retry failed rows only after investigating the underlying cause.');
END;
$$;

REVOKE ALL ON FUNCTION public.gh_earnings_registration_bonus_status(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.gh_earnings_registration_bonus_claim(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.gh_earnings_testnet_registration_bonus_backfill(text, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.gh_earnings_registration_bonus_status(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.gh_earnings_registration_bonus_claim(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.gh_earnings_testnet_registration_bonus_backfill(text, text, integer) TO service_role;

COMMENT ON FUNCTION public.gh_earnings_testnet_registration_bonus_backfill(text, text, integer) IS
  'RUN397 operator-only, bounded, idempotent Testnet backfill. Explicit confirmation is required. Verify target project identity before invocation; never invoke on Mainnet.';
