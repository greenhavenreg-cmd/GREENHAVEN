# RUN470 — money-action single-flight and premium purchase idempotency

**Baseline:** `gh-connect@0.338.173` / RUN461–RUN469. **Status:** source candidate only — NOT APPROVED for production. Version unchanged; no migration, economics, ledger or SQL change.

## Defects found in audit
| Area | Finding | Fix |
|---|---|---|
| Messaging premium purchase (`messaging-premium-sheet.tsx`, `app/api/messaging/premium/route.ts`) | The client sent no reference, so the server fell back to `msg_premium_<product>_<user>_<Date.now()>`. A double tap or a retry after a timeout produced a **different ledger reference each time and could debit GHC twice**. One tap spent GHC with no confirmation, and the sheet could be dismissed mid-purchase. | The client now keeps one stable `referenceId` per product until the purchase is confirmed and reuses it on retry. The server validates the reference shape (`^[A-Za-z0-9:_.-]{8,128}$`) **before** any spend and returns `INVALID_REFERENCE` otherwise. Purchases need an explicit Confirm step. Backdrop, Escape and close are disabled while in flight. Close button gains the 44px hit area. The server fallback is kept so older cached clients still work. |
| Pi withdrawal sheet | Submit, PIN verification and "return reserved Pi" were guarded only by React state, which updates after a render. | Synchronous ref guards, released in `finally`. The existing payload-bound idempotency key is unchanged. |
| Rewards Centre claim, Wallet matured-hold claim | Same state-only guard on a money-affecting claim. | Synchronous ref guards. |
| Payment recovery fulfilment, Pi payout authorize/revoke | Same state-only guard. | Synchronous ref guards. |

## Verification
Static only. `npm run verify:static` passes including `scripts/check-run470-money-action-single-flight.mjs` (in `verify:static` and `prebuild:checks`). Edited files pass a TypeScript **syntax** parse; this is **not** a full typecheck (dependencies absent). Browser behaviour is unverified.

## Still open
Server-side: a missing client reference still falls back to a time-based one. Making the reference mandatory is the stronger fix once no cached client can omit it; decide after the next release. Other state-only guards that are not money actions (relationship actions, post action bar, discovery) were left as is. Rendered review at 320–430px, Node 24 typecheck, lint, build and live Testnet acceptance remain outstanding.
