# RUN469 — overlays on the shared dialog hook, search keyboard polish, touch-target scanner fix

**Baseline:** `gh-connect@0.338.173` / RUN461–RUN468. **Status:** source candidate only — NOT APPROVED for production. Version unchanged; no migration, economics or API change.

## What changed
| Area | Change |
|---|---|
| Community join picker, connection intent picker | Moved onto `useDialogA11y` (focus trap, stack-aware Escape, scroll lock, focus restore). Their bespoke Escape/focus effects were removed. Escape and backdrop dismissal stay disabled while a request is in flight. Panels use `dvh` and are focusable. |
| GHC spend confirmation (`ghc-utility-panel`) | The "Review GHC spend" sheet had no Escape, focus trap or scroll lock. It now uses the hook, cannot be dismissed while a spend is in flight, and scrolls on short screens. |
| In-conversation message search | Escape clears the query, then closes the bar. Mobile keyboard shows a Search key. The helper text is associated with the input. |
| All search fields | 14 `type="search"` inputs across messages, marketplace, communities, wallet, rewards, membership, settings, share sheet, matching, research now set `enterKeyHint="search"`. |
| Seven more overlays | Media lightbox (arrow keys kept), post-reward panel, unified composer (Escape blocked while uploading or publishing), comment sheet and its nested attachment preview (previously three separate key handlers), notification bell, membership confirm sheet (cannot be dismissed while a payment is in flight) and membership success sheet now use `useDialogA11y`. The hook now skips `data-dialog-dismiss` backdrop buttons as tab stops and honours `data-dialog-initial-focus`, which the bell relied on. |
| Daily claim prompt | Deliberately left as is: it is a non-modal popover (`aria-modal="false"`, outside-click dismissal), so a focus trap and scroll lock would be wrong. |
| Touch targets | The RUN468 scanner ended each button at the first `=>` in its handler and treated `top-`/`drop-` classes as padding, so it missed 20 small buttons (marketplace search clear, Pi withdraw sheet, notification bell, wallet balance, comment sheet, community hub, composer, onboarding and others). All 20 now have the 44px hit area and the scanner reads tags with brace tracking. |
| Viewport units | 20 sheet and preview heights (GHC send/request/transaction detail/requests panel, wallet sheet, post options, roster, profile story, composer, messaging sheet and others) used `vh`, which extends beneath mobile browser toolbars and can hide bottom actions. They now use `dvh`, and the three splash screens use `h-dvh`. The documented `100vh` shell fallback in `globals.css` is kept. The contract rejects new `vh` or `h-screen` sizing. |
| Marketplace search | Escape clears the query. |
| Contract | `scripts/check-run469-overlay-hook-and-search-input.mjs`, in `verify:static` and `prebuild:checks`. |

## Verification
Static only. `npm run verify:static` passes with the new contract. Edited files pass a `tsc --noResolve` syntax and undefined-name pass; this is **not** a full typecheck (Node 24 and dependencies are unavailable). Browser behaviour is unverified.

## Still open
Existing contracts (social story/profile media, post interactions phase 16, phase 27, phase 11 notifications) asserted the old private handlers and were updated to assert the shared hook. Wallet, withdrawal and notification content flows were not otherwise changed. Rendered review at 320–430px, marketplace filters on the combobox pattern, and Node 24 typecheck, lint, build and live Testnet acceptance remain outstanding.
