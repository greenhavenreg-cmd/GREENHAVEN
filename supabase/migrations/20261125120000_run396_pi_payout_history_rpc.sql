-- Run #396: owner-scoped, read-only Pi payout history for the Wallet.
-- Additive only. Does not alter balances, payout states, or provider execution.
-- Must be validated on disposable PostgreSQL and reconciled against each target's
-- migration history before any application. The API receives only this safe projection.

CREATE OR REPLACE FUNCTION public.gh_pi_earnings_payout_list_owned(
  p_user_id text,
  p_limit integer DEFAULT 50
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_user text := NULLIF(trim(COALESCE(p_user_id, '')), '');
  v_limit integer := LEAST(50, GREATEST(1, COALESCE(p_limit, 50)));
  v_items jsonb;
BEGIN
  IF v_user IS NULL OR length(v_user) > 160 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_INPUT');
  END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', q.id::text,
    'status', q.status,
    'grossAtomic', q.gross_atomic::text,
    'feeAtomic', q.fee_atomic::text,
    'netAtomic', q.net_atomic::text,
    'network', q.network,
    'providerTxid', q.provider_txid,
    'createdAt', q.created_at,
    'updatedAt', q.updated_at,
    'settledAt', q.settled_at
  ) ORDER BY q.created_at DESC), '[]'::jsonb)
  INTO v_items
  FROM (
    SELECT id, status, gross_atomic, fee_atomic, net_atomic, network,
           provider_txid, created_at, updated_at, settled_at
      FROM public.gh_pi_earnings_payout_requests
     WHERE user_id = v_user
     ORDER BY created_at DESC, id DESC
     LIMIT v_limit
  ) q;

  RETURN jsonb_build_object('ok', true, 'items', v_items, 'limit', v_limit);
END;
$$;

REVOKE ALL ON FUNCTION public.gh_pi_earnings_payout_list_owned(text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.gh_pi_earnings_payout_list_owned(text, integer) TO service_role;
COMMENT ON FUNCTION public.gh_pi_earnings_payout_list_owned(text, integer) IS
  'Run #396 read-only owner-scoped Pi payout history. Safe fields only; service_role RPC only.';
