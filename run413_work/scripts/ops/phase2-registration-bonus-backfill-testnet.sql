-- RUN397 OPERATOR ACTION — INTENDED TESTNET PROJECT ONLY; NEVER MAINNET.
-- Goal: reconcile every known account to a cumulative 100 PI registration-reward
-- target. Valid historical v1/v2 registration credits count toward the target.
-- Existing 3 PI recipients should receive a 97 PI top-up; accounts with no prior
-- valid registration credit should receive up to 100 PI. Do not run until the
-- RUN397 migration is reviewed/applied and target migration history is reconciled.

-- 1) Read-only preview. No credit occurs in this query.
WITH accounts AS (
  SELECT gh_user_id AS user_id FROM public.gh_pi_identities
  UNION SELECT gh_user_id FROM public.gh_user_profiles
  UNION SELECT gh_user_id FROM public.gh_sessions
  UNION SELECT user_id FROM public.gh_earnings_ledger_entries WHERE asset = 'PI'
), prior AS (
  SELECT user_id, COALESCE(SUM(GREATEST(amount_atomic, 0)), 0)::numeric AS prior_atomic
  FROM public.gh_earnings_ledger_entries
  WHERE asset = 'PI' AND source_kind = 'system' AND source_table = 'registration_bonus'
    AND status IN ('available', 'reserved', 'paid')
    AND unique_ref NOT LIKE 'registration_bonus:testnet_100:v1:%'
  GROUP BY user_id
), campaign AS (
  SELECT DISTINCT user_id FROM public.gh_earnings_ledger_entries
  WHERE unique_ref = 'registration_bonus:testnet_100:v1:' || user_id
)
SELECT a.user_id,
       COALESCE(p.prior_atomic, 0) / 10000000.0 AS prior_registration_pi,
       GREATEST(100 - COALESCE(p.prior_atomic, 0) / 10000000.0, 0) AS expected_campaign_credit_pi,
       (c.user_id IS NOT NULL) AS campaign_already_recorded
FROM accounts a
LEFT JOIN prior p ON p.user_id = a.user_id
LEFT JOIN campaign c ON c.user_id = a.user_id
WHERE a.user_id IS NOT NULL AND btrim(a.user_id) <> ''
ORDER BY a.user_id;

-- 2) Explicit write operation. Verify the project banner/URL is Testnet first.
-- The confirmation phrase is a second guard, not a substitute for verifying the
-- target. This DO block fails and rolls back if any batch reports an error.
DO $$
DECLARE
  v_after text := '';
  v_result jsonb;
  v_processed integer := 0;
  v_credited integer := 0;
  v_already integer := 0;
  v_failed integer := 0;
  v_batch_processed integer;
  v_done boolean := false;
  v_batches integer := 0;
BEGIN
  LOOP
    v_result := public.gh_earnings_testnet_registration_bonus_backfill(
      'I_CONFIRM_THIS_IS_THE_INTENDED_TESTNET_PROJECT', v_after, 250
    );
    IF COALESCE((v_result->>'ok')::boolean, false) IS NOT TRUE THEN
      RAISE EXCEPTION 'RUN397 Testnet registration backfill failed: %',
        COALESCE(v_result->>'error', v_result::text);
    END IF;
    v_batches := v_batches + 1;
    v_batch_processed := COALESCE((v_result->>'processed')::integer, 0);
    v_processed := v_processed + v_batch_processed;
    v_credited := v_credited + COALESCE((v_result->>'credited')::integer, 0);
    v_already := v_already + COALESCE((v_result->>'alreadyMetOrPreviouslyCredited')::integer, 0);
    v_failed := v_failed + COALESCE((v_result->>'failed')::integer, 0);
    IF v_failed > 0 THEN
      RAISE EXCEPTION 'RUN397 backfill batch reported failures: %', v_result::text;
    END IF;
    v_done := COALESCE((v_result->>'done')::boolean, false);
    EXIT WHEN v_done;
    IF v_batch_processed = 0 OR COALESCE(v_result->>'nextCursor', '') <= v_after THEN
      RAISE EXCEPTION 'RUN397 backfill cursor failed to advance: %', v_result::text;
    END IF;
    v_after := v_result->>'nextCursor';
  END LOOP;
  RAISE NOTICE 'RUN397 Testnet registration backfill: batches %, processed %, credited %, already met/previously credited %, failed %',
    v_batches, v_processed, v_credited, v_already, v_failed;
END;
$$;

-- 3) Read-only post-check. A zero expected credit is valid when historical
-- registration credits already meet/exceed the cumulative 100 PI target.
SELECT user_id, unique_ref, amount_atomic / 10000000.0 AS campaign_credit_pi,
       status, created_at
FROM public.gh_earnings_ledger_entries
WHERE unique_ref = 'registration_bonus:testnet_100:v1:' || user_id
ORDER BY created_at DESC, user_id;
