-- RUN405: expand the operator-only Testnet registration backfill's account discovery.
-- This is additive and idempotent. It does not issue credits by itself, change
-- account balances, rewrite migration history, or run against Mainnet automatically.
-- Operator must verify the target Supabase project and invoke the bounded backfill.

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

  -- Union every durable account root available in this schema. This does not
  -- infer Pi usernames or reassign account ownership; it only enumerates stable
  -- account IDs for the idempotent claim RPC. Existing campaign references and
  -- historical valid registration credits are respected by that RPC.
  FOR v_user IN
    SELECT account_id FROM (
      SELECT gh_user_id AS account_id FROM public.gh_pi_identities
      UNION SELECT gh_user_id FROM public.gh_user_profiles
      UNION SELECT gh_user_id FROM public.gh_sessions
      UNION SELECT gh_user_id FROM public.gh_user_progress
      UNION SELECT gh_user_id FROM public.gh_user_achievements
      UNION SELECT user_id FROM public.ghc_user_accounts
      UNION SELECT user_id FROM public.ghc_transactions
      UNION SELECT user_id FROM public.gh_earnings_ledger_entries WHERE asset = 'PI'
    ) accounts
    WHERE account_id IS NOT NULL
      AND btrim(account_id) <> ''
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

  RETURN jsonb_build_object(
    'ok', v_failed = 0,
    'processed', v_processed,
    'credited', v_credited,
    'alreadyMetOrPreviouslyCredited', v_already_met,
    'failed', v_failed,
    'nextCursor', v_next,
    'done', v_processed < v_limit,
    'message', 'Review each batch result and reconcile source accounts before retrying failures.'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.gh_earnings_testnet_registration_bonus_backfill(text, text, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.gh_earnings_testnet_registration_bonus_backfill(text, text, integer)
  TO service_role;

COMMENT ON FUNCTION public.gh_earnings_testnet_registration_bonus_backfill(text, text, integer) IS
  'RUN405: bounded, idempotent Testnet backfill enumerating identity, profile, session, progress, achievement, GHC account/transaction, and PI ledger roots. Requires explicit operator confirmation. Never invoke on Mainnet. Does not automatically reconcile cross-project source balances.';
