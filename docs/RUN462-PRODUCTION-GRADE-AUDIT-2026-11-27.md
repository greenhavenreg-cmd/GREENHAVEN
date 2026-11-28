# RUN462 — Production-grade audit and first hardening pass

**Baseline:** `gh-connect@0.338.173` / RUN461. **Status:** source candidate only — NOT APPROVED for production.

## Audit method
Static review only (no dependencies or network; Node 22, project requires `^24.15.0`). Baseline `npm run verify:static` passed before changes.

## Findings
| Area | Finding | Status |
|---|---|---|
| Rewards | `postDailyClaim`/status fetches had no timeout; a hung request left the UI stuck | Fixed |
| Withdrawal | `features/wallet/withdraw-ghc-panel.tsx` GET/POST had no timeout; generic "Network error" | Fixed (timeout; ambiguous-result copy; idempotency key retained) |
| Feed | Post overflow menu button had no accessible name or minimum touch target | Fixed |
| Withdrawal (Pi) / membership / Get GHC | PIN, readiness, membership-recovery and pack-catalogue requests had no timeout | Fixed |
| All same-origin `/api` calls | ~150 client call sites had no ceiling | Fixed centrally: 45s default in `install-api-auth-fetch.ts` (caller signals respected; streams, uploads, exports, calls excluded) |
| Screen load failures | `React.lazy` caches a failed chunk import, so "Try again" could never recover after a stale deploy or dropped connection | Fixed: chunk errors detected, one guarded auto-reload (30s loop guard), "Reload app" button |
| Wallet | History button was a dead no-op when no handler was wired | Now disabled instead |
| Touch targets | 6 dismiss/remove controls under 40px | Enlarged or hit-area expanded |
| Accessibility | Icon-only buttons and image alt text are otherwise clean; form inputs are largely label-wrapped | No action |

## Not verified
TypeScript, lint, production build, browser/device and live Testnet acceptance remain outstanding. No migration, database or provider operation was performed.

## Regression contract
`scripts/check-run462-client-request-bounds.mjs` (15 assertions) is chained into `verify:static` and `prebuild:checks`.

## Still open
Visual/layout review of feed, stories, communities, messages, profile and marketplace needs a rendered build (Node 24 + dependencies) to be judged properly; it was not done in this static pass.
