# RUN381 — Pi authentication CSP connect-source correction (2026-11-24)

**Package:** `gh-connect@0.338.105`  
**Parent:** RUN380 Pi-only Research/Field access-control source derivative.  
**Scope:** Testnet/Preview source only; no deployment or environment mutation.

## Evidence

The 2026-11-24 Testnet Pi Browser diagnostics show successful SDK initialization and authentication invocation, followed by enforced `connect-src` violations for the exact blocked host `socialchain.app` at 08:17:22Z and 08:17:24Z. Each violation immediately precedes a generic `Pi.authenticate()` rejection.

The parent `vercel.json` policy permitted `socialchain.app` in `frame-src` and `frame-ancestors`, but omitted it from `connect-src`. The browser therefore blocked the observed connection. Backend health/readiness and Supabase configuration checks passed, but those checks do not establish successful Pi authentication.

## Correction

- Added only `https://socialchain.app` to the enforced `connect-src` allowlist.
- Did not add `https://*.socialchain.app`; no subdomain connection was observed.
- Kept all other CSP directives, frame restrictions, and security headers unchanged.
- Extended the RUN379 CSP regression gate to require the exact observed origin and reject a wildcard socialchain allowlist.

## Acceptance still required

Deploy this source to the Testnet branch's Vercel Preview, then repeat Pi Browser sign-in. Confirm the diagnostics contain no enforced `connect-src@socialchain.app` violation and that the flow reaches GreenHaven's server-side Pi token verification and durable session creation. A successful `/api/health` or `/api/health/live` response is not sign-in acceptance. If a new blocked host appears, add it only after correlating its exact origin and request with the Pi SDK flow.

No GitHub push, Vercel deployment, Supabase migration/write, Mainnet action, payment operation, or production change was performed. Production remains NOT APPROVED.
