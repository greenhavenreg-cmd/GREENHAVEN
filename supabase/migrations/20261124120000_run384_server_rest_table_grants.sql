-- RUN384: least-privilege service_role grants for tables used by server-side
-- PostgREST calls. The connected Testnet catalog showed RLS enabled but no
-- service_role table privileges on these 13 tables. The source call sites use
-- only the listed operations. No client role receives direct table access.
BEGIN;

-- Messaging membership: server-side membership checks and preference writes.
REVOKE ALL ON TABLE public.gh_conversation_members FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.gh_conversation_members TO service_role;

-- Marketplace variants are read by the server listing adapter.
REVOKE ALL ON TABLE public.gh_marketplace_variants FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.gh_marketplace_variants TO service_role;

-- Media asset metadata is read only after server-side owner/visibility checks.
REVOKE ALL ON TABLE public.gh_media_assets FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.gh_media_assets TO service_role;

-- Pi A2U execution and wallet-authorization records are read by server
-- completion/health paths; financial writes remain RPC-owned.
REVOKE ALL ON TABLE public.gh_pi_a2u_executions FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.gh_pi_a2u_executions TO service_role;
REVOKE ALL ON TABLE public.gh_pi_wallet_authorizations FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.gh_pi_wallet_authorizations TO service_role;

-- Social visibility and owner-controlled post maintenance.
REVOKE ALL ON TABLE public.gh_post_comments FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.gh_post_comments TO service_role;
REVOKE ALL ON TABLE public.gh_posts FROM PUBLIC, anon, authenticated;
GRANT SELECT, UPDATE ON TABLE public.gh_posts TO service_role;
REVOKE ALL ON TABLE public.gh_saves FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.gh_saves TO service_role;

-- Payout request rows are read for authenticated seller views and verified
-- Pi A2U processing. State transitions and settlement remain RPC-only.
REVOKE ALL ON TABLE public.gh_seller_payout_requests FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.gh_seller_payout_requests TO service_role;

-- Step-up and WebAuthn state is managed only by the trusted server identity
-- layer. Client roles remain denied; the app still validates owner/session,
-- expiry, challenge, credential and revocation state before use.
REVOKE ALL ON TABLE public.gh_step_ups FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.gh_step_ups TO service_role;
REVOKE ALL ON TABLE public.gh_webauthn_challenges FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.gh_webauthn_challenges TO service_role;
REVOKE ALL ON TABLE public.gh_webauthn_credentials FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.gh_webauthn_credentials TO service_role;

-- Durable report intake writes only; moderation reads remain on their
-- separately authorized server paths/RPCs.
REVOKE ALL ON TABLE public.ghc_community_reports FROM PUBLIC, anon, authenticated;
GRANT INSERT ON TABLE public.ghc_community_reports TO service_role;

COMMIT;
