# Upgrade worklog — 0.338.105 / RUN382

## Scope

Surgical repair of the Testnet Pi authentication server-verification failure identified in the 2026-11-24 08:35 UTC diagnostics. Parent is the RUN381 source derivative of the reconciled RUN379 baseline.

## Root cause

Pi SDK authentication and access-token return succeeded. GreenHaven's canonical identity-resolution write to `public.gh_pi_identities` failed at PostgREST because `supabaseRest()` passed a JSON string body without a `Content-Type`; Fetch labelled it `text/plain;charset=UTF-8`, causing `PGRST102`.

## Changes

- Centralized privileged Supabase REST headers in `lib/server/supabase/rest-headers.ts`.
- Valid JSON string bodies now receive `application/json` only when no explicit content type exists.
- Explicit content types and non-string body types retain their existing behavior.
- REST transport passes the body to this header policy; RPC JSON headers remain explicit.
- Updated affected source-contract checks and added a five-case executable header regression test to static verification.
- No identity mapping, canonical account, Pi token verification, authorization, session, database ACL, CSP, payment or financial logic was relaxed.

## Verification

`npm run verify:static` passed 63/63. Focused REST, identity, Pi CSP, treasury, and timeout contracts all passed. The Node 24.15.x dependency-backed build/typecheck/lint and live Pi Browser retest are still outstanding.

## Delivery status

The local source archive is prepared. GitHub write operations were rejected with HTTP 403 `Resource not accessible by integration`; therefore this change is not in the remote `testnet` branch. No Vercel deployment, Supabase mutation/migration, environment-variable edit, Mainnet action or payment operation occurred. Production remains NOT APPROVED.
