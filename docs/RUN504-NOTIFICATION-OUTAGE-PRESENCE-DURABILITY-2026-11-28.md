# RUN504 — Notification outage truth and messaging presence durability

**Package:** `gh-connect@0.338.175`
**Baseline:** GreenHaven v0.338.174 / RUN503.
**Status:** source candidate only — **NOT APPROVED** for production.

## Findings and repairs

1. **Unified notification unread count could look like zero on a store failure.** The count-only route now returns HTTP 503 with `ok: false` and `durable: false` when its store read fails. It does not include a synthetic `unreadCount: 0`.
2. **Unified notification list could look like an empty inbox on a store failure.** The route now returns HTTP 503 instead of HTTP 200 with an empty list and a hidden error.
3. **Social notification unread count could look like zero on a store failure or malformed count.** The route now returns HTTP 503 for failed/missing store data and for non-finite or negative counts. It no longer coerces an unavailable count to zero.
4. **Social notification list could look like a successful empty list on a store failure.** It now returns HTTP 503 when the store fails or returns an invalid list.
5. **Social notification response cache policy was incomplete.** Successful and failed responses now explicitly use `Cache-Control: no-store, private`.
6. **Messaging presence could claim durable success when a development database write failed.** `setConversationPresence` now derives `durable` from the actual REST write result. A non-production process-memory fallback may still be used, but it reports `durable: false`. Production still rejects unavailable durable storage.
7. **The notification bell could discard its last confirmed durable rows on a partial store outage.** It now snapshots the prior durable list, retains only entries from stores that failed, and includes those retained entries in unread calculation. Successful stores replace their old rows normally. Retained rows are cleared on account switch, so one account's notifications cannot appear in another account's session.
8. **Navigation attention behavior remains outage-safe.** The app shell retains the last confirmed attention counts during transient failures and clears them only for authentication denial.

## Safety boundaries

- No SQL migration, database schema, financial ledger, Pi payment, withdrawal, membership, referral, rewards or curation settlement change.
- No client-side financial authority, minting path or vote-to-mint behavior introduced.
- No production memory fallback enabled.
- No database write was performed during this source-only change.

## Verification

- `scripts/check-run504-notification-outage-presence-durability.mjs`: **15/15**.
- Full `npm run verify:static`: re-run after release metadata synchronization; record final result in current build context.
- Supported-runtime typecheck, ESLint, production build, browser/device testing and live Testnet checks: **not run**. The available Node.js 22.16.0 is below the project's `^24.15.0` requirement and dependencies are not installed.

## Operator review

After deployment to Testnet only, verify notification reads during a controlled store outage, recovery after service restoration, account switching, and presence updates across two authenticated accounts. Confirm the client preserves last-known attention counts during 5xx and clears them on 401/403. Do not promote to Mainnet until the complete release gates pass.
