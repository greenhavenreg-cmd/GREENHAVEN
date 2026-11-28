# RUN476 — messaging send receipts, false-success paths and relative Supabase fetches

**Baseline:** RUN475. Source candidate only — NOT APPROVED for production. No migration, economics or UI change.

## Findings and fixes
1. **Delivery receipts were fire-and-forget.** After a message insert, the receipt write (which drives unread counts and delivery state) ignored failures. It now goes through `ensureSendReceipts`, which retries once and logs. The send still succeeds because the message is durable.
2. **Idempotent replays could leave a message without receipts.** A client replaying the same `clientMessageId` now backfills receipts (duplicates ignored).
3. **Send could report success after a rejected insert** outside production when the database was configured. It is now `PERSIST_FAILED` (HTTP 503) in every environment.
4. **Mark-read could report success after a failed RPC** outside production. It is now `RECEIPT_UPDATE_FAILED` (HTTP 503) in every environment.

5. **Server fetches with relative Supabase paths never ran.** Node cannot resolve `fetch("ghc_…?…")`, so each call threw and was swallowed into an empty or failed result. A half-finished migration to the shared REST client left these sites behind (the client was already imported in most of them). Converted to `supabaseRest` / `supabaseRpc`:
   - `lib/server/economy/notifications.ts`: record (GHC sent/received/request notifications were never stored), list (the bell's economy feed and unread count were always empty), mark-one and mark-all (the mark-one and mark-all URLs were also plain strings with literal `${…}` text, not templates).
   - `lib/server/economy/withdrawal.ts`: withdrawal history list returned null.
   - `lib/server/payments/intent-store.ts`: payment intent history failed closed in production.
   - `lib/server/identity/webauthn-store.ts`: passkey list was always empty.
   - `lib/server/revenue/revenue-event.ts`: company revenue append always reported REVENUE_APPEND_UNAVAILABLE (its single concurrent-retry is preserved).
   - `lib/server/ghpv/vote-weight.ts`, `settle-service.ts`: curation intelligence and calibration reads fell back to defaults.
   - `lib/server/health/withdrawals-health.ts`: the database probe fetched an empty URL and always reported the database unavailable.
6. **Economy mark-read told the truth badly.** Mark-one now reads back changed rows, treats an already-read row as success, returns 404 only for a missing/not-owned row and 503 for an outage. Mark-all returns the changed count, or 503 on failure instead of `marked: 0` with HTTP 200.

## Operator note
Several of these paths start executing against the live database for the first time once deployed: economy notifications, withdrawal and payment history lists, passkey listing, revenue append and the health probe. Review them on Testnet before wider release. Revenue append in particular begins writing company revenue events; confirm the `gh_company_revenue_event_append*` RPCs and reconciliation behave as expected.

## Schema cross-check
Because these calls now run for real, the columns and RPC parameters they use were checked statically against `supabase/migrations`: `ghc_economy_events`, `gh_webauthn_credentials`, `gh_reputation_intelligence`, `gh_curator_calibration`, `ghc_withdrawal_requests`, `ghc_payment_intents`, and the parameter lists of `ghc_record_notification_event` and `gh_company_revenue_event_append[_attributed]` all match. This is a source check only; the live database was not queried. A sweep of every `supabaseRest` call for body-without-method, GET-with-body and write-without-body found no further instances of the RUN475 class.

## Verification
`check-run476-messaging-send-receipts.mjs`, `check-run476-relative-supabase-fetch.mjs` and `test-run476-economy-notification-store.mjs` pass (the runtime test fails against the RUN475 notifications file and passes on the fix). The full `verify:static` suite passes. Not run: typecheck, lint, build, browser, live Testnet (dependencies and Node 24 absent).

## Not done
The bell still marks economy items read one request per id (an existing check pins this). The unread-count route still returns 0 when the store fails. Presence, edit, pin and preference writes keep their existing non-production in-memory fallback. No UI or layout work in this pass; the wider UI/UX, wallet, rewards and notification audit is still open.
