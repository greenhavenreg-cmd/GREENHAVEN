# Upgrade worklog — 0.338.103 RUN376

Date: 2026-11-23  
Parent baseline: user-supplied `GREENHAVEN-0_338_102-RUN375-PI-SDK-EARLY-LOAD-2026-11-23 (1).zip`  
Package: `gh-connect@0.338.103`  
Scope: Testnet Preview readiness diagnostics and payment-health reporting.

## Findings from the supplied Testnet responses

- `/api/health/live` returned `live: true` through middleware. This establishes process/middleware liveness only.
- `/api/health` reported Pi client ID, Pi API key, durable identity/session, Supabase configuration, messaging and profile store checks as passing. It reported `dev_auth_locked` as a critical failure.
- The deployed environment reported `NODE_ENV=production` and `VERCEL_ENV=preview`. `readGhcServerEnv()` already treats `NODE_ENV=production` as a production-security runtime and forces `allowDevAuth=false`.
- `lib/server/readiness.ts` previously ignored that effective value and independently checked the raw `GHC_ALLOW_DEV_AUTH` flag. This caused a false critical blocker even though the authentication implementation hard-denied development auth.
- `/api/payments/health` returned `detail: restricted` because detailed diagnostics require the operator-key request header. The environment variable alone does not add that header to requests. This is intentional access control, not proof that Pi's API is unreachable.

## Changes made

1. `lib/server/readiness.ts` now evaluates `ghcEnv.allowDevAuth`, the same effective server-side policy used by authentication. Production-runtime hard-deny remains fail-closed. If a stale `GHC_ALLOW_DEV_AUTH` value is present, the check passes while explicitly explaining that the flag is ineffective and should be removed from Preview/Production configuration.
2. `app/api/payments/health/route.ts` now reports `paymentConfigurationReady`, `platformReady`, and overall `ready` separately. The configuration value only confirms the presence of the Pi API key and client ID; it is not a live Pi API probe or an end-to-end payment test.
3. Operator-only detailed diagnostics remain protected by `diagnosticsDetailAllowed(request)`. The `x-ghc-operator-key` header must still be supplied by an authorized request; no secret is exposed in the browser or response.
4. `.env.example` documents the server-only `GHC_OPERATOR_RECONCILE_KEY` as a blank placeholder. No secret value is included.
5. Added `scripts/check-run376-readiness-policy.mjs` and registered it in `prebuild:checks` and `verify:static`.
6. Package/release metadata advanced to `0.338.103`.

## Verification

- RUN376 readiness policy regression: **9 assertions passed**.
- The test exercises the actual `readGhcServerEnv()` policy with `NODE_ENV=production`, `VERCEL_ENV=preview`, and `GHC_ALLOW_DEV_AUTH=1`; effective dev auth remains false.
- It also verifies explicit dev-auth opt-in remains available only in a non-production runtime and that payment health retains its operator diagnostics gate.
- Dependency-backed typecheck, lint and Next.js production build were not run: this workspace provides Node 22.16.0 and no installed project dependencies; the project requires Node 24.15.0.

## Deployment and acceptance state

- Source-only change. No GitHub push, Vercel deployment, Supabase write, migration, payment, wallet, ledger or Mainnet operation was performed.
- After deployment to the Testnet branch Preview, `/api/health` should no longer show the false critical `dev_auth_locked` failure. Other genuine critical checks, if any, will remain blockers.
- `/api/payments/health` can still return restricted detail without the `x-ghc-operator-key` request header. For an authorized diagnostic request, send the same secret value stored in `GHC_OPERATOR_RECONCILE_KEY` as that header from a trusted server-side client; never expose it in client JavaScript or chat.
- Credential presence does not prove Pi API reachability, Pi Browser authentication, payment approval/completion, or database schema application. Those remain separate Testnet acceptance checks.
- Production remains **NOT APPROVED**.
