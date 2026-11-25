-- Run 407: restore minimum server-side privileges for trusted earnings API routes.
-- Applied to Supabase Testnet project jhlsjnmfpakvibuuoygx on 2026-11-25.
-- RLS remains enabled. No direct client-role grants and no DELETE privilege.
GRANT SELECT, INSERT, UPDATE ON TABLE public.gh_earnings_ledger_entries TO service_role;
