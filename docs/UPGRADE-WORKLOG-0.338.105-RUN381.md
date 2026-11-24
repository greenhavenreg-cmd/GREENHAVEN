# Upgrade worklog — 0.338.105 / RUN381

## Scope

Surgical Testnet Pi authentication CSP correction based on the user's 2026-11-24 Pi Browser diagnostics. Parent source: RUN380 derivative of the reconciled RUN379 archive.

## Finding and change

The Pi SDK initialized and invoked authentication, but enforced CSP events blocked `connect-src` to `socialchain.app` immediately before each generic SDK rejection. The parent `vercel.json` allowed this host for frames but not connections. Added the exact origin `https://socialchain.app` to `connect-src`; no wildcard or other CSP relaxation was made.

Extended `scripts/check-run379-pi-csp-auth-diagnostics.mjs` to require the exact origin and prohibit the unobserved `https://*.socialchain.app` wildcard.

## Verification and limits

Run the focused CSP diagnostic and security-header checks, plus JSON/package integrity checks. A live Pi Browser retest on the deployed Testnet Preview is still required. Backend readiness is not Pi sign-in acceptance. Node 24.15.x dependency-backed typecheck/lint/build remain as previously documented.

No GitHub push, Vercel deployment, Supabase write/migration, Mainnet action, payment operation, or Production change occurred. Production remains NOT APPROVED.
