# RUN381 — Pi Testnet identity and Preview policy repair (2026-11-22)

## Baseline

`GREENHAVEN-0_338_111-TESTNET-FEATURE-ENABLEMENT-2026-11-21-1.zip` (SHA-256 `4992c71befdc6e6c21ce011e08c5c2f93fb68b034d5beb71a2b4720196bac604`).

## Surgical changes

- Aligned `PI_NETWORK_CONFIG.APP_SLUG` to `greenhaven-2tm2`, the slug shown in the operator-provided Pi Developer Portal Sandbox URL.
- Replaced the contradictory feature-enabled Testnet Preview template with a connectivity/authentication-only profile. Financial and ledger-mutating flags are explicitly false; Testnet identity and E2E scaffolding remain.
- Rewrote the Testnet Vercel operator guide and environment policy to match the authoritative 0.338.111 source-of-truth safety decision.
- Corrected the Pi API key explanation: user `/v2/me` verification is performed with the Pi access-token bearer credential; `PI_API_KEY` is for provider operations that require the app API key. A read-only Vercel audit confirmed the Pi Client ID, Pi API key, Supabase service-role key and domain-validation key entries exist for Preview/testnet; encrypted values were not decrypted or validated against Pi Portal.
- Replaced the Testnet profile regression checker with assertions for app slug, fail-closed financial flags, private credential documentation and E2E non-fabrication.
- Bumped package, lockfile and verified-manifest release identity to 0.338.112.

## Explicit non-changes

No Pi authentication flow rewrite, no change to `Pi.authenticate(["username"])`, no token/client-side identity fallback, no secrets, no SQL/migrations, no Supabase mutation, no GitHub push, no Vercel Production changes or deployment, no financial operations and no Mainnet changes.

## Validation

Targeted Node source regression checks are run on the available runtime. The workspace runtime is Node 22.16.0, while this project requires Node 24.15.x; dependency-backed typecheck, lint, production build and full prebuild are therefore not certified by this repair. Pi Portal authorization and live Sandbox authentication remain external acceptance gates.
