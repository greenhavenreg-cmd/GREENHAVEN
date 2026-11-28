# RUN465 — Overlay semantics, stacked-dialog keys and control labels

**Baseline:** `gh-connect@0.338.173` / RUN461–RUN464. **Status:** source candidate only — NOT APPROVED for production. Version unchanged; no migration, economics or API change.

## What changed
| Area | Change |
|---|---|
| Defect fixed | RUN463 left the story creator and story viewer overlays with duplicate `role`, `aria-modal` and `aria-label` JSX attributes (TS17001). That fails `tsc`. Duplicates removed; the viewer keeps its per-member label. The RUN463 contract was updated to assert the corrected shape. |
| Dialog hook | `useDialogA11y` is now stack-aware: only the topmost open dialog handles Escape and Tab, so a confirm opened over a sheet no longer closes both. |
| More overlays on the hook | Poll and challenge composers, match celebration, save-to-collection, post insights, full post detail, global search, engagement roster, short video, daily reward, messaging tools, action sheet, GHC requests panel, global confirm/prompt dialog, profile preview page and the PIN lock/setup sheet (the lock sheet is now a labelled modal with a focus trap and no Escape dismissal). |
| Labels | 54 inputs, textareas and selects that relied on a placeholder or nearby text now have an accessible name (settings privacy selects, onboarding, group category, report reason, comment/post edit, share search, profile editor). The prompt dialog's visible label is bound to its input. |
| Legibility | 102 uses of 8px/9px text in 42 files raised to 10px. |
| Contract | `scripts/check-run465-overlay-semantics-and-control-labels.mjs` (duplicate-JSX-attribute scanner, img alt, placeholder-only controls, no 8/9px text, hook and overlay wiring) wired into `verify:static` and `prebuild:checks`. |

## Verification
`npm run verify:static` passes. A whole-project `tsc --noEmit --ignoreConfig --noResolve` syntax pass reports no syntax errors and no undefined-symbol errors in changed code; this is **not** a full typecheck because dependencies are absent.

## Correction to RUN464
The RUN464 note said swallowed `catch {}` blocks on money paths should surface errors. On review, the ones in membership, rewards, earnings and withdrawal only guard non-critical event dispatches and toasts; none hides a money outcome, so no change was made.

## Still open
- Rendered layout review (feed, communities, messages, profile, marketplace) needs a dependency-backed build and device pass.
- Remaining overlays with their own bespoke focus handling (comment sheet, notification bell, profile content library, post reward panel, community pickers, messaging detail panes, identity card, wallet screen sub-sheets) could be consolidated onto the hook.
- Field/research admin forms still have unlabeled controls inside generated question lists.
- TypeScript typecheck, lint, production build, browser/device and live Testnet acceptance remain outstanding (Node 24.15 + dependencies).
