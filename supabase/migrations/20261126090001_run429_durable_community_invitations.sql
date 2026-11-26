-- RUN429: durable community invitation lifecycle.
-- Additive only: reuses gh_communities / gh_community_members and deliberately
-- does not grant realtime chat membership when a community invitation is accepted.
-- Server API derives actor ids from the authenticated GH session; RPCs are service_role-only.
-- RUN441 lock-order correction is incorporated in the response RPC: Community -> Invitation.

CREATE TABLE IF NOT EXISTS public.gh_community_invitations (
  id text PRIMARY KEY CHECK (id ~ '^ginv_[a-f0-9]{32}$'),
  community_id text NOT NULL REFERENCES public.gh_communities(id) ON DELETE CASCADE,
  invitee_user_id text NOT NULL CHECK (length(trim(invitee_user_id)) BETWEEN 1 AND 256),
  invited_by text NOT NULL CHECK (length(trim(invited_by)) BETWEEN 1 AND 256),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined', 'revoked', 'expired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  CONSTRAINT gh_community_invitations_not_self CHECK (invitee_user_id <> invited_by)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_gh_community_invites_pending_pair
  ON public.gh_community_invitations (community_id, invitee_user_id)
  WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_gh_community_invites_inbox
  ON public.gh_community_invitations (invitee_user_id, created_at DESC)
  WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_gh_community_invites_community
  ON public.gh_community_invitations (community_id, status, created_at DESC);

ALTER TABLE public.gh_community_invitations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS gh_community_invitations_no_client ON public.gh_community_invitations;
CREATE POLICY gh_community_invitations_no_client
  ON public.gh_community_invitations FOR ALL USING (false) WITH CHECK (false);
REVOKE ALL ON TABLE public.gh_community_invitations FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.gh_community_invitation_create(
  p_community_id text, p_actor_id text, p_invitee_id text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE
  v_community public.gh_communities%ROWTYPE;
  v_role text;
  v_member_status text;
  v_invite public.gh_community_invitations%ROWTYPE;
BEGIN
  IF NULLIF(trim(p_community_id), '') IS NULL
     OR NULLIF(trim(p_actor_id), '') IS NULL
     OR NULLIF(trim(p_invitee_id), '') IS NULL
     OR length(trim(p_invitee_id)) > 256
     OR trim(p_actor_id) = trim(p_invitee_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID');
  END IF;

  SELECT * INTO v_community
  FROM public.gh_communities
  WHERE id = trim(p_community_id) AND deleted_at IS NULL
  FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', 'NOT_FOUND'); END IF;

  SELECT role INTO v_role
  FROM public.gh_community_members
  WHERE community_id = v_community.id AND gh_user_id = trim(p_actor_id) AND status = 'active';
  IF COALESCE(v_role, '') NOT IN ('owner', 'admin', 'moderator') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.gh_user_profiles p WHERE p.gh_user_id = trim(p_invitee_id)
  ) THEN RETURN jsonb_build_object('ok', false, 'error', 'USER_NOT_FOUND'); END IF;

  IF EXISTS (
    SELECT 1 FROM public.ghc_user_blocks b
    WHERE (b.blocker_id = trim(p_actor_id) AND b.blocked_id = trim(p_invitee_id))
       OR (b.blocker_id = trim(p_invitee_id) AND b.blocked_id = trim(p_actor_id))
  ) THEN RETURN jsonb_build_object('ok', false, 'error', 'BLOCKED'); END IF;

  SELECT status INTO v_member_status
  FROM public.gh_community_members
  WHERE community_id = v_community.id AND gh_user_id = trim(p_invitee_id);
  IF v_member_status = 'banned' THEN RETURN jsonb_build_object('ok', false, 'error', 'BANNED'); END IF;
  IF v_member_status = 'active' THEN RETURN jsonb_build_object('ok', false, 'error', 'ALREADY_MEMBER'); END IF;
  IF v_member_status = 'pending' THEN RETURN jsonb_build_object('ok', false, 'error', 'REQUEST_PENDING'); END IF;

  -- Community row lock above serializes invitation creation for this community.
  SELECT * INTO v_invite FROM public.gh_community_invitations
  WHERE community_id = v_community.id AND invitee_user_id = trim(p_invitee_id) AND status = 'pending'
  FOR UPDATE;
  IF FOUND AND v_invite.expires_at > now() THEN
    RETURN jsonb_build_object('ok', true, 'durable', true, 'id', v_invite.id,
      'communityId', v_invite.community_id, 'inviteeUserId', v_invite.invitee_user_id, 'idempotent', true);
  ELSIF FOUND THEN
    UPDATE public.gh_community_invitations SET status = 'expired', responded_at = now() WHERE id = v_invite.id;
  END IF;

  INSERT INTO public.gh_community_invitations (
    id, community_id, invitee_user_id, invited_by, status, created_at, responded_at, expires_at
  ) VALUES (
    'ginv_' || replace(gen_random_uuid()::text, '-', ''),
    v_community.id, trim(p_invitee_id), trim(p_actor_id), 'pending', now(), NULL, now() + interval '14 days'
  ) RETURNING * INTO v_invite;

  PERFORM public.gh_notification_inbox_create(
    'community_invite_' || v_invite.id, v_invite.invitee_user_id, v_invite.invited_by,
    'community', v_invite.community_id, 'group', 'Community invitation',
    'You were invited to ' || v_community.name,
    jsonb_build_object('kind', 'community_invitation', 'communityId', v_invite.community_id,
      'invitationId', v_invite.id, 'open', 'communities'),
    NULL, NULL, 'community_invite:' || v_invite.id, v_invite.expires_at
  );
  RETURN jsonb_build_object(
    'ok', true, 'durable', true,
    'id', v_invite.id,
    'communityId', v_invite.community_id,
    'inviteeUserId', v_invite.invitee_user_id,
    'idempotent', false
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.gh_community_invitation_list(
  p_user_id text, p_limit integer DEFAULT 50
) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE v_rows jsonb;
BEGIN
  IF NULLIF(trim(p_user_id), '') IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'USER_REQUIRED', 'invitations', '[]'::jsonb);
  END IF;
  SELECT COALESCE(jsonb_agg(row_to_json(q)::jsonb ORDER BY q."createdAt" DESC), '[]'::jsonb)
  INTO v_rows
  FROM (
    SELECT i.id, i.community_id AS "communityId", i.invited_by AS "invitedBy",
      (extract(epoch FROM i.created_at) * 1000)::bigint AS "createdAt",
      c.name AS "communityName", c.purpose, c.description, c.category, c.privacy,
      c.cover_image AS "coverImage", c.member_count AS "memberCount", c.created_by AS "createdBy"
    FROM public.gh_community_invitations i
    JOIN public.gh_communities c ON c.id = i.community_id
    WHERE i.invitee_user_id = trim(p_user_id)
      AND i.status = 'pending' AND i.expires_at > now() AND c.deleted_at IS NULL
    ORDER BY i.created_at DESC
    LIMIT LEAST(GREATEST(COALESCE(p_limit, 50), 1), 100)
  ) q;
  RETURN jsonb_build_object('ok', true, 'durable', true, 'invitations', v_rows);
END;
$$;

-- RUN441 correction incorporated: acceptance locks Community before Invitation.
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
  -- Community membership never implicitly grants Messenger membership. Intentionally no gh_conversation_members write.
  RETURN jsonb_build_object('ok', true, 'durable', true, 'accepted', true, 'idempotent', false, 'communityId', v_community.id);
END;
$$;

REVOKE ALL ON FUNCTION public.gh_community_invitation_create(text,text,text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.gh_community_invitation_list(text,integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.gh_community_invitation_respond(text,text,boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.gh_community_invitation_create(text,text,text) TO service_role;
GRANT EXECUTE ON FUNCTION public.gh_community_invitation_list(text,integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.gh_community_invitation_respond(text,text,boolean) TO service_role;

COMMENT ON TABLE public.gh_community_invitations IS
  'Durable community membership invitations. Server RPC-only; acceptance grants Community membership but never implicitly grants Chat access.';
