-- RUN383: explicit server-role grants for durable identity and privacy reads/writes.
-- RLS remains enabled and all client roles retain zero table privileges.
-- This is additive privilege repair only: no rows, balances, or ledger state change.
BEGIN;

ALTER TABLE public.gh_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gh_user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gh_user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gh_user_mutes ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE
  public.gh_user_profiles,
  public.gh_user_achievements,
  public.gh_user_progress,
  public.gh_user_mutes
FROM PUBLIC, anon, authenticated;

-- Profile GET/PATCH and public-profile hydration; PostgREST upsert requires
-- INSERT + UPDATE and representation reads require SELECT.
GRANT SELECT, INSERT, UPDATE ON TABLE public.gh_user_profiles TO service_role;

-- Achievement reads and idempotent unlock inserts.
GRANT SELECT, INSERT ON TABLE public.gh_user_achievements TO service_role;

-- Progress is currently read-only through the server profile/achievement layer.
GRANT SELECT ON TABLE public.gh_user_progress TO service_role;

-- Feed and mute-list APIs must read the viewer's authoritative mute set.
GRANT SELECT ON TABLE public.gh_user_mutes TO service_role;

COMMIT;
