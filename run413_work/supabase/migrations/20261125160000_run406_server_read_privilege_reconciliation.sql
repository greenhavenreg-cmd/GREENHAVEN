-- RUN406: restore least-privilege server-side reads required by live app adapters.
-- Root cause confirmed against the connected Testnet DB: service_role lacked SELECT
-- on canonical social visibility tables, marketplace listing tables, and membership
-- entitlements. These REST reads therefore failed closed as POST_VISIBILITY_UNAVAILABLE,
-- Server catalog unavailable, and membership status unavailable.
-- No client role receives direct table access. Writes remain RPC-owned except the
-- existing server-only post maintenance UPDATE grant. No rows or balances are changed.
BEGIN;

DO $$
DECLARE
  v_table text;
BEGIN
  FOREACH v_table IN ARRAY ARRAY[
    'gh_posts',
    'gh_post_comments',
    'gh_post_reactions',
    'gh_post_curations',
    'gh_follows',
    'ghc_user_blocks',
    'gh_community_members',
    'gh_saves',
    'gh_marketplace_listings',
    'gh_marketplace_variants',
    'ghc_membership_entitlements'
  ] LOOP
    IF to_regclass(format('public.%I', v_table)) IS NULL THEN
      RAISE EXCEPTION 'RUN406 required table public.% is missing', v_table;
    END IF;
  END LOOP;
END;
$$;

ALTER TABLE public.gh_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gh_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gh_post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gh_post_curations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gh_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ghc_user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gh_community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gh_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gh_marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gh_marketplace_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ghc_membership_entitlements ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE
  public.gh_posts,
  public.gh_post_comments,
  public.gh_post_reactions,
  public.gh_post_curations,
  public.gh_follows,
  public.ghc_user_blocks,
  public.gh_community_members,
  public.gh_saves,
  public.gh_marketplace_listings,
  public.gh_marketplace_variants,
  public.ghc_membership_entitlements
FROM PUBLIC, anon, authenticated;

-- Visibility verifier needs these authoritative policy reads. Post maintenance
-- continues to use the already-authenticated owner/server path.
GRANT SELECT, UPDATE ON TABLE public.gh_posts TO service_role;
GRANT SELECT ON TABLE
  public.gh_post_comments,
  public.gh_post_reactions,
  public.gh_post_curations,
  public.gh_follows,
  public.ghc_user_blocks,
  public.gh_community_members,
  public.gh_saves
TO service_role;

-- Marketplace catalog and variants are read through server-only adapters.
GRANT SELECT ON TABLE
  public.gh_marketplace_listings,
  public.gh_marketplace_variants
TO service_role;

-- Membership access is mutated only by existing security-definer purchase and
-- reconciliation RPCs; the server requires SELECT for authoritative status.
GRANT SELECT ON TABLE public.ghc_membership_entitlements TO service_role;

DO $$
DECLARE
  v_table text;
BEGIN
  FOREACH v_table IN ARRAY ARRAY[
    'gh_posts','gh_post_comments','gh_post_reactions','gh_post_curations',
    'gh_follows','ghc_user_blocks','gh_community_members','gh_saves',
    'gh_marketplace_listings','gh_marketplace_variants','ghc_membership_entitlements'
  ] LOOP
    IF NOT has_table_privilege('service_role', format('public.%I', v_table), 'SELECT') THEN
      RAISE EXCEPTION 'RUN406 service_role SELECT grant missing on public.%', v_table;
    END IF;
    IF has_table_privilege('anon', format('public.%I', v_table), 'SELECT')
       OR has_table_privilege('authenticated', format('public.%I', v_table), 'SELECT') THEN
      RAISE EXCEPTION 'RUN406 client SELECT privilege unexpectedly present on public.%', v_table;
    END IF;
  END LOOP;
END;
$$;

COMMIT;
