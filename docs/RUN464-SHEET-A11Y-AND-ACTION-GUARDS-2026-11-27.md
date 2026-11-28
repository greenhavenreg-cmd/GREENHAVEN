# RUN464 — Sheet accessibility and money-action re-entry guards

**Baseline:** `gh-connect@0.338.173` / RUN461–RUN463. **Status:** source candidate only — NOT APPROVED for production. Version unchanged; no migration, economics or API change.

## What changed
| Area | Change |
|---|---|
| Shared dialog hook | `useDialogA11y` (Escape, focus trap and restore, reference-counted scroll lock) now also drives: Withdraw Pi, Send / Receive / Request GHC, Share, Create hub, Confirmation dialog, Pi payment detail, GHC transaction detail, Create group and Report chooser. Each attaches the ref to its existing `role="dialog"` element with `tabIndex={-1}`; hooks run before the closed-state early return. |
| GHC requests | Pay and Cancel share a synchronous in-flight ref, so a fast double tap can no longer start two fulfilment/cancel calls before `busyId` re-renders. |
| Earnings | "Return reserved π to available" has the same synchronous guard. |
| Buttons | 6 further form-free `<button>` elements (admin treasury, A2U qualification) and 40 `onClick` buttons in the field research forms declared `type="button"`; submit buttons left as submit. |
| Contract | `scripts/check-run464-sheet-a11y-and-action-guards.mjs`, wired into `verify:static` and `prebuild:checks`. |

## Verification
`npm run verify:static` passes (including RUN464). Changed files were checked for syntax and undefined new symbols with the native `tsc` in `--noResolve` mode; this is **not** a full typecheck.

## Audit findings not yet addressed (next candidates)
- ~35 further sheets (comment, post detail, poll/challenge composers, action sheet, direct call, lightbox, notification bell, global search, messaging premium sheet, community pickers) have dialog labels but are not yet on the shared hook; several have their own Escape handling that should be consolidated.
- `profile-preview-page.tsx` and `session-lock-screen.tsx` are full-screen overlays without dialog semantics.
- Many `catch { /* */ }` blocks in membership, rewards and earnings silently swallow non-critical errors; the money-affecting ones should surface a retryable message.
- Rendered-layout review of feed, communities, messages, profile and marketplace still needs a dependency-backed build and device pass.
- TypeScript typecheck, lint, production build and live Testnet acceptance remain outstanding (Node 24.15 + dependencies). `app/api/pi/staking` and `app/api/ads/verify` remain intentionally unimplemented.
