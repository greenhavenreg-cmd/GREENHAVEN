# RUN475 — messaging and verification store writes

**Baseline:** `gh-connect@0.338.173` / RUN461–RUN474. **Status:** source candidate only — NOT APPROVED for production. Version unchanged; no migration, economics, ledger or reward-formula change.

## Findings and fixes
1. **The messaging store never wrote.** The private `rest()` helper in `lib/server/messaging/message-store.ts` accepted a method, body and Prefer header but always sent a GET. Message insert, edit, soft delete, pin fallback, delivery and read receipts, presence, conversation creation and preferences all went through it, so each "write" was a list read that reported success. The helper now forwards the method, body and Prefer header.
2. **Verification requests never wrote.** `lib/server/verification/request-store.ts` had the same hard-coded GET in its `rest()` helper (create and review PATCH). Fixed the same way.
3. **Message delete could report success without deleting.** Delete now reads back the rows it changed. Zero rows is resolved as NOT_FOUND, FORBIDDEN (not your message) or an idempotent success (already deleted). A failed write is DELETE_FAILED in every environment, not only production.
4. **Wrong statuses.** Pin and delete returned 404 for store failures; they now return 503, so the client does not treat an outage as "message gone".

The other `supabaseRest(..., { method: "GET" })` call sites (marketplace listing reads, reputation verify, creator `restGet`, Pi identity lookup, withdrawals health) are genuine read-only helpers and were left unchanged.

## Operator note
Writes that were silently skipped will now execute against the live database once this is deployed. Review message send, receipts and verification request flows on Testnet before wider release.

## Verification
`node scripts/check-run475-messaging-store-writes.mjs` passes. Not run: TypeScript typecheck, lint, build (dependencies and Node 24 absent here), browser testing, live Testnet.

## Still open / not changed
- Other messaging routes (conversations, receipts, calls, presence) were not re-audited beyond the shared helper.
- No UI or layout changes in this pass.
