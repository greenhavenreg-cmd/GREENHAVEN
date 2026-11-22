# GreenHaven 0.338.112 — Pi Testnet identity and Preview policy repair

Date: 2026-11-22

**Package:** `gh-connect@0.338.112`  
**Target:** `testnet` branch / Vercel Preview only  
**Status:** source-only repair candidate; not pushed or deployed.

## Baseline

User-supplied archive: `GREENHAVEN-0_338_111-TESTNET-FEATURE-ENABLEMENT-2026-11-21-1.zip`  
SHA-256: `4992c71befdc6e6c21ce011e08c5c2f93fb68b034d5beb71a2b4720196bac604`

## Changes

- Aligned `PI_NETWORK_CONFIG.APP_SLUG` with the operator-provided Pi Developer Portal Sandbox app slug `greenhaven-2tm2`.
- Reconciled the Testnet Preview profile, operator guide and environment policy with the authoritative connectivity/authentication-only contract.
- Explicitly disabled Pi purchases, rewards, referral settlement, tips, curation redistribution, Pi payout adapters/requests/execution, A2U, GHC-to-Pi withdrawal intake, marketplace payouts and Paystack transfers in the Testnet Preview template.
- Retained `PI_NETWORK=testnet`, `NEXT_PUBLIC_PI_SANDBOX=true`, `PI_ENV=production`, the Testnet identity unlock and E2E scaffolding. `*_TESTNET_ONLY=true` remains a network fence only, not authorization to execute.
- Corrected the API-key explanation: Pi `/v2/me` user identity verification uses the user's bearer access token; `PI_API_KEY` is for app-level provider operations that require it.
- Added a 13-check regression contract for the registered Pi slug, Testnet network separation, fail-closed feature flags, private credential documentation and non-fabricating E2E configuration.
- Bumped package, lockfile, in-app release marker, README, project truth and verified manifest to 0.338.112.

## Vercel Preview environment actions

A read-only audit of project `greenhaven`, Preview branch `testnet`, confirmed that entries exist for `NEXT_PUBLIC_PI_CLIENT_ID`, `PI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` and `DOMAIN_VALIDATION_KEY`. Encrypted values were not decrypted and their validity against Pi Developer Portal was not asserted. This corrects an earlier audit statement that those entries were empty.

The following financial/ledger-mutating flags were explicitly upserted to `false`, scoped only to Vercel Preview / Git branch `testnet`: Pi purchases, registration/activity rewards, referral settlement, tips, curation redistribution (including V2), atomic emission V13, GHPV daily-cap V2, Pi earnings adapters, payout requests/execution, A2U, unattended A2U, GHC withdrawals, marketplace payouts, Paystack transfers and live-transfer approval. `GHC_WITHDRAWALS_TESTNET_ONLY=true` and `PI_A2U_TESTNET_ONLY=true` were retained as network fences. No Production variables, provider credentials or secret values were changed or decrypted.

## Explicit non-changes

No Pi authentication flow rewrite; no change to `Pi.authenticate(["username"])`; no token/client-side identity fallback; no secrets added; no SQL/migrations; no Supabase mutation; no GitHub push; no Vercel deployment; no financial operation; no Mainnet change.

## External blockers and separate environment release holds

- **Testnet Preview: NOT CERTIFIED / NOT APPROVED.** The `testnet` Preview branch remains a connectivity/authentication-only candidate. External blockers are Pi Developer Portal authorization for the registered app, a successful live Pi Sandbox sign-in, successful server-side `/v2/me` token verification, durable Supabase identity/session creation and restoration, authenticated multi-account Testnet acceptance, and a fresh supported-runtime Node 24.15.0 CI/build. The Vercel Preview environment flags were made fail-closed, but this does not certify the deployment or prove the encrypted credentials are valid.
- **Mainnet: NOT APPROVED; remains untouched.** No Mainnet environment variables, credentials, database, migration history, financial state or provider configuration were changed. Mainnet requires its own independent migration-history reconciliation, database/ACL review, provider authorization, financial controls, operator approval and acceptance evidence. Testnet evidence must not be reused as Mainnet approval.
- **Production: NOT APPROVED.** No production release or promotion is authorized by this source-only candidate.

## Verification

Passed on available Node 22.16.0:

- Release hygiene: 21/21.
- Project truth: 11/11.
- Phase 1–10 upgrade pack: 20/20 (P1-B documentation contract repaired and rerun).
- Phase 10 release closure: 19/19.
- Phase 24 final release review: PASS.
- Project script integrity: 1,211 entries, no duplicates/missing scripts.
- Migration duplicate integrity: 231 files, unique versions/digests/basenames.
- Testnet profile safety: 13/13.
- RUN373 Pi auth actionable rejection: 8/8.
- RUN338 Pi auth diagnostics: 25/25.
- RUN370 Pi auth rejection metadata: 7/7.
- RUN353 Pi authentication root-cause contract: 16/16.
- RUN342 Pi auth scope isolation: 6/6.
- Phase 10 release closure: 19/19.
- Phase 10 platform acceptance: 24/24.

Phase 24 release review still requires this current worklog to be registered in the release inventory; its result is checked after worklog creation. The full Node 24.15.x prebuild, dependency-backed typecheck/lint/production build, Pi Portal authorization, live Sandbox sign-in, `/v2/me` verification, durable session restoration and authenticated Testnet acceptance remain external gates. The available runtime is Node 22.16.0; this is not a production or Testnet certification.

Production remains **NOT APPROVED**.
