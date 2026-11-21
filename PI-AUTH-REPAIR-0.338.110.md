# GreenHaven Pi Authentication Repair — 0.338.110

## Source baseline

This repair is based on the supplied GreenHaven 0.338.109 archive and the `testnet` source reviewed at commit `702eeb4` (as last confirmed in the connected GitHub repository). The supplied archive root folder says `0.338.108`, while its `package.json` and lockfile say `0.338.109`; this patch normalizes the package version to `0.338.110`. Compare the extracted project with the current GitHub `testnet` branch before committing if newer changes have been pushed since that baseline.

## Root cause addressed

The previous Pi Browser flow could start `Pi.authenticate()` automatically during page bootstrap. Retry clicks made while that bootstrap was in flight were queued and replayed later with `setTimeout`, after transient browser user activation had expired. In addition, the retry path could await the App Studio parent `postMessage` credential probe before invoking Pi authentication.

## Changes

- Pi Browser and recognized Pi Sandbox page load now initialize the official Pi SDK only; they do not automatically request authorization.
- An explicit sign-in/retry tap invokes `piAuthenticateOfficial(["username"])` synchronously before any parent-bridge, SDK-init, or network await.
- Explicit Pi gesture authentication bypasses the unrelated App Studio parent-credential probe.
- If the SDK is not ready, the UI asks the user to wait and tap again rather than invoking authentication after a delayed initialization.
- Removed delayed automatic retry and queued retry behavior that could issue `Pi.authenticate()` outside a user gesture. The user can retry explicitly after the previous attempt settles.
- Preserved server-side `/api/auth/pi` verification, token handling, identity mapping, and session establishment. No client-only identity fallback was added.
- Signed-out Pi Browser sessions still pre-initialize the SDK while respecting the signed-out state.
- Updated source-level regression checks for the new user-gesture contract.

## Security and scope

No Pi server API key, Supabase service-role key, wallet seed, or other provider secret is included. No Supabase migrations are applied. No payout, withdrawal, A2U, or automatic earnings gates are enabled. No GitHub branch or Vercel deployment was changed by this archive repair.

## Validation

The updated source-level Pi auth regression checks are intended to run as part of the existing prebuild chain. A full TypeScript check, lint, production build, Pi Browser Sandbox sign-in, backend `/v2/me` verification, durable session restoration, and new-user onboarding acceptance still need to be run with Node 24 and the real Pi Testnet app configuration. This archive is a source repair candidate, not a claim of verified live authentication.
