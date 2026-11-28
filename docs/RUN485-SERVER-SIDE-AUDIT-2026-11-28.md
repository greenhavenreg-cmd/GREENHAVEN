# RUN485 — server-side API, authorization and header audit (documentation only)

**Baseline:** RUN484. Source candidate only — NOT APPROVED for production. **No source, migration, economics or policy change in this run.**

## Scope
285 `app/api/**/route.ts` files read statically (no database, no network, no build).

## Findings
1. **Authorization:** 56 routes had no recognised session helper by name. The money-moving ones were read in full and are guarded by constant-time operator/reconciliation keys (`operatorKeyAuthorized`, `assertOperatorKey`, timing-safe compare) with durable rate limits that deny when the limiter is unavailable: seller payout transition/reconcile/reconcile-ghc/reconcile-bank/execute-bank, creator-reward fund/settle, operator refunds/disputes/payout-corrections/membership renew/expire. Session routes use `resolveAuthenticatedUser` or `requireAccountSecurityContext`; revoke-other-sessions additionally requires a recent step-up. Public field/research routes are intentionally unauthenticated and were covered by earlier public-route-boundary checks.
2. **Request bodies:** all mutating routes that parse a request body use `readBoundedJson` / `readBoundedText`. The five routes that matched a raw `.json()` were parsing upstream Supabase/Paystack responses, each inside `try/catch` returning a coded 503.
3. **Upstream calls:** the routes read carry `AbortSignal.timeout`, `cache: "no-store"`, request-id validation (`gbp_`, `cbp_` patterns) and fail-closed provider/Testnet gates (`PI_A2U_TESTNET_ONLY`, live-transfer approval).
4. **Headers:** `vercel.json` sets HSTS, nosniff, Referrer-Policy, Permissions-Policy and a Pi-specific CSP with `frame-ancestors` limited to Pi hosts. `ignoreBuildErrors` and `ignoreDuringBuilds` are both `false`.

## Recommendation for review (not changed)
`script-src` still allows `'unsafe-inline'` and `'unsafe-eval'`. Moving to nonce-based scripts is worthwhile but must be tested in Pi Browser and Sandbox against Pi SDK sign-in and payment flows before release; changing it without that testing risks breaking authentication.

## Not verified
Whether migrations are applied, whether RLS matches the source, runtime behaviour, rate-limit tables, or any live Testnet flow.
