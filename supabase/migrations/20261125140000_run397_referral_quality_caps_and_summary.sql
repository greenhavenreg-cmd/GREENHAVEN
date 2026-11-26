-- RUN397: referral quality controls and complete, bounded-cost status summaries.
-- Settlement remains disabled unless the server operator enables the existing flag.
-- Rewards are queued only after the verified membership-charge server path calls this RPC.

CREATE OR REPLACE FUNCTION public.ghc_referral_queue_reward(
  p_referred_user_id text,
  p_membership_reference_id text,
  p_charged_ghc numeric
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_attr public.ghc_referral_attributions%ROWTYPE;
  v_reward numeric(18,4);
  v_row public.ghc_referral_rewards%ROWTYPE;
  v_recent_count integer := 0;
BEGIN
  IF p_referred_user_id IS NULL OR btrim(p_referred_user_id) = ''
     OR length(p_referred_user_id) > 160
     OR p_membership_reference_id IS NULL OR btrim(p_membership_reference_id) = ''
     OR length(p_membership_reference_id) > 160 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_INPUT');
  END IF;
  IF p_charged_ghc IS NULL OR p_charged_ghc <= 0 OR p_charged_ghc > 1000000000 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_CHARGE');
  END IF;

  SELECT * INTO v_attr FROM public.ghc_referral_attributions WHERE referred_user_id = p_referred_user_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', true, 'queued', false, 'reason', 'NO_ATTRIBUTION');
  END IF;
  IF v_attr.referrer_user_id = p_referred_user_id THEN
    RETURN jsonb_build_object('ok', false, 'error', 'SELF_REFERRAL');
  END IF;

  -- Serialize by inviter so simultaneous requests cannot race through the cap.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('ghc_referral_reward_cap:' || v_attr.referrer_user_id, 0)
  );

  -- One qualifying referral reward per referred account, regardless of retry path.
  SELECT * INTO v_row FROM public.ghc_referral_rewards WHERE referred_user_id = p_referred_user_id;
  IF FOUND THEN
    RETURN jsonb_build_object('ok', true, 'queued', false, 'idempotent', true,
      'rewardId', v_row.id, 'status', v_row.status, 'reason', 'ALREADY_REWARDED');
  END IF;
  IF EXISTS (SELECT 1 FROM public.ghc_referral_rewards WHERE membership_reference_id = p_membership_reference_id) THEN
    RETURN jsonb_build_object('ok', true, 'queued', false, 'idempotent', true, 'reason', 'MEMBERSHIP_REFERENCE_ALREADY_REWARDED');
  END IF;

  SELECT count(*)::integer INTO v_recent_count
    FROM public.ghc_referral_rewards
   WHERE referrer_user_id = v_attr.referrer_user_id
     AND created_at >= now() - interval '30 days'
     AND status IN ('pending', 'posted');
  IF v_recent_count >= 50 THEN
    RETURN jsonb_build_object('ok', true, 'queued', false, 'reason', 'REFERRER_30_DAY_CAP');
  END IF;

  -- 5% of actual server-verified charge after discount, capped at 25 GHC.
  v_reward := LEAST(round(p_charged_ghc * 0.05, 4), 25.0000);
  IF v_reward < 0.0001 THEN
    RETURN jsonb_build_object('ok', true, 'queued', false, 'reason', 'REWARD_TOO_SMALL');
  END IF;

  INSERT INTO public.ghc_referral_rewards (
    referrer_user_id, referred_user_id, membership_reference_id, charged_ghc, reward_ghc, status
  ) VALUES (
    v_attr.referrer_user_id, p_referred_user_id, p_membership_reference_id, p_charged_ghc, v_reward, 'pending'
  ) RETURNING * INTO v_row;

  RETURN jsonb_build_object('ok', true, 'queued', true, 'rewardId', v_row.id,
    'rewardGhc', v_reward,
    'policy', '5_PERCENT_MAX_25_GHC_50_PER_30_DAYS');
END;
$$;

CREATE OR REPLACE FUNCTION public.ghc_referral_summary(p_user_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_user text := NULLIF(btrim(COALESCE(p_user_id, '')), '');
  v_attributed boolean := false;
  v_invited bigint := 0;
  v_pending_count bigint := 0;
  v_posted_count bigint := 0;
  v_pending numeric(18,4) := 0;
  v_posted numeric(18,4) := 0;
  v_blocked bigint := 0;
BEGIN
  IF v_user IS NULL OR length(v_user) > 160 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_USER');
  END IF;
  SELECT EXISTS (SELECT 1 FROM public.ghc_referral_attributions WHERE referred_user_id = v_user)
    INTO v_attributed;

  SELECT count(*) INTO v_invited FROM public.ghc_referral_attributions WHERE referrer_user_id = v_user;
  SELECT count(*) FILTER (WHERE status = 'pending'),
         count(*) FILTER (WHERE status = 'posted'),
         count(*) FILTER (WHERE status IN ('blocked', 'reversed')),
         COALESCE(sum(reward_ghc) FILTER (WHERE status = 'pending'), 0),
         COALESCE(sum(reward_ghc) FILTER (WHERE status = 'posted'), 0)
    INTO v_pending_count, v_posted_count, v_blocked, v_pending, v_posted
    FROM public.ghc_referral_rewards WHERE referrer_user_id = v_user;

  RETURN jsonb_build_object('ok', true, 'attributed', v_attributed,
    'invitedCount', v_invited,
    'pendingRewardCount', v_pending_count, 'postedRewardCount', v_posted_count,
    'blockedRewardCount', v_blocked, 'pendingRewardGhc', v_pending,
    'postedRewardGhc', v_posted, 'settlementPolicy', '5_PERCENT_MAX_25_GHC_50_PER_30_DAYS');
END;
$$;

REVOKE ALL ON FUNCTION public.ghc_referral_queue_reward(text, text, numeric) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.ghc_referral_summary(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ghc_referral_queue_reward(text, text, numeric) TO service_role;
GRANT EXECUTE ON FUNCTION public.ghc_referral_summary(text) TO service_role;

COMMENT ON FUNCTION public.ghc_referral_summary(text) IS
  'Complete account-scoped referral summary; service-role only. Aggregates all records without truncating client-side REST pages.';
COMMENT ON FUNCTION public.ghc_referral_queue_reward(text, text, numeric) IS
  'Idempotent verified-membership referral queue; 5% reward capped at 25 GHC and 50 qualifying referrals per referrer per rolling 30 days.';
