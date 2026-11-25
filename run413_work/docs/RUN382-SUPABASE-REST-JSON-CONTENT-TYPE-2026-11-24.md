# RUN382 — Supabase REST JSON content-type correction (2026-11-24)

## Confirmed failure

The Testnet Pi Browser trace showed that Pi SDK authentication succeeded and returned an access token, but the GreenHaven server returned HTTP 500 during canonical Pi identity resolution. The associated Supabase/PostgREST identity INSERT failed with `PGRST102` because the request was sent as `text/plain;charset=UTF-8` rather than JSON.

## Surgical source correction

- Added `lib/server/supabase/rest-headers.ts` as the shared server-side header policy.
- `serviceHeaders` now adds `Content-Type: application/json` only when the body is a valid JSON string and the caller did not explicitly set a content type.
- Explicit content types remain unchanged. FormData, Blob, URLSearchParams and stream bodies are not assigned a forced JSON content type.
- `lib/server/supabase/rest-client.ts` now passes the request body into the shared header policy. RPC requests retain their existing explicit JSON content type.
- Service-role API key and bearer authorization remain server-side; no credential, authorization, timeout, no-store, identity immutability or session policy was weakened.
- Updated regression contracts that previously assumed the header implementation lived inside `rest-client.ts`.
- Added an executable 5-case regression test and registered it in `npm run verify:static`.

## Verification

- `npm run verify:static`: PASS, 63/63.
- Supabase REST header behavior: 5/5 cases.
- Phase 4 central Supabase client: 18/18.
- RUN377 identity/session ACL: 24 assertions.
- RUN372 identity principal: 9/9 plus 44 runtime assertions.
- RUN379 Pi CSP/auth diagnostics: 10/10.
- Social upstream timeout contract: 9/9.
- Phase 23 treasury/community contract: 15/15.
- Phase 7 treasury completion: 16/16.

## Boundaries and remaining acceptance

This is a source-only correction. It has not been committed to GitHub because the connected GitHub integration returned HTTP 403 `Resource not accessible by integration` for both contents and Git-object write operations. It has not been deployed to Vercel. No Supabase write, migration, schema change, environment-variable change, Mainnet operation, payment operation or financial mutation was performed.

After the source is pushed to `testnet` and deployed to Preview, retest Pi Browser sign-in. Acceptance requires successful `/v2/me` verification, immutable canonical identity mapping, durable GreenHaven session creation, and no server-side 500. Node 24.15.x dependency-backed typecheck/lint/build and live Preview acceptance remain outstanding. Production remains NOT APPROVED.
