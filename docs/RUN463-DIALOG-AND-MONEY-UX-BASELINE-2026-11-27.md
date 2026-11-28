# RUN463 — Dialog, money-action and form UX baseline

**Baseline:** `gh-connect@0.338.173` / RUN461 + RUN462. **Status:** source candidate only — NOT APPROVED for production. Version unchanged (no release bump).

## What changed
| Area | Change |
|---|---|
| Shared hook | `hooks/use-dialog-a11y.ts`: Escape closes, Tab/Shift+Tab stay inside the sheet, first control is focused, focus returns to the opener, background scroll is locked (reference-counted for stacked sheets). |
| Overlays | Creator Studio, profile preview, post options, Get GHC, story creator and story viewer now expose `role="dialog"`, `aria-modal` and a name. Close controls are 44px and labelled. Profile preview no longer renders a white sheet in dark mode and uses `dvh` + safe-area padding. |
| Withdrawal (GHC) | Idempotency key is bound to the amount/wallet payload and rotates when either changes (a retry of the same request still reuses it). Submit is re-entry guarded. Address format is validated inline, submit stays disabled until valid and confirmed, inputs are 16px/44px with associated error text, and an in-review request is disclosed. |
| Get GHC | Pack purchase can no longer start two payment intents (double tap). Catalogue failure is shown as a retryable error instead of "no packs". Purchase failures are shown (previously swallowed). Operator/deployment wording removed from member copy. |
| Membership | Only one purchase may be in flight across Pi **and** GHC (previously guarded per method). Confirm sheet scrolls on short screens and clears the home indicator. |
| Toasts | Error toasts are `role="alert"`/assertive; dismiss target is 44px. |
| Forms | 100 `<button>` elements in form-free components declared `type="button"`. Touch text fields held at 16px to stop mobile zoom. |

## Verification
Static only. `npm run verify:static` passes including the new 22-assertion contract `scripts/check-run463-dialog-and-money-ux-baseline.mjs` (wired into `verify:static` and `prebuild:checks`). Changed files were syntax-checked with TypeScript `transpileModule`; JSX duplicate-prop and JSX-safety checks pass.

## Not verified / still open
TypeScript type-check, lint, production build, browser/device review and live Testnet acceptance (Node 24.15 + dependencies required). Visual layout of feed, communities, messages, profile and marketplace still needs a rendered build. `app/api/pi/staking` and `app/api/ads/verify` remain intentionally unimplemented pending official Pi endpoint documentation. No migration, database or provider operation was performed.
