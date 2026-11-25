-- RUN377: restore only the server-side CRUD privileges required by the
-- canonical Pi identity and GH session stores.
-- The base migrations created the tables and deny-client RLS policies but did
-- not grant service_role the SELECT/INSERT/UPDATE rights used by PostgREST.
-- This migration does not alter rows, schema shape, RLS enablement, or policies.

BEGIN;

-- Remove accidental/default table privileges from client roles and stale
-- nonessential service_role privileges (TRUNCATE/REFERENCES/TRIGGER/MAINTAIN).
REVOKE ALL ON TABLE public.gh_pi_identities, public.gh_sessions
  FROM PUBLIC, anon, authenticated, service_role;

-- The application performs SELECT, INSERT and PATCH/UPDATE only on these
-- tables. It never hard-deletes identities or sessions.
GRANT SELECT, INSERT, UPDATE
  ON TABLE public.gh_pi_identities, public.gh_sessions
  TO service_role;

-- Preserve the existing deny-all client policies and RLS as defense in depth.
ALTER TABLE public.gh_pi_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gh_sessions ENABLE ROW LEVEL SECURITY;

COMMIT;
