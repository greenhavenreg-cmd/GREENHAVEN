-- RUN390: Restore narrowly scoped server-side reads used by Membership, Feed privacy and Marketplace.
-- These tables remain server-only. RLS stays enabled and client roles retain no table privileges.
-- Membership writes continue exclusively through the existing service-role SECURITY DEFINER RPCs.

DO $$
DECLARE
  v_table text;
BEGIN
  FOREACH v_table IN ARRAY ARRAY[
    'ghc_membership_entitlements',
    'gh_user_mutes',
    'gh_marketplace_listings',
    'gh_marketplace_variants'
  ] LOOP
    IF to_regclass(format('public.%I', v_table)) IS NULL THEN
      RAISE EXCEPTION 'RUN390 required table public.% is missing', v_table;
    END IF;
  END LOOP;
END;
$$;

ALTER TABLE public.ghc_membership_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gh_user_mutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gh_marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gh_marketplace_variants ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE
  public.ghc_membership_entitlements,
  public.gh_user_mutes,
  public.gh_marketplace_listings,
  public.gh_marketplace_variants
FROM PUBLIC, anon, authenticated;

-- Read access only. Writes remain mediated by existing SECURITY DEFINER RPCs.
GRANT SELECT ON TABLE
  public.ghc_membership_entitlements,
  public.gh_user_mutes,
  public.gh_marketplace_listings,
  public.gh_marketplace_variants
TO service_role;

DO $$
DECLARE
  v_table text;
BEGIN
  FOREACH v_table IN ARRAY ARRAY[
    'ghc_membership_entitlements',
    'gh_user_mutes',
    'gh_marketplace_listings',
    'gh_marketplace_variants'
  ] LOOP
    IF NOT has_table_privilege('service_role', format('public.%I', v_table), 'SELECT') THEN
      RAISE EXCEPTION 'RUN390 service_role SELECT grant missing on public.%', v_table;
    END IF;
    IF has_table_privilege('anon', format('public.%I', v_table), 'SELECT')
       OR has_table_privilege('authenticated', format('public.%I', v_table), 'SELECT') THEN
      RAISE EXCEPTION 'RUN390 client SELECT privilege unexpectedly present on public.%', v_table;
    END IF;
  END LOOP;
END;
$$;
