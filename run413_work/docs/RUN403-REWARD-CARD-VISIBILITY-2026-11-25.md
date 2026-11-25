# GreenHaven 0.338.129 — Run 403 Reward Visibility Repair

**Baseline:** `GREENHAVEN-0.338.128-RUN402-NET-FIRST-WITHDRAWAL-COMMERCE-2026-11-25-1.zip`  
**Scope:** PI registration reward visibility and source regression gate only.

## Implemented
- Removed the silent-null path that hid the registration reward card when the Testnet campaign is disabled and the user has not claimed it.
- Added an explicit paused status with a refresh action and clear wording that display does not credit PI or change existing balances/history.
- Preserved the server-authoritative claim endpoint and empty request body; no client-supplied reward amount was added.
- Added `scripts/check-run403-reward-card-visible.mjs` and registered it in `verify:static` and `prebuild:checks`.
- Aligned package, lockfile and app release metadata to `0.338.129`.

## Verification
- `npm run verify:static`: **PASS**, exit 0, including the inherited full static chain and Run 403.
- Run 403 focused static gate: **6/6 passed**.
- Run 300 release integrity: **22/22 passed**.
- Run 301 release-gate hardening: **20/20 passed**.
- Run 383 identity/privacy grant gate: previously passed 9/9 on this baseline.
- Run 397 registration reward/referral gate: previously passed 16/16 on this baseline.
- Run 398 referral session isolation: previously passed 8/8 on this baseline.
- Run 400 sign-in UX: previously passed 4/4 on this baseline.
- Run 401 cross-surface polish: previously passed 16/16 on this baseline.
- Run 402 net-first withdrawal: previously passed on this baseline.
- Full Node 24 dependency-backed production build and browser/device acceptance remain unverified.

## Deployment boundary
This is a source archive update. No GitHub push or Vercel deployment is claimed. The connected GitHub integration denied branch creation (HTTP 403), so this repair has not been merged into the remote `testnet` branch. Testnet reward/payout flags remain disabled until database migration history and reward RPC contracts are reconciled. No PI or GHC balance was issued or altered by this source change.
