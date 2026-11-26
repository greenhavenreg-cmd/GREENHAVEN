-- RUN425 proposal only — do not apply until migration history is reconciled.
-- Read-only audit on 2026-11-26 found that service_role has REFERENCES,
-- TRIGGER and/or TRUNCATE on server-only identity/financial tables where the
-- application uses only service-side RPCs or narrower SELECT/INSERT/UPDATE.
-- anon and authenticated have no privileges on these tables; this proposal
-- does not add client access or alter rows, balances, or ledger state.
--
-- Before approval: inspect direct grants/default privileges and verify every
-- server code path on a disposable PostgreSQL copy. Apply only as a separately
-- reviewed Testnet migration after exact remote history reconciliation.

BEGIN;

-- Profile REST persistence requires SELECT, INSERT and UPDATE only.
REVOKE REFERENCES, TRIGGER, TRUNCATE
  ON TABLE public.gh_user_profiles
  FROM service_role;

-- These tables are consumed through server-owned functions; the application
-- does not require direct REFERENCES, TRIGGER or TRUNCATE privileges.
REVOKE REFERENCES, TRIGGER, TRUNCATE
  ON TABLE public.gh_step_ups, public.ghc_transactions, public.ghc_withdrawal_requests
  FROM service_role;

-- Keep explicit postconditions so an operator can detect inherited grants or
-- role-membership privileges that a direct REVOKE does not remove.
DO $$
BEGIN
  IF has_table_privilege('service_role', 'public.gh_user_profiles', 'TRUNCATE')
     OR has_table_privilege('service_role', 'public.gh_user_profiles', 'TRIGGER')
     OR has_table_privilege('service_role', 'public.gh_user_profiles', 'REFERENCES')
     OR has_table_privilege('service_role', 'public.gh_step_ups', 'TRUNCATE')
     OR has_table_privilege('service_role', 'public.gh_step_ups', 'TRIGGER')
     OR has_table_privilege('service_role', 'public.gh_step_ups', 'REFERENCES')
     OR has_table_privilege('service_role', 'public.ghc_transactions', 'TRUNCATE')
     OR has_table_privilege('service_role', 'public.ghc_transactions', 'TRIGGER')
     OR has_table_privilege('service_role', 'public.ghc_transactions', 'REFERENCES')
     OR has_table_privilege('service_role', 'public.ghc_withdrawal_requests', 'TRUNCATE')
     OR has_table_privilege('service_role', 'public.ghc_withdrawal_requests', 'TRIGGER')
     OR has_table_privilege('service_role', 'public.ghc_withdrawal_requests', 'REFERENCES') THEN
    RAISE EXCEPTION 'RUN425 least-privilege postcondition failed; inspect inherited/default grants';
  END IF;
END;
$$;

COMMIT;
