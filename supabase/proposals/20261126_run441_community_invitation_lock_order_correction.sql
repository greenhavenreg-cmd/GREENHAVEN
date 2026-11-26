-- RUN441 held correction proposal — do not apply until RUN429 migration history is reconciled
-- and this function has passed an isolated PostgreSQL 17 transaction rehearsal.
--
-- Fixes a lock-order inversion in the original RUN429 response RPC. Invitation
-- creation locks the Community row before the invitation row. Acceptance must
-- follow the same order to avoid create-vs-accept deadlocks.

CREATE OR REPLACE FUNCTION public.gh_community_invitation_respond(
  p_invitation_id text, p_actor_id text, p_accept boolean
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE
  v_invite public.gh_community_invitations%ROWTYPE;
  v_community public.gh_communities%ROWTYPE;
  v_member_status text;
  v_community_found boolean := false;
BEGIN
  IF NULLIF(trim(p_invitation_id), '') IS NULL
     OR NULLIF(trim(p_actor_id), '') IS NULL OR p_accept IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID');
  END IF;

  -- Initial unlocked lookup obtains the Community key only. It is not used as
  -- the authorization/final-state decision; the invitation is re-read FOR UPDATE.
  SELECT * INTO v_invite
  FROM public.gh_community_invitations
  WHERE id = trim(p_invitation_id) AND invitee_user_id = trim(p_actor_id);
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', 'NOT_FOUND'); END IF;

  -- Lock order is Community -> invitation, matching invitation creation.
  -- Decline does not mutate Community membership and only needs the invitation lock.
  IF p_accept THEN
    SELECT * INTO v_community
    FROM public.gh_communities
    WHERE id = v_invite.community_id AND deleted_at IS NULL
    FOR UPDATE;
    v_community_found := FOUND;
  END IF;

  SELECT * INTO v_invite
  FROM public.gh_community_invitations
  WHERE id = trim(p_invitation_id) AND invitee_user_id = trim(p_actor_id)
  FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', 'NOT_FOUND'); END IF;

  IF v_invite.status = 'accepted' AND p_accept THEN
    RETURN jsonb_build_object('ok', true, 'durable', true, 'accepted', true, 'idempotent', true, 'communityId', v_invite.community_id);
  ELSIF v_invite.status = 'declined' AND NOT p_accept THEN
    RETURN jsonb_build_object('ok', true, 'durable', true, 'accepted', false, 'idempotent', true, 'communityId', v_invite.community_id);
  END IF;
  IF v_invite.status <> 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVITE_NOT_PENDING');
  END IF;
  IF v_invite.expires_at <= now() THEN
    UPDATE public.gh_community_invitations SET status = 'expired', responded_at = now() WHERE id = v_invite.id;
    RETURN jsonb_build_object('ok', false, 'error', 'INVITE_EXPIRED');
  END IF;

  IF NOT p_accept THEN
    UPDATE public.gh_community_invitations SET status = 'declined', responded_at = now() WHERE id = v_invite.id;
    PERFORM public.gh_notification_inbox_create(
      'community_invite_declined_' || v_invite.id, v_invite.invited_by, trim(p_actor_id),
      'community', v_invite.community_id, 'group', 'Invitation declined',
      'Your community invitation was declined',
      jsonb_build_object('kind', 'community_invitation_declined', 'communityId', v_invite.community_id),
      NULL, NULL, 'community_invite_declined:' || v_invite.id, now() + interval '30 days'
    );
    RETURN jsonb_build_object('ok', true, 'durable', true, 'accepted', false, 'idempotent', false, 'communityId', v_invite.community_id);
  END IF;

  IF NOT v_community_found THEN
    UPDATE public.gh_community_invitations SET status = 'revoked', responded_at = now() WHERE id = v_invite.id;
    RETURN jsonb_build_object('ok', false, 'error', 'COMMUNITY_UNAVAILABLE');
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.ghc_user_blocks b
    WHERE (b.blocker_id = trim(p_actor_id) AND b.blocked_id = v_invite.invited_by)
       OR (b.blocker_id = v_invite.invited_by AND b.blocked_id = trim(p_actor_id))
  ) THEN RETURN jsonb_build_object('ok', false, 'error', 'BLOCKED'); END IF;

  SELECT status INTO v_member_status
  FROM public.gh_community_members
  WHERE community_id = v_community.id AND gh_user_id = trim(p_actor_id);
  IF v_member_status = 'banned' THEN RETURN jsonb_build_object('ok', false, 'error', 'BANNED'); END IF;

  INSERT INTO public.gh_community_members (community_id, gh_user_id, role, status)
  VALUES (v_community.id, trim(p_actor_id), 'member', 'active')
  ON CONFLICT (community_id, gh_user_id) DO UPDATE
    SET role = CASE WHEN public.gh_community_members.status = 'active'
      THEN public.gh_community_members.role ELSE 'member' END,
        status = CASE WHEN public.gh_community_members.status = 'banned'
          THEN 'banned' ELSE 'active' END,
        joined_at = CASE WHEN public.gh_community_members.status = 'active'
          THEN public.gh_community_members.joined_at ELSE now() END;

  UPDATE public.gh_communities
  SET member_count = (
    SELECT count(*) FROM public.gh_community_members
    WHERE community_id = v_community.id AND status = 'active'
  ), updated_at = now()
  WHERE id = v_community.id;

  UPDATE public.gh_community_invitations SET status = 'accepted', responded_at = now() WHERE id = v_invite.id;
  PERFORM public.gh_notification_inbox_create(
    'community_invite_accepted_' || v_invite.id, v_invite.invited_by, trim(p_actor_id),
    'community', v_invite.community_id, 'group', 'Invitation accepted',
    'Your invitation to ' || v_community.name || ' was accepted',
    jsonb_build_object('kind', 'community_invitation_accepted', 'communityId', v_community.id),
    NULL, NULL, 'community_invite_accepted:' || v_invite.id, now() + interval '30 days'
  );
  -- Community membership does not implicitly grant Messenger membership.
  RETURN jsonb_build_object('ok', true, 'durable', true, 'accepted', true, 'idempotent', false, 'communityId', v_community.id);
END;
$$;
REVOKE ALL ON FUNCTION public.gh_community_invitation_respond(text,text,boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.gh_community_invitation_respond(text,text,boolean) TO service_role;
