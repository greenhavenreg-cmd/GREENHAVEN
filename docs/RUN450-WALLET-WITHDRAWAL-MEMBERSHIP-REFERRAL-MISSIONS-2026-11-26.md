# RUN450 — Wallet, withdrawal, membership, referral and mission experience repair

**Package:** `gh-connect@0.338.162`  
**Date:** 26 November 2026  
**Parent candidate:** RUN449 / `0.338.161`  
**Database migrations added:** none  
**Remote actions:** none

## Repairs implemented

### Wallet actions
- PI wallet actions now use a dedicated two-column grid with larger touch targets; GHC keeps its four-action layout. This removes the global four-column CSS override that squeezed PI Withdraw and History controls.

### PI withdrawal journey
- Rebuilt the withdrawal sheet as a bounded viewport-height surface with an independent scrolling content area and a persistent bottom action area.
- Added clear steps: amount → enter PIN → confirm PIN → final review/confirm. The second PIN entry is compared locally; the server verifies it once and returns a short-lived, amount-bound proof. Raw PIN inputs are cleared after verification.
- Added an authenticated, secret-safe payout-readiness endpoint. The UI checks Testnet executor readiness before asking for a PIN. The request endpoint independently checks automatic execution, executor key length, Pi API credentials and the Testnet wallet seed **before** reserving funds.
- Existing idempotency, wallet authorization, PIN proof, provider receipt checks and uncertain-payment reconciliation remain in place.

**Operational limitation:** the checked-in Testnet profile intentionally leaves `PI_EARNINGS_EXECUTOR_KEY`, `PI_API_KEY` / `PI_SERVER_API_KEY`, `PI_WALLET_PRIVATE_SEED` and `GH_PIN_PROOF_SECRET` blank. RUN450 does not invent or commit secrets and does not send Pi. Automatic withdrawals cannot execute until the operator supplies valid Pi Testnet credentials and the PIN signing secret in Vercel Preview. The new readiness endpoint reports missing configuration without exposing values. Existing reservations must be reconciled using the existing safe release/reconciliation path; do not create duplicate withdrawals.

### Membership
- Fixed a server-side Supabase membership lookup that used `fetch()` with a bare relative path. Node has no implicit base URL for that call, so the membership authority lookup failed and the UI showed “Status unavailable”. It now uses the shared Supabase REST client and configured service-role base URL.
- Purchases remain fail-closed when the authoritative entitlement store is unavailable; no local tier spoofing or payment-without-entitlement fallback was added.

### Referrals
- Added the missing `/join` public landing route. It validates a referral code and redirects to the app root with `?ref=...`, where the existing client capture and post-auth attribution flow runs.
- Added `/join` to the explicit public-route policy; all referral APIs remain authenticated.
- Fixed GreenHaven public-ID ensure/resolve helpers that also used bare relative `fetch()` RPC paths. They now use the shared Supabase RPC client, restoring durable GH-ID resolution when the required RPCs and service-role connection are present.
- Referral settlement now uses the existing Testnet unlock helper, respecting an explicit operator `0` or `1` and inheriting the guarded Testnet unlock only when the flag is absent. A Preview environment explicitly set to `GHC_REFERRAL_SETTLEMENT_ENABLED=0` remains disabled; set it to `1` in Testnet Preview to post qualifying referral rewards.

### Missions and challenges
- The first-post mission now opens the actual global post composer after navigating to Feed.
- Join-community guidance now explicitly tells users when they have not joined a community and directs them to Communities. The task cards explain the next action and retain server-side verification.
- The current server verifier allowlist covers `join_community`, `first_post`, `first_comment`, `meaningful_contribution`, `complete_profile`, `send_connection` and `accept_connection`. A `create_community` mission is not yet in the authoritative verifier; it needs an additive SQL verification migration before it can be marked complete safely.

**Mission reward limitation:** the current code and database intentionally enforce Daily-Claim-only GHC issuance. `gh_rewards_mission_complete` unlocks a non-financial achievement and explicitly returns `grantedGhc: 0`; the database issuance guard rejects positive GHC credits outside approved paths. RUN450 does not bypass this financial policy or add a fake claim button. To implement claimable GHC mission rewards, an approved reward schedule and a new reviewed, idempotent Testnet-only issuance migration are required.

## Verification boundary

RUN450 focused regression contract: 17/17 passed. Full `npm run verify:static`: **63/63 gates passed**, 5,405 PASS lines and zero FAIL lines. Documentation hygiene and repository consistency passed. The prebuild runner discovered **471 checks** in dry-run mode. The actual `npm run prebuild` could not execute because the workspace runtime is Node 22.16.0; the project gate requires Node.js 24.15.0 or later in the Node 24 line. A full Next.js production build, dependency-backed TypeScript check, lint, Vercel Preview run, live Supabase RPC check, Pi Testnet transfer and two-account referral/membership acceptance remain outstanding. No database migration was created or applied.

**Release:** Testnet Preview candidate only. Mainnet / Production remains **NOT APPROVED**.
